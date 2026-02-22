'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, User, GraduationCap, Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { getUserProfile } from '@/lib/db/users';
import { createStudent } from '@/lib/db/students';

const grades = [
  'Kindergarten',
  '1st Grade',
  '2nd Grade',
  '3rd Grade',
  '4th Grade',
  '5th Grade',
  '6th Grade',
  '7th Grade',
  '8th Grade',
  '9th Grade',
  '10th Grade',
  '11th Grade',
  '12th Grade',
];

const subjects = [
  { id: 'math', label: 'Mathematics', icon: '📐' },
  { id: 'ela', label: 'Language Arts', icon: '📚' },
  { id: 'science', label: 'Science', icon: '🔬' },
  { id: 'social', label: 'Social Studies', icon: '🌍' },
  { id: 'arts', label: 'Creative Arts', icon: '🎨' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'pe', label: 'Physical Education', icon: '🏃' },
  { id: 'tech', label: 'Technology', icon: '💻' },
];

const difficultyLevels = [
  { id: 'standard', label: 'Standard', description: 'Grade-level content' },
  { id: 'advanced', label: 'Advanced', description: '1-2 grades above level' },
  { id: 'challenge', label: 'Challenge', description: 'Highly accelerated' },
];

const avatarOptions = [
  { id: '1', emoji: '🦊', color: 'from-orange-400 to-amber-500' },
  { id: '2', emoji: '🐼', color: 'from-slate-400 to-slate-600' },
  { id: '3', emoji: '🦁', color: 'from-amber-400 to-orange-500' },
  { id: '4', emoji: '🐸', color: 'from-green-400 to-emerald-500' },
  { id: '5', emoji: '🦋', color: 'from-blue-400 to-purple-500' },
  { id: '6', emoji: '🐙', color: 'from-pink-400 to-rose-500' },
];

export default function AddStudentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    birthDate: '',
    avatar: '1',
    difficultyPreference: 'standard' as 'standard' | 'advanced' | 'challenge',
    subjects: ['math', 'ela'] as string[],
  });

  const toggleSubject = (subjectId: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter((s) => s !== subjectId)
        : [...prev.subjects, subjectId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('You must be logged in to add a student');
      return;
    }

    if (!formData.name.trim()) {
      setError('Please enter a name');
      return;
    }

    if (!formData.grade) {
      setError('Please select a grade');
      return;
    }

    if (formData.subjects.length === 0) {
      setError('Please select at least one subject');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get user's family ID
      const profile = await getUserProfile(user.id);
      if (!profile?.familyId) {
        setError('No family found. Please complete setup first.');
        setIsSubmitting(false);
        return;
      }

      const student = await createStudent(profile.familyId, user.id, {
        name: formData.name.trim(),
        grade: formData.grade,
        birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
        avatar: formData.avatar,
        difficultyPreference: formData.difficultyPreference,
        subjects: formData.subjects,
      });

      if (student) {
        router.push('/');
      } else {
        setError('Failed to create student. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Add a Student</h1>
          <p className="text-slate-600 mt-2">
            Set up a learning profile for your child
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-4 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                  Student Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter student's name"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-slate-700 mb-1">
                  Grade Level *
                </label>
                <select
                  id="grade"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select grade...</option>
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-slate-700 mb-1">
                  Birth Date (Optional)
                </label>
                <input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Avatar Selection */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Choose an Avatar
            </h2>

            <div className="grid grid-cols-6 gap-3">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, avatar: avatar.id })}
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${avatar.color} flex items-center justify-center text-2xl transition-all ${
                    formData.avatar === avatar.id
                      ? 'ring-4 ring-indigo-500 ring-offset-2 scale-110'
                      : 'hover:scale-105'
                  }`}
                >
                  {avatar.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Selection */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
              Subjects *
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Select the subjects your child will be learning
            </p>

            <div className="grid grid-cols-2 gap-3">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => toggleSubject(subject.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    formData.subjects.includes(subject.id)
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">{subject.icon}</span>
                  <span className="font-medium">{subject.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Level */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Difficulty Preference
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Choose the default difficulty level for assignments
            </p>

            <div className="space-y-3">
              {difficultyLevels.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      difficultyPreference: level.id as 'standard' | 'advanced' | 'challenge',
                    })
                  }
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                    formData.difficultyPreference === level.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-left">
                    <p className={`font-medium ${formData.difficultyPreference === level.id ? 'text-indigo-700' : 'text-slate-800'}`}>
                      {level.label}
                    </p>
                    <p className="text-sm text-slate-500">{level.description}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 ${
                      formData.difficultyPreference === level.id
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-slate-300'
                    }`}
                  >
                    {formData.difficultyPreference === level.id && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Link href="/" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Add Student'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
