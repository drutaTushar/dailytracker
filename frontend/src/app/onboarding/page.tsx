'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input } from '@/components/ui';
import { CalendarDaysIcon, CheckIcon } from '@heroicons/react/24/outline';

interface OnboardingData {
  fullName: string;
  displayName: string;
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  notificationsEnabled: boolean;
  dailyReminderTime: string;
}

const steps = [
  { id: 1, title: 'Welcome', description: 'Let&apos;s get you set up' },
  { id: 2, title: 'Profile', description: 'Tell us about yourself' },
  { id: 3, title: 'Preferences', description: 'Customize your experience' },
  { id: 4, title: 'Complete', description: 'You&apos;re all set!' },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    displayName: '',
    theme: 'system',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notificationsEnabled: true,
    dailyReminderTime: '09:00',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          full_name: data.fullName,
          display_name: data.displayName || data.fullName,
          theme: data.theme,
          timezone: data.timezone,
          notifications_enabled: data.notificationsEnabled,
          daily_reminder_time: data.dailyReminderTime,
          onboarding_completed: true,
          onboarding_step: 4,
        });

      if (error) throw error;

      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <CalendarDaysIcon className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Welcome to HabitTracker!</h2>
              <p className="text-muted-foreground mt-2">
                Let&apos;s set up your account to get the most out of your habit tracking journey.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Tell us about yourself</h2>
              <p className="text-muted-foreground mt-2">
                This information will help us personalize your experience.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                  Full Name *
                </label>
                <Input
                  id="fullName"
                  value={data.fullName}
                  onChange={(e) => setData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium mb-2">
                  Display Name (Optional)
                </label>
                <Input
                  id="displayName"
                  value={data.displayName}
                  onChange={(e) => setData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="How should we call you?"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Customize your preferences</h2>
              <p className="text-muted-foreground mt-2">
                Set up your preferences to match your lifestyle.
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['light', 'dark', 'system'] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setData(prev => ({ ...prev, theme }))}
                      className={`p-3 rounded-lg border-2 capitalize ${
                        data.theme === theme
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="timezone" className="block text-sm font-medium mb-2">
                  Timezone
                </label>
                <Input
                  id="timezone"
                  value={data.timezone}
                  onChange={(e) => setData(prev => ({ ...prev, timezone: e.target.value }))}
                  placeholder="Your timezone"
                />
              </div>

              <div>
                <label htmlFor="reminderTime" className="block text-sm font-medium mb-2">
                  Daily Reminder Time
                </label>
                <Input
                  id="reminderTime"
                  type="time"
                  value={data.dailyReminderTime}
                  onChange={(e) => setData(prev => ({ ...prev, dailyReminderTime: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  id="notifications"
                  type="checkbox"
                  checked={data.notificationsEnabled}
                  onChange={(e) => setData(prev => ({ ...prev, notificationsEnabled: e.target.checked }))}
                  className="rounded border-border"
                />
                <label htmlFor="notifications" className="text-sm font-medium">
                  Enable notifications
                </label>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-success rounded-full flex items-center justify-center">
              <CheckIcon className="w-8 h-8 text-success-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">You&apos;re all set!</h2>
              <p className="text-muted-foreground mt-2">
                Welcome to HabitTracker, {data.displayName || data.fullName}! 
                Start building better habits today.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {currentStep} of {steps.length}</span>
            <span>{Math.round((currentStep / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="bg-card p-6 rounded-lg border">
          {renderStepContent()}
        </div>

        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              disabled={currentStep === 2 && !data.fullName.trim()}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={loading}
            >
              {loading ? 'Completing...' : 'Get Started'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}