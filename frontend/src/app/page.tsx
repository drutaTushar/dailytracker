'use client';

import Link from 'next/link';
import { CalendarDaysIcon, CheckCircleIcon, TrophyIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

function HeroSection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Logo and Branding */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="bg-primary text-primary-foreground flex h-16 w-16 items-center justify-center rounded-2xl">
              <CalendarDaysIcon className="h-10 w-10" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              HabitTracker
            </h1>
          </div>

          {/* Hero Content */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              Build Better Habits,
              <br />
              <span className="text-primary">One Day at a Time</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Track your daily habits with our point-based system. Set goals, earn rewards, 
              and watch your progress with beautiful analytics and insights.
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-8">
            <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
              <Link href="/login">
                Get Started Free
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Start tracking your habits today • No credit card required
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 pt-16 max-w-3xl mx-auto">
            <div className="text-center space-y-4">
              <div className="bg-success/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <CheckCircleIcon className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold">Daily Tracking</h3>
              <p className="text-muted-foreground">
                Mark habits complete and earn points for building consistency
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-warning/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <TrophyIcon className="h-8 w-8 text-warning" />
              </div>
              <h3 className="text-xl font-semibold">Point System</h3>
              <p className="text-muted-foreground">
                Gamify your habits with positive and negative scoring
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <ChartBarIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Analytics</h3>
              <p className="text-muted-foreground">
                Visualize your progress with charts and historical data
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back!</h1>
          <p className="text-muted-foreground">
            Here&apos;s your habit tracking dashboard for today.
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold">Today&apos;s Score</h3>
            <p className="text-2xl font-bold text-success">+45</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold">Streak</h3>
            <p className="text-2xl font-bold text-primary">7 days</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold">Completed</h3>
            <p className="text-2xl font-bold">8/12</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold">This Week</h3>
            <p className="text-2xl font-bold text-success">+280</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <HeroSection />;
}
