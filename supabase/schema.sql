-- GiftedTudor Database Schema
-- Run this in Supabase SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- FAMILIES & USERS
-- ============================================

-- Families (household grouping)
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (parents and students)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE SET NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('parent', 'student')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students (child profiles managed by parents)
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  birth_date DATE,
  avatar TEXT DEFAULT '1',
  -- Settings
  difficulty_preference TEXT DEFAULT 'standard' CHECK (difficulty_preference IN ('standard', 'advanced', 'challenge')),
  subjects TEXT[] DEFAULT ARRAY['math', 'ela'],
  learning_style TEXT CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading')),
  daily_goal_minutes INTEGER DEFAULT 60,
  -- Gamification
  xp INTEGER DEFAULT 0,
  level TEXT DEFAULT 'Explorer',
  streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CURRICULUM & CONTENT
-- ============================================

-- Subjects
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default subjects
INSERT INTO subjects (name, icon, color, description) VALUES
  ('Language Arts', 'BookOpen', 'bg-indigo-500', 'Reading, writing, grammar, and literature'),
  ('Mathematics', 'Calculator', 'bg-emerald-500', 'Arithmetic, algebra, geometry, and problem solving'),
  ('Science', 'Microscope', 'bg-amber-500', 'Life science, earth science, physical science'),
  ('Social Studies', 'Globe', 'bg-rose-500', 'History, geography, civics, and economics'),
  ('Creative Arts', 'Palette', 'bg-violet-500', 'Visual arts, music, and creative expression');

-- Standards (state and national standards)
CREATE TABLE standards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  state TEXT NOT NULL, -- 'common_core', 'MD', 'VA', etc.
  grade TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(state, code)
);

-- Topics (curriculum units)
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  prerequisites UUID[] DEFAULT ARRAY[]::UUID[],
  grade_min INTEGER NOT NULL,
  grade_max INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons (individual learning sessions)
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 10),
  duration_min INTEGER NOT NULL,
  objectives TEXT[] DEFAULT ARRAY[]::TEXT[],
  standards TEXT[] DEFAULT ARRAY[]::TEXT[],
  blooms_level TEXT CHECK (blooms_level IN ('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities (tasks within lessons)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reading', 'practice', 'project', 'assessment', 'video', 'interactive')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 10),
  blooms_level TEXT CHECK (blooms_level IN ('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create')),
  estimated_minutes INTEGER NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LEARNING PROGRESS
-- ============================================

-- Enrollments (student enrolled in subjects)
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  current_topic_id UUID REFERENCES topics(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id)
);

-- Progress (activity completion records)
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  score DECIMAL(5,2),
  time_spent INTEGER, -- seconds
  hints_used INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 1
);

-- Mastery (topic mastery levels)
CREATE TABLE mastery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 0 CHECK (level BETWEEN 0 AND 7),
  last_assessed TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, topic_id)
);

-- ============================================
-- AI TUTOR
-- ============================================

-- Tutor Sessions
CREATE TABLE tutor_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Tutor Messages
CREATE TABLE tutor_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES tutor_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GAMIFICATION
-- ============================================

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  criteria_type TEXT NOT NULL CHECK (criteria_type IN ('streak', 'xp', 'lessons', 'mastery', 'subject')),
  criteria_threshold INTEGER NOT NULL,
  criteria_subject_id UUID REFERENCES subjects(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default achievements
INSERT INTO achievements (name, description, icon, criteria_type, criteria_threshold) VALUES
  ('First Steps', 'Complete your first lesson', '🎯', 'lessons', 1),
  ('Week Warrior', 'Maintain a 7-day streak', '🔥', 'streak', 7),
  ('Dedicated Learner', 'Maintain a 30-day streak', '💪', 'streak', 30),
  ('Century Club', 'Earn 100 XP', '⭐', 'xp', 100),
  ('XP Champion', 'Earn 1000 XP', '🏆', 'xp', 1000),
  ('Knowledge Seeker', 'Complete 10 lessons', '📚', 'lessons', 10),
  ('Scholar', 'Complete 50 lessons', '🎓', 'lessons', 50),
  ('Topic Master', 'Achieve mastery level 7 in any topic', '👑', 'mastery', 7);

-- Student Achievements
CREATE TABLE student_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, achievement_id)
);

-- XP Transactions
CREATE TABLE xp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ASSESSMENTS
-- ============================================

-- Assessments
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('quiz', 'test', 'project')),
  questions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessment Results
CREATE TABLE assessment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]',
  feedback TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ASSIGNMENTS (Parent-created tasks)
-- ============================================

CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('practice', 'project', 'assessment')),
  difficulty TEXT DEFAULT 'standard' CHECK (difficulty IN ('standard', 'advanced', 'challenge')),
  due_date DATE,
  estimated_minutes INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Users can see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Family members can see family data
CREATE POLICY "Family members can view family" ON families
  FOR SELECT USING (
    id IN (SELECT family_id FROM users WHERE id = auth.uid())
  );

-- Parents can manage students in their family
CREATE POLICY "Parents can view family students" ON students
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Parents can create students" ON students
  FOR INSERT WITH CHECK (
    family_id IN (SELECT family_id FROM users WHERE id = auth.uid() AND role = 'parent')
  );

CREATE POLICY "Parents can update family students" ON students
  FOR UPDATE USING (
    family_id IN (SELECT family_id FROM users WHERE id = auth.uid() AND role = 'parent')
  );

-- Students can view their own data
CREATE POLICY "Students can view own enrollments" ON enrollments
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE family_id IN (SELECT family_id FROM users WHERE id = auth.uid()))
  );

CREATE POLICY "Students can view own progress" ON progress
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE family_id IN (SELECT family_id FROM users WHERE id = auth.uid()))
  );

CREATE POLICY "Students can insert progress" ON progress
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM students WHERE family_id IN (SELECT family_id FROM users WHERE id = auth.uid()))
  );

CREATE POLICY "Students can view own mastery" ON mastery
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE family_id IN (SELECT family_id FROM users WHERE id = auth.uid()))
  );

CREATE POLICY "Students can view own tutor sessions" ON tutor_sessions
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE family_id IN (SELECT family_id FROM users WHERE id = auth.uid()))
  );

CREATE POLICY "Students can create tutor sessions" ON tutor_sessions
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM students WHERE family_id IN (SELECT family_id FROM users WHERE id = auth.uid()))
  );

CREATE POLICY "Students can view own tutor messages" ON tutor_messages
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM tutor_sessions WHERE student_id IN (
        SELECT id FROM students WHERE family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Students can create tutor messages" ON tutor_messages
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM tutor_sessions WHERE student_id IN (
        SELECT id FROM students WHERE family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Students can view own achievements" ON student_achievements
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE family_id IN (SELECT family_id FROM users WHERE id = auth.uid()))
  );

CREATE POLICY "Students can view own XP transactions" ON xp_transactions
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE family_id IN (SELECT family_id FROM users WHERE id = auth.uid()))
  );

CREATE POLICY "Students can view own assessment results" ON assessment_results
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE family_id IN (SELECT family_id FROM users WHERE id = auth.uid()))
  );

CREATE POLICY "Family can view assignments" ON assignments
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE family_id IN (SELECT family_id FROM users WHERE id = auth.uid()))
  );

CREATE POLICY "Parents can create assignments" ON assignments
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM students WHERE family_id IN (SELECT family_id FROM users WHERE id = auth.uid() AND role = 'parent'))
  );

CREATE POLICY "Parents can update assignments" ON assignments
  FOR UPDATE USING (
    student_id IN (SELECT id FROM students WHERE family_id IN (SELECT family_id FROM users WHERE id = auth.uid() AND role = 'parent'))
  );

-- Public read access for reference tables
CREATE POLICY "Anyone can view subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Anyone can view standards" ON standards FOR SELECT USING (true);
CREATE POLICY "Anyone can view topics" ON topics FOR SELECT USING (true);
CREATE POLICY "Anyone can view lessons" ON lessons FOR SELECT USING (true);
CREATE POLICY "Anyone can view activities" ON activities FOR SELECT USING (true);
CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Anyone can view assessments" ON assessments FOR SELECT USING (true);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_users_family ON users(family_id);
CREATE INDEX idx_students_family ON students(family_id);
CREATE INDEX idx_students_user ON students(user_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_progress_student ON progress(student_id);
CREATE INDEX idx_progress_activity ON progress(activity_id);
CREATE INDEX idx_mastery_student ON mastery(student_id);
CREATE INDEX idx_tutor_sessions_student ON tutor_sessions(student_id);
CREATE INDEX idx_tutor_messages_session ON tutor_messages(session_id);
CREATE INDEX idx_assignments_student ON assignments(student_id);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);
CREATE INDEX idx_lessons_topic ON lessons(topic_id);
CREATE INDEX idx_activities_lesson ON activities(lesson_id);
CREATE INDEX idx_topics_subject ON topics(subject_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'parent');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- DONE
-- ============================================
-- Schema created successfully!
-- Next: Set up authentication in Supabase dashboard
