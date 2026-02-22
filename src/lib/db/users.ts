import { getSupabaseClient } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  familyId: string | null;
  email: string;
  fullName: string | null;
  role: 'parent' | 'student';
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data
    ? {
        id: data.id,
        familyId: data.family_id,
        email: data.email,
        fullName: data.full_name,
        role: data.role,
      }
    : null;
}

export async function createFamily(name: string): Promise<string | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('families')
    .insert({ name })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating family:', error);
    return null;
  }

  return data?.id || null;
}

export async function updateUserFamily(userId: string, familyId: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('users')
    .update({ family_id: familyId })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user family:', error);
    return false;
  }

  return true;
}

export async function updateUserProfile(
  userId: string,
  updates: { fullName?: string }
): Promise<boolean> {
  const supabase = getSupabaseClient();

  const dbUpdates: Record<string, unknown> = {};
  if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;

  const { error } = await supabase
    .from('users')
    .update(dbUpdates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating user profile:', error);
    return false;
  }

  return true;
}

// Setup user after signup - create family and update user
export async function setupNewUser(userId: string, familyName: string): Promise<string | null> {
  // Create a family for the user
  const familyId = await createFamily(familyName);
  if (!familyId) return null;

  // Update user with family ID
  const success = await updateUserFamily(userId, familyId);
  if (!success) return null;

  return familyId;
}
