import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface TutorChatRequest {
  studentId: string;
  sessionId?: string;
  message: string;
  subject?: string;
  context?: {
    currentTopic?: string;
    gradeLevel?: string;
    difficultyPreference?: string;
  };
  conversationHistory?: ChatMessage[];
}

// System prompt for the AI tutor
const getTutorSystemPrompt = (
  studentName: string,
  gradeLevel: string,
  subject?: string,
  currentTopic?: string,
  difficultyPreference?: string
) => `You are a warm, encouraging AI tutor named "Tudor" working with ${studentName}, a gifted ${gradeLevel} student. Your role is to:

1. **Use the Socratic Method**: Instead of giving direct answers, guide the student to discover solutions through thoughtful questions. Ask probing questions that help them think critically.

2. **Be Encouraging**: Celebrate their efforts and thought processes, not just correct answers. Use phrases like "That's great thinking!" or "I love how you approached that!"

3. **Adapt to Their Level**: ${studentName} is a gifted learner${difficultyPreference === 'challenge' ? ' who enjoys challenging problems' : difficultyPreference === 'advanced' ? ' working at an advanced level' : ''}. Provide appropriately challenging content that stretches their abilities without frustrating them.

4. **Break Down Complex Concepts**: When they're stuck, break problems into smaller steps. Use analogies and real-world examples they can relate to.

5. **Foster Curiosity**: Encourage exploration beyond the immediate question. Connect topics to broader concepts and real-world applications.

6. **Be Patient**: If they make mistakes, treat them as learning opportunities. Help them understand WHY something is wrong, not just that it's wrong.

7. **Use Markdown Formatting**: Format your responses with clear structure:
   - Use **bold** for key terms
   - Use bullet points for lists
   - Use code blocks for math expressions or code
   - Keep paragraphs short and scannable

${subject ? `Current Subject: ${subject}` : ''}
${currentTopic ? `Current Topic: ${currentTopic}` : ''}

Remember: Your goal is to help ${studentName} become a confident, independent learner who loves to explore and discover.`;

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured. Please add ANTHROPIC_API_KEY to environment.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body: TutorChatRequest = await request.json();
    const { studentId, sessionId, message, subject, context, conversationHistory = [] } = body;

    if (!studentId || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: studentId, message' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get student info
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('name, grade, difficulty_preference')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      return new Response(
        JSON.stringify({ error: 'Student not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create or get tutor session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const { data: newSession, error: sessionError } = await supabase
        .from('tutor_sessions')
        .insert({
          student_id: studentId,
          subject: subject || 'general',
          status: 'active',
        })
        .select('id')
        .single();

      if (sessionError) {
        console.error('Failed to create session:', sessionError);
      } else {
        currentSessionId = newSession?.id;
      }
    }

    // Build the system prompt
    const systemPrompt = getTutorSystemPrompt(
      student.name,
      student.grade,
      subject,
      context?.currentTopic,
      student.difficulty_preference || context?.difficultyPreference
    );

    // Build messages array with conversation history
    const messages: Anthropic.MessageParam[] = conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add the new user message
    messages.push({
      role: 'user',
      content: message,
    });

    // Save user message to database
    if (currentSessionId) {
      await supabase.from('tutor_messages').insert({
        session_id: currentSessionId,
        role: 'user',
        content: message,
      });
    }

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            system: systemPrompt,
            messages,
            stream: true,
          });

          let fullResponse = '';

          for await (const event of response) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const text = event.delta.text;
              fullResponse += text;

              // Send the chunk
              const chunk = JSON.stringify({ type: 'chunk', content: text }) + '\n';
              controller.enqueue(encoder.encode(chunk));
            }
          }

          // Save assistant response to database
          if (currentSessionId) {
            await supabase.from('tutor_messages').insert({
              session_id: currentSessionId,
              role: 'assistant',
              content: fullResponse,
            });
          }

          // Send completion message
          const done = JSON.stringify({
            type: 'done',
            sessionId: currentSessionId,
            fullResponse,
          }) + '\n';
          controller.enqueue(encoder.encode(done));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorMsg = JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Streaming failed',
          }) + '\n';
          controller.enqueue(encoder.encode(errorMsg));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Tutor chat error:', error);

    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// GET endpoint to retrieve chat history for a session
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const studentId = searchParams.get('studentId');

    if (!sessionId && !studentId) {
      return new Response(
        JSON.stringify({ error: 'Provide sessionId or studentId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (sessionId) {
      // Get messages for a specific session
      const { data: messages, error } = await supabase
        .from('tutor_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ messages }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get all sessions for a student
    const { data: sessions, error } = await supabase
      .from('tutor_sessions')
      .select('*, tutor_messages(count)')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ sessions }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Get chat history error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to retrieve chat history' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
