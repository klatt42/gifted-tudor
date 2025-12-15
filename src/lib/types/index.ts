// GiftedTudor Core Types

// User & Family Types
export interface Family {
  id: string;
  name: string;
  createdAt: Date;
}

export interface User {
  id: string;
  familyId: string;
  email: string;
  role: 'parent' | 'student';
  createdAt: Date;
}

export interface Student {
  id: string;
  userId: string;
  name: string;
  grade: string;
  birthDate?: Date;
  avatar: string;
  settings: StudentSettings;
  // Gamification
  xp: number;
  level: string;
  streak: number;
  longestStreak: number;
  lastActivityDate?: Date;
}

export interface StudentSettings {
  difficultyPreference: 'standard' | 'advanced' | 'challenge';
  subjects: string[];
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  dailyGoalMinutes: number;
}

// Curriculum Types
export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  description: string;
  prerequisites: string[];
  gradeRange: { min: number; max: number };
}

export interface Lesson {
  id: string;
  topicId: string;
  title: string;
  content: string;
  difficulty: number; // 1-10
  durationMin: number;
  objectives: string[];
  standards: string[];
  bloomsLevel: BloomsLevel;
  activities: Activity[];
}

export interface Activity {
  id: string;
  lessonId: string;
  type: 'reading' | 'practice' | 'project' | 'assessment' | 'video' | 'interactive';
  title: string;
  content: string;
  difficulty: number;
  bloomsLevel: BloomsLevel;
  estimatedMinutes: number;
}

export type BloomsLevel =
  | 'remember'
  | 'understand'
  | 'apply'
  | 'analyze'
  | 'evaluate'
  | 'create';

// Progress Tracking
export interface Progress {
  id: string;
  studentId: string;
  activityId: string;
  completedAt: Date;
  score: number;
  timeSpent: number; // seconds
  hintsUsed: number;
  attempts: number;
}

export interface Mastery {
  studentId: string;
  topicId: string;
  level: number; // 0-7
  lastAssessed: Date;
}

export interface Streak {
  studentId: string;
  current: number;
  longest: number;
  lastActivityDate: Date;
}

// AI Tutor
export interface TutorSession {
  id: string;
  studentId: string;
  lessonId?: string;
  startedAt: Date;
  endedAt?: Date;
}

export interface TutorMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

// Gamification
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: AchievementCriteria;
}

export interface AchievementCriteria {
  type: 'streak' | 'xp' | 'lessons' | 'mastery' | 'subject';
  threshold: number;
  subjectId?: string;
}

export interface StudentAchievement {
  studentId: string;
  achievementId: string;
  earnedAt: Date;
}

export interface XPTransaction {
  id: string;
  studentId: string;
  amount: number;
  reason: string;
  createdAt: Date;
}

// Assessments
export interface Assessment {
  id: string;
  lessonId: string;
  title: string;
  type: 'quiz' | 'test' | 'project';
  questions: Question[];
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'short_answer' | 'essay' | 'math';
  content: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
  rubric?: string;
}

export interface AssessmentResult {
  id: string;
  studentId: string;
  assessmentId: string;
  score: number;
  maxScore: number;
  answers: AnswerRecord[];
  completedAt: Date;
  feedback?: string;
}

export interface AnswerRecord {
  questionId: string;
  answer: string;
  correct: boolean;
  points: number;
  feedback?: string;
}

// Dashboard Types
export interface DashboardStats {
  assignmentsCompleted: number;
  achievementsEarned: number;
  avgMasteryRate: number;
  learningTimeThisWeek: number; // minutes
}

export interface SubjectProgress {
  subject: Subject;
  progress: number; // 0-100
  currentUnit: string;
  masteryLevel: number; // 0-7
  assignmentsDue: number;
}

export interface TodayAssignment {
  id: string;
  subject: string;
  title: string;
  duration: string;
  type: 'practice' | 'project' | 'assessment';
  difficulty: 'standard' | 'advanced' | 'challenge';
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CurriculumGenerationRequest {
  studentId: string;
  subjectId: string;
  topics: string[];
  duration: 'day' | 'week' | 'month';
  difficulty: 'standard' | 'advanced' | 'challenge';
}

export interface CurriculumGenerationResponse {
  lessons: Lesson[];
  estimatedDuration: number;
  standardsCovered: string[];
}
