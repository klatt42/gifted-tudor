import { getSupabaseClient } from '@/lib/supabase/client';
import type { Student } from '@/lib/types';

// Convert database record to Student type
function toStudent(record: Record<string, unknown>): Student {
  return {
    id: record.id as string,
    userId: record.user_id as string,
    name: record.name as string,
    grade: record.grade as string,
    birthDate: record.birth_date ? new Date(record.birth_date as string) : undefined,
    avatar: record.avatar as string,
    settings: {
      difficultyPreference: (record.difficulty_preference as Student['settings']['difficultyPreference']) || 'standard',
      subjects: (record.subjects as string[]) || ['math', 'ela'],
      learningStyle: record.learning_style as Student['settings']['learningStyle'],
      dailyGoalMinutes: (record.daily_goal_minutes as number) || 60,
    },
    xp: (record.xp as number) || 0,
    level: (record.level as string) || 'Explorer',
    streak: (record.streak as number) || 0,
    longestStreak: (record.longest_streak as number) || 0,
    lastActivityDate: record.last_activity_date ? new Date(record.last_activity_date as string) : undefined,
  };
}

export async function getStudentsByFamily(familyId: string): Promise<Student[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching students:', error);
    return [];
  }

  return (data || []).map(toStudent);
}

export async function getStudentById(studentId: string): Promise<Student | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single();

  if (error) {
    console.error('Error fetching student:', error);
    return null;
  }

  return data ? toStudent(data) : null;
}

export async function createStudent(
  familyId: string,
  userId: string,
  data: {
    name: string;
    grade: string;
    birthDate?: Date;
    avatar?: string;
    difficultyPreference?: 'standard' | 'advanced' | 'challenge';
    subjects?: string[];
  }
): Promise<Student | null> {
  const supabase = getSupabaseClient();

  const { data: student, error } = await supabase
    .from('students')
    .insert({
      family_id: familyId,
      user_id: userId,
      name: data.name,
      grade: data.grade,
      birth_date: data.birthDate?.toISOString().split('T')[0],
      avatar: data.avatar || '1',
      difficulty_preference: data.difficultyPreference || 'standard',
      subjects: data.subjects || ['math', 'ela'],
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating student:', error);
    return null;
  }

  return student ? toStudent(student) : null;
}

export async function updateStudent(
  studentId: string,
  updates: Partial<{
    name: string;
    grade: string;
    avatar: string;
    xp: number;
    level: string;
    streak: number;
    longestStreak: number;
    lastActivityDate: Date;
    difficultyPreference: 'standard' | 'advanced' | 'challenge';
    subjects: string[];
    dailyGoalMinutes: number;
  }>
): Promise<Student | null> {
  const supabase = getSupabaseClient();

  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.grade !== undefined) dbUpdates.grade = updates.grade;
  if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
  if (updates.xp !== undefined) dbUpdates.xp = updates.xp;
  if (updates.level !== undefined) dbUpdates.level = updates.level;
  if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
  if (updates.longestStreak !== undefined) dbUpdates.longest_streak = updates.longestStreak;
  if (updates.lastActivityDate !== undefined) dbUpdates.last_activity_date = updates.lastActivityDate.toISOString().split('T')[0];
  if (updates.difficultyPreference !== undefined) dbUpdates.difficulty_preference = updates.difficultyPreference;
  if (updates.subjects !== undefined) dbUpdates.subjects = updates.subjects;
  if (updates.dailyGoalMinutes !== undefined) dbUpdates.daily_goal_minutes = updates.dailyGoalMinutes;

  const { data, error } = await supabase
    .from('students')
    .update(dbUpdates)
    .eq('id', studentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating student:', error);
    return null;
  }

  return data ? toStudent(data) : null;
}

export async function addXPToStudent(studentId: string, amount: number, reason: string): Promise<void> {
  const supabase = getSupabaseClient();

  // Get current XP
  const { data: student } = await supabase
    .from('students')
    .select('xp')
    .eq('id', studentId)
    .single();

  if (!student) return;

  const newXP = (student.xp || 0) + amount;
  const newLevel = calculateLevel(newXP);

  // Update student XP and level
  await supabase
    .from('students')
    .update({ xp: newXP, level: newLevel })
    .eq('id', studentId);

  // Log XP transaction
  await supabase
    .from('xp_transactions')
    .insert({
      student_id: studentId,
      amount,
      reason,
    });
}

function calculateLevel(xp: number): string {
  if (xp < 500) return 'Explorer';
  if (xp < 1500) return 'Learner';
  if (xp < 3500) return 'Scholar';
  if (xp < 7000) return 'Achiever';
  if (xp < 12000) return 'Mastermind';
  if (xp < 20000) return 'Virtuoso';
  return 'Genius';
}
