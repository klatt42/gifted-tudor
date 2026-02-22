import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface GenerateCurriculumRequest {
  studentId: string;
  subject: string;
  topic?: string;
  grade: string;
  difficultyPreference: 'standard' | 'advanced' | 'challenge';
  duration?: number; // in weeks
  interests?: string[];
}

interface LessonPlan {
  title: string;
  objective: string;
  duration: string;
  activities: {
    name: string;
    type: 'instruction' | 'practice' | 'assessment' | 'enrichment';
    description: string;
    duration: string;
    materials?: string[];
  }[];
  assessmentCriteria: string[];
  extensions?: string[];
  resources?: { title: string; url?: string; type: string }[];
}

interface CurriculumResponse {
  topic: string;
  gradeLevel: string;
  difficulty: string;
  overview: string;
  learningObjectives: string[];
  prerequisites?: string[];
  lessonPlans: LessonPlan[];
  totalDuration: string;
  standards?: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured. Please add ANTHROPIC_API_KEY to environment.' },
        { status: 503 }
      );
    }

    const body: GenerateCurriculumRequest = await request.json();
    const { studentId, subject, topic, grade, difficultyPreference, duration = 1, interests = [] } = body;

    if (!studentId || !subject || !grade) {
      return NextResponse.json(
        { error: 'Missing required fields: studentId, subject, grade' },
        { status: 400 }
      );
    }

    // Verify student belongs to user's family
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*, families!inner(id)')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Build the curriculum generation prompt
    const difficultyDescriptions = {
      standard: 'grade-appropriate content',
      advanced: '1-2 grades above the current level, more challenging problems',
      challenge: 'highly accelerated content, complex problem-solving, research components',
    };

    const interestContext = interests.length > 0
      ? `The student has shown interest in: ${interests.join(', ')}. Try to incorporate these interests where relevant.`
      : '';

    const prompt = `You are an expert curriculum designer specializing in gifted and talented education. Create a detailed, engaging curriculum unit for a gifted student.

Student Profile:
- Grade Level: ${grade}
- Subject: ${subject}
- Difficulty Preference: ${difficultyPreference} (${difficultyDescriptions[difficultyPreference]})
- Duration: ${duration} week(s)
${topic ? `- Specific Topic: ${topic}` : '- Generate an age-appropriate, engaging topic'}
${interestContext}

Requirements:
1. Create a curriculum unit that challenges a gifted learner
2. Include hands-on activities and project-based learning
3. Incorporate critical thinking and problem-solving
4. Allow for student choice and creativity
5. Include extension activities for those who finish early
6. Align with common core or state standards where applicable

Generate a comprehensive curriculum response in the following JSON format:
{
  "topic": "specific topic title",
  "gradeLevel": "${grade}",
  "difficulty": "${difficultyPreference}",
  "overview": "2-3 sentence overview of the unit",
  "learningObjectives": ["objective 1", "objective 2", ...],
  "prerequisites": ["skill 1", "skill 2", ...],
  "lessonPlans": [
    {
      "title": "Lesson title",
      "objective": "What students will learn",
      "duration": "45 minutes",
      "activities": [
        {
          "name": "Activity name",
          "type": "instruction|practice|assessment|enrichment",
          "description": "Detailed description",
          "duration": "10 minutes",
          "materials": ["material 1", "material 2"]
        }
      ],
      "assessmentCriteria": ["criterion 1", "criterion 2"],
      "extensions": ["extension activity 1"],
      "resources": [{"title": "Resource name", "type": "video|article|interactive", "url": "optional url"}]
    }
  ],
  "totalDuration": "X hours over Y weeks",
  "standards": ["Standard 1", "Standard 2"]
}

Generate ${Math.ceil(duration * 3)} lesson plans for this unit. Each lesson should build on the previous one.
Respond ONLY with the JSON object, no additional text.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract the text content
    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    // Parse the JSON response
    let curriculum: CurriculumResponse;
    try {
      // Remove any markdown code blocks if present
      let jsonText = textContent.text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.slice(7);
      }
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.slice(3);
      }
      if (jsonText.endsWith('```')) {
        jsonText = jsonText.slice(0, -3);
      }
      curriculum = JSON.parse(jsonText.trim());
    } catch {
      console.error('Failed to parse AI response:', textContent.text);
      return NextResponse.json(
        { error: 'Failed to parse curriculum response' },
        { status: 500 }
      );
    }

    // Save curriculum to database
    const { data: savedCurriculum, error: saveError } = await supabase
      .from('lessons')
      .insert({
        student_id: studentId,
        subject: subject,
        topic: curriculum.topic,
        grade_level: grade,
        difficulty: difficultyPreference,
        content: curriculum,
        generated_by: 'claude-sonnet-4',
        status: 'draft',
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save curriculum:', saveError);
      // Still return the curriculum even if save fails
    }

    return NextResponse.json({
      success: true,
      curriculum,
      savedId: savedCurriculum?.id,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    });
  } catch (error) {
    console.error('Curriculum generation error:', error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `AI API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate curriculum' },
      { status: 500 }
    );
  }
}
