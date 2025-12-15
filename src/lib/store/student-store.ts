'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Student, SubjectProgress, TodayAssignment, DashboardStats } from '@/lib/types';

interface StudentState {
  // Selected student
  selectedStudent: Student | null;
  students: Student[];

  // Dashboard data
  subjectProgress: SubjectProgress[];
  todayAssignments: TodayAssignment[];
  dashboardStats: DashboardStats;

  // Actions
  setSelectedStudent: (student: Student | null) => void;
  setStudents: (students: Student[]) => void;
  addStudent: (student: Student) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;

  // Progress actions
  setSubjectProgress: (progress: SubjectProgress[]) => void;
  setTodayAssignments: (assignments: TodayAssignment[]) => void;
  setDashboardStats: (stats: DashboardStats) => void;

  // XP and gamification
  addXP: (amount: number, reason: string) => void;
  updateStreak: () => void;
}

export const useStudentStore = create<StudentState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedStudent: null,
      students: [],
      subjectProgress: [],
      todayAssignments: [],
      dashboardStats: {
        assignmentsCompleted: 0,
        achievementsEarned: 0,
        avgMasteryRate: 0,
        learningTimeThisWeek: 0,
      },

      // Student selection
      setSelectedStudent: (student) => set({ selectedStudent: student }),

      setStudents: (students) => set({ students }),

      addStudent: (student) =>
        set((state) => ({ students: [...state.students, student] })),

      updateStudent: (id, updates) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
          selectedStudent:
            state.selectedStudent?.id === id
              ? { ...state.selectedStudent, ...updates }
              : state.selectedStudent,
        })),

      // Progress
      setSubjectProgress: (progress) => set({ subjectProgress: progress }),
      setTodayAssignments: (assignments) => set({ todayAssignments: assignments }),
      setDashboardStats: (stats) => set({ dashboardStats: stats }),

      // Gamification
      addXP: (amount, reason) => {
        const { selectedStudent, updateStudent } = get();
        if (!selectedStudent) return;

        const newXP = selectedStudent.xp + amount;
        const newLevel = calculateLevel(newXP);

        updateStudent(selectedStudent.id, {
          xp: newXP,
          level: newLevel,
        });

        // TODO: Log XP transaction to database
        console.log(`[XP] +${amount} for ${reason}`);
      },

      updateStreak: () => {
        const { selectedStudent, updateStudent } = get();
        if (!selectedStudent) return;

        const today = new Date().toDateString();
        const lastActivity = selectedStudent.lastActivityDate
          ? new Date(selectedStudent.lastActivityDate).toDateString()
          : null;

        if (lastActivity === today) {
          // Already active today, no change
          return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        let newStreak = 1;
        if (lastActivity === yesterdayStr) {
          // Consecutive day
          newStreak = selectedStudent.streak + 1;
        }

        updateStudent(selectedStudent.id, {
          streak: newStreak,
          longestStreak: Math.max(newStreak, selectedStudent.longestStreak),
          lastActivityDate: new Date(),
        });
      },
    }),
    {
      name: 'gifted-tudor-student',
      partialize: (state) => ({
        selectedStudent: state.selectedStudent,
        students: state.students,
      }),
    }
  )
);

// Helper function to calculate level from XP
function calculateLevel(xp: number): string {
  if (xp < 500) return 'Explorer';
  if (xp < 1500) return 'Learner';
  if (xp < 3500) return 'Scholar';
  if (xp < 7000) return 'Achiever';
  if (xp < 12000) return 'Mastermind';
  if (xp < 20000) return 'Virtuoso';
  return 'Genius';
}
