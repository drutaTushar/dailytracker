'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { UserIcon, CogIcon } from '@heroicons/react/24/outline';

interface ProfileFormData {
  full_name: string;
  display_name: string;
  avatar_url: string;
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  notifications_enabled: boolean;
  daily_reminder_time: string;
}

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    display_name: '',
    avatar_url: '',
    theme: 'system',
    timezone: 'UTC',
    notifications_enabled: true,
    daily_reminder_time: '09:00',
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        display_name: profile.display_name || '',
        avatar_url: profile.avatar_url || '',
        theme: (profile.theme as 'light' | 'dark' | 'system') || 'system',
        timezone: profile.timezone || 'UTC',
        notifications_enabled: profile.notifications_enabled ?? true,
        daily_reminder_time: profile.daily_reminder_time || '09:00',
      });
    }
  }, [profile]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          full_name: formData.full_name,
          display_name: formData.display_name || null,
          avatar_url: formData.avatar_url || null,
          theme: formData.theme,
          timezone: formData.timezone,
          notifications_enabled: formData.notifications_enabled,
          daily_reminder_time: formData.daily_reminder_time,
          onboarding_completed: true,
          onboarding_step: 4,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      await refreshProfile();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`rounded-lg p-4 ${
            message.type === 'success' 
              ? 'bg-success/10 text-success border border-success/20' 
              : 'bg-destructive/10 text-destructive border border-destructive/20'
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Personal Information</h2>
            </div>
            
            <div className="grid gap-4">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium mb-2">
                  Full Name *
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="display_name" className="block text-sm font-medium mb-2">
                  Display Name
                </label>
                <input
                  id="display_name"
                  name="display_name"
                  type="text"
                  value={formData.display_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Optional display name"
                />
              </div>
              
              <div>
                <label htmlFor="avatar_url" className="block text-sm font-medium mb-2">
                  Avatar URL
                </label>
                <input
                  id="avatar_url"
                  name="avatar_url"
                  type="url"
                  value={formData.avatar_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <CogIcon className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Preferences</h2>
            </div>
            
            <div className="grid gap-4">
              <div>
                <label htmlFor="theme" className="block text-sm font-medium mb-2">
                  Theme
                </label>
                <select
                  id="theme"
                  name="theme"
                  value={formData.theme}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="timezone" className="block text-sm font-medium mb-2">
                  Timezone
                </label>
                <select
                  id="timezone"
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Asia/Shanghai">Shanghai</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="daily_reminder_time" className="block text-sm font-medium mb-2">
                  Daily Reminder Time
                </label>
                <input
                  id="daily_reminder_time"
                  name="daily_reminder_time"
                  type="time"
                  value={formData.daily_reminder_time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="notifications_enabled"
                  name="notifications_enabled"
                  type="checkbox"
                  checked={formData.notifications_enabled}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary border-input rounded focus:ring-primary"
                />
                <label htmlFor="notifications_enabled" className="text-sm font-medium">
                  Enable notifications
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>

        {/* Account Information */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Account Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
            <p><strong>Last Updated:</strong> {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Never'}</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}