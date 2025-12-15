'use client';

import React, { useState } from 'react';
import {
  User,
  BookOpen,
  Calculator,
  Microscope,
  Globe,
  Palette,
  Award,
  TrendingUp,
  Calendar,
  Settings,
  Bell,
  ChevronRight,
  Star,
  Zap,
  Target,
  Clock,
  Play,
  CheckCircle,
  Trophy,
  Flame,
} from 'lucide-react';
import type { Student, SubjectProgress, TodayAssignment } from '@/lib/types';

// Demo data - will be replaced with real data from Supabase
const demoChildren: Student[] = [
  {
    id: '1',
    userId: 'u1',
    name: 'Emma',
    grade: '4th Grade',
    birthDate: new Date('2015-03-15'),
    avatar: '1',
    settings: {
      difficultyPreference: 'advanced',
      subjects: ['math', 'science', 'ela'],
      dailyGoalMinutes: 60,
    },
    xp: 4520,
    level: 'Scholar',
    streak: 12,
    longestStreak: 15,
    lastActivityDate: new Date(),
  },
  {
    id: '2',
    userId: 'u1',
    name: 'Lucas',
    grade: '7th Grade',
    birthDate: new Date('2012-07-22'),
    avatar: '2',
    settings: {
      difficultyPreference: 'challenge',
      subjects: ['math', 'science', 'ela', 'social'],
      dailyGoalMinutes: 90,
    },
    xp: 8920,
    level: 'Mastermind',
    streak: 28,
    longestStreak: 28,
    lastActivityDate: new Date(),
  },
  {
    id: '3',
    userId: 'u1',
    name: 'Sofia',
    grade: '2nd Grade',
    birthDate: new Date('2017-11-08'),
    avatar: '3',
    settings: {
      difficultyPreference: 'standard',
      subjects: ['math', 'ela'],
      dailyGoalMinutes: 30,
    },
    xp: 1890,
    level: 'Explorer',
    streak: 5,
    longestStreak: 8,
    lastActivityDate: new Date(),
  },
];

const subjects: SubjectProgress[] = [
  {
    subject: { id: 's1', name: 'Language Arts', icon: 'BookOpen', color: 'bg-indigo-500' },
    progress: 72,
    currentUnit: 'Literary Analysis',
    masteryLevel: 4,
    assignmentsDue: 3,
  },
  {
    subject: { id: 's2', name: 'Mathematics', icon: 'Calculator', color: 'bg-emerald-500' },
    progress: 88,
    currentUnit: 'Pre-Algebra',
    masteryLevel: 6,
    assignmentsDue: 2,
  },
  {
    subject: { id: 's3', name: 'Science', icon: 'Microscope', color: 'bg-amber-500' },
    progress: 65,
    currentUnit: 'Earth Systems',
    masteryLevel: 3,
    assignmentsDue: 4,
  },
  {
    subject: { id: 's4', name: 'Social Studies', icon: 'Globe', color: 'bg-rose-500' },
    progress: 54,
    currentUnit: 'World Cultures',
    masteryLevel: 2,
    assignmentsDue: 1,
  },
  {
    subject: { id: 's5', name: 'Creative Arts', icon: 'Palette', color: 'bg-violet-500' },
    progress: 91,
    currentUnit: 'Digital Art',
    masteryLevel: 5,
    assignmentsDue: 0,
  },
];

const todaysAssignments: TodayAssignment[] = [
  {
    id: 'a1',
    subject: 'Mathematics',
    title: 'Algebraic Expressions Practice',
    duration: '25 min',
    type: 'practice',
    difficulty: 'advanced',
  },
  {
    id: 'a2',
    subject: 'Language Arts',
    title: 'Character Analysis Essay',
    duration: '40 min',
    type: 'project',
    difficulty: 'challenge',
  },
  {
    id: 'a3',
    subject: 'Science',
    title: 'Plate Tectonics Quiz',
    duration: '15 min',
    type: 'assessment',
    difficulty: 'standard',
  },
];

const recentAchievements = [
  { title: 'Math Wizard', description: '100% on algebra assessment', icon: '1', date: 'Today' },
  { title: '7-Day Streak', description: 'Learning every day!', icon: '2', date: 'Today' },
  { title: 'Deep Diver', description: 'Completed enrichment module', icon: '3', date: 'Yesterday' },
];

// Avatar mapping
const avatarEmojis: Record<string, string> = {
  '1': '1',
  '2': '2',
  '3': '3',
};

const avatarColors: Record<string, string> = {
  '1': 'from-purple-500 to-pink-500',
  '2': 'from-blue-500 to-cyan-500',
  '3': 'from-amber-500 to-orange-500',
};

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  BookOpen,
  Calculator,
  Microscope,
  Globe,
  Palette,
};

// Progress Ring Component
const ProgressRing = ({
  progress,
  size = 80,
  strokeWidth = 8,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-gray-700">{progress}%</span>
      </div>
    </div>
  );
};

export default function ParentDashboard() {
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);
  const children = demoChildren;

  // Calculate weekly progress (demo)
  const getWeeklyProgress = (student: Student) => {
    // In production, this would calculate from actual progress data
    return Math.min(100, Math.round((student.xp % 1000) / 10));
  };

  // Family Overview (no child selected)
  if (!selectedChild) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  GiftedTudor
                </h1>
                <p className="text-xs text-slate-500">Parent Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-medium">
                P
              </div>
            </div>
          </div>
        </header>

        {/* Child Selection */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome back!</h2>
            <p className="text-slate-600">Select a child to view their learning dashboard</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-indigo-200 text-left group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarColors[child.avatar]} flex items-center justify-center text-3xl shadow-lg`}
                  >
                    {child.avatar === '1' ? '1' : child.avatar === '2' ? '2' : '3'}
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Flame className="w-4 h-4" />
                    <span className="text-sm font-semibold">{child.streak}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-1">{child.name}</h3>
                <p className="text-slate-500 text-sm mb-4">
                  {child.grade} {child.birthDate && `Age ${new Date().getFullYear() - child.birthDate.getFullYear()}`}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Weekly Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${avatarColors[child.avatar]} rounded-full transition-all duration-500`}
                          style={{ width: `${getWeeklyProgress(child)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        {getWeeklyProgress(child)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-slate-600">
                      {child.xp.toLocaleString()} XP
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-indigo-600 group-hover:gap-2 transition-all">
                    <span className="text-sm font-medium">View Dashboard</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-3">
                  Last active:{' '}
                  {child.lastActivityDate
                    ? new Date(child.lastActivityDate).toLocaleDateString()
                    : 'Never'}
                </p>
              </button>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">47</p>
                  <p className="text-xs text-slate-500">Assignments Completed</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">23</p>
                  <p className="text-xs text-slate-500">Achievements Earned</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">89%</p>
                  <p className="text-xs text-slate-500">Avg Mastery Rate</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">12.5h</p>
                  <p className="text-xs text-slate-500">Learning This Week</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Child Dashboard (child selected)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedChild(null)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              &larr; Back
            </button>
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarColors[selectedChild.avatar]} flex items-center justify-center text-xl`}
              >
                {selectedChild.avatar === '1' ? '1' : selectedChild.avatar === '2' ? '2' : '3'}
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">
                  {selectedChild.name}&apos;s Dashboard
                </h1>
                <p className="text-xs text-slate-500">
                  {selectedChild.grade} Level: {selectedChild.level}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full">
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-amber-700">
                {selectedChild.streak} day streak!
              </span>
            </div>
            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-semibold text-indigo-700">
                {selectedChild.xp.toLocaleString()} XP
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Focus */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">Today&apos;s Focus</h2>
                <span className="text-sm text-slate-500">
                  {todaysAssignments.length} assignments
                </span>
              </div>
              <div className="space-y-3">
                {todaysAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                  >
                    <button className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
                      <Play className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">{assignment.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500">{assignment.subject}</span>
                        <span className="text-xs text-slate-400">&bull;</span>
                        <span className="text-xs text-slate-500">{assignment.duration}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            assignment.difficulty === 'challenge'
                              ? 'bg-purple-100 text-purple-700'
                              : assignment.difficulty === 'advanced'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {assignment.difficulty}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Subject Tiles */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Subject Progress</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {subjects.map((subjectProgress) => {
                  const IconComponent =
                    iconMap[subjectProgress.subject.icon] || BookOpen;
                  return (
                    <div
                      key={subjectProgress.subject.id}
                      className="p-4 border border-slate-100 rounded-xl hover:border-indigo-200 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={`w-10 h-10 ${subjectProgress.subject.color} rounded-xl flex items-center justify-center text-white`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        {subjectProgress.assignmentsDue > 0 && (
                          <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                            {subjectProgress.assignmentsDue} due
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-800">
                        {subjectProgress.subject.name}
                      </h3>
                      <p className="text-xs text-slate-500 mb-3">
                        Current: {subjectProgress.currentUnit}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${subjectProgress.subject.color} rounded-full`}
                            style={{ width: `${subjectProgress.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-slate-600">
                          {subjectProgress.progress}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        {[...Array(7)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${i < subjectProgress.masteryLevel ? 'bg-amber-400' : 'bg-slate-200'}`}
                          ></div>
                        ))}
                        <span className="text-xs text-slate-400 ml-1">
                          {subjectProgress.masteryLevel}/7 mastery
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Overview */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Weekly Progress</h2>
              <div className="flex justify-center mb-4">
                <ProgressRing
                  progress={getWeeklyProgress(selectedChild)}
                  size={120}
                  strokeWidth={10}
                />
              </div>
              <div className="text-center mb-4">
                <p className="text-sm text-slate-500">Weekly goal completion</p>
                <p className="text-xs text-emerald-600 font-medium mt-1">+12% from last week</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-slate-800">24</p>
                  <p className="text-xs text-slate-500">Completed</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-slate-800">7</p>
                  <p className="text-xs text-slate-500">Remaining</p>
                </div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">Recent Achievements</h2>
                <Award className="w-5 h-5 text-amber-500" />
              </div>
              <div className="space-y-3">
                {recentAchievements.map((achievement, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl"
                  >
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 text-sm">{achievement.title}</h3>
                      <p className="text-xs text-slate-500">{achievement.description}</p>
                    </div>
                    <span className="text-xs text-slate-400">{achievement.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
              <h2 className="font-bold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full bg-white/20 hover:bg-white/30 rounded-xl p-3 text-left text-sm font-medium transition-colors">
                  Add Custom Assignment
                </button>
                <button className="w-full bg-white/20 hover:bg-white/30 rounded-xl p-3 text-left text-sm font-medium transition-colors">
                  View Full Reports
                </button>
                <button className="w-full bg-white/20 hover:bg-white/30 rounded-xl p-3 text-left text-sm font-medium transition-colors">
                  Adjust Difficulty
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
