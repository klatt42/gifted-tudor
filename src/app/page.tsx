'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ParentDashboard from '@/components/dashboard/ParentDashboard';
import { useAuth } from '@/lib/hooks/useAuth';
import { getUserProfile, type UserProfile } from '@/lib/db/users';
import { getStudentsByFamily } from '@/lib/db/students';
import type { Student } from '@/lib/types';
import { Loader2, Zap, ArrowRight, Sparkles, BookOpen, Brain, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      if (authLoading) return;

      if (!user) {
        setLoading(false);
        return;
      }

      // Get user profile
      const userProfile = await getUserProfile(user.id);
      setProfile(userProfile);

      if (userProfile?.familyId) {
        // Get students
        const familyStudents = await getStudentsByFamily(userProfile.familyId);
        setStudents(familyStudents);
      } else {
        // User needs to set up their family
        setNeedsSetup(true);
      }

      setLoading(false);
    }

    loadData();
  }, [user, authLoading]);

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show landing page
  if (!user) {
    return <LandingPage />;
  }

  // Needs family setup
  if (needsSetup) {
    return <SetupPage onComplete={() => {
      setNeedsSetup(false);
      router.refresh();
    }} />;
  }

  // Logged in - show dashboard
  return <ParentDashboard initialStudents={students} userProfile={profile} />;
}

// Landing Page Component
function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              GiftedTudor
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Learning for Gifted Students
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Personalized Curriculum for Your{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Gifted Child
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            GiftedTudor uses AI to create personalized lesson plans, provide 24/7 tutoring,
            and adapt to your child&apos;s unique learning pace. Save 80% of curriculum planning time.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-12 px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">AI Curriculum Generator</h3>
            <p className="text-slate-600">
              Generate standards-aligned lesson plans tailored to your child&apos;s grade level and interests in seconds.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">24/7 AI Tutor</h3>
            <p className="text-slate-600">
              Your child can ask questions anytime. Our AI tutor uses the Socratic method to guide learning.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Adaptive Learning</h3>
            <p className="text-slate-600">
              Difficulty adjusts automatically based on performance. Your child is always appropriately challenged.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-slate-500 text-sm">
          <p>&copy; 2024 GiftedTudor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// Setup Page Component
function SetupPage({ onComplete }: { onComplete: () => void }) {
  const [familyName, setFamilyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyName: familyName || 'My Family' }),
      });

      const data = await response.json();

      if (response.ok && data.familyId) {
        onComplete();
      } else {
        setError(data.error || 'Failed to create family. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome to GiftedTudor!</h1>
          <p className="text-slate-600 mt-2">Let&apos;s set up your family account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="familyName" className="text-sm font-medium text-slate-700">
              Family Name
            </label>
            <input
              id="familyName"
              type="text"
              placeholder="e.g., The Smith Family"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
