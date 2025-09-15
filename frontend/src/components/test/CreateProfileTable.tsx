'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui';

export function CreateProfileTable() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const createTable = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const supabase = createClient();
      
      // Try to create the user_profiles table manually
      const { data, error } = await supabase.rpc('exec_sql', {
        query: `
          -- Create user_profiles table
          CREATE TABLE IF NOT EXISTS user_profiles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
            full_name TEXT NOT NULL,
            display_name TEXT,
            avatar_url TEXT,
            theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
            timezone TEXT DEFAULT 'UTC',
            notifications_enabled BOOLEAN DEFAULT true,
            daily_reminder_time TIME DEFAULT '09:00:00',
            onboarding_completed BOOLEAN DEFAULT false,
            onboarding_step INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
          );
          
          -- Enable RLS
          ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
          
          -- Create policies
          DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
          CREATE POLICY "Users can view their own profile" ON user_profiles
            FOR SELECT USING (auth.uid() = user_id);
            
          DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
          CREATE POLICY "Users can insert their own profile" ON user_profiles
            FOR INSERT WITH CHECK (auth.uid() = user_id);
            
          DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
          CREATE POLICY "Users can update their own profile" ON user_profiles
            FOR UPDATE USING (auth.uid() = user_id);
        `
      });
      
      if (error) {
        setResult(`❌ Error creating table: ${error.message}`);
      } else {
        setResult(`✅ Table creation attempted. Check Tables to verify.`);
      }
      
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg space-y-4">
      <h3 className="text-lg font-semibold">Create Profile Table</h3>
      <p className="text-sm text-muted-foreground">
        Manually create user_profiles table if migration failed
      </p>
      
      <Button onClick={createTable} disabled={loading} variant="warning">
        {loading ? 'Creating...' : 'Create Profile Table'}
      </Button>
      
      {result && (
        <div className="p-3 bg-muted rounded text-sm font-mono whitespace-pre-line">
          {result}
        </div>
      )}
    </div>
  );
}