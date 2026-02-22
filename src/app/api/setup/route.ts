import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

// Create admin client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { familyName } = await request.json();

    if (!familyName) {
      return NextResponse.json(
        { error: 'Family name is required' },
        { status: 400 }
      );
    }

    // Check if user already has a family
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('family_id')
      .eq('id', user.id)
      .single();

    if (existingUser?.family_id) {
      return NextResponse.json(
        { error: 'User already has a family', familyId: existingUser.family_id },
        { status: 400 }
      );
    }

    // Create family using admin client (bypasses RLS)
    const { data: family, error: familyError } = await supabaseAdmin
      .from('families')
      .insert({ name: familyName })
      .select('id')
      .single();

    if (familyError) {
      console.error('Error creating family:', familyError);
      return NextResponse.json(
        { error: 'Failed to create family' },
        { status: 500 }
      );
    }

    // Check if user record exists
    const { data: userExists } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (userExists) {
      // Update existing user with family ID
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ family_id: family.id })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating user:', updateError);
        return NextResponse.json(
          { error: 'Failed to update user' },
          { status: 500 }
        );
      }
    } else {
      // Create user record with family ID
      const { error: createUserError } = await supabaseAdmin
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          family_id: family.id,
          role: 'parent',
        });

      if (createUserError) {
        console.error('Error creating user:', createUserError);
        return NextResponse.json(
          { error: 'Failed to create user record' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      familyId: family.id,
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Setup failed' },
      { status: 500 }
    );
  }
}
