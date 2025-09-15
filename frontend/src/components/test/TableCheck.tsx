'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui';

export function TableCheck() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const checkTables = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const supabase = createClient();
      
      // Check if user_profiles table exists
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('count', { count: 'exact', head: true });
      
      let result = '';
      
      if (profileError) {
        result += `❌ user_profiles table: ${profileError.message}\n`;
      } else {
        result += `✅ user_profiles table exists\n`;
      }
      
      // Check tasks table  
      const { data: tasks, error: taskError } = await supabase
        .from('tasks')
        .select('count', { count: 'exact', head: true });
        
      if (taskError) {
        result += `❌ tasks table: ${taskError.message}\n`;
      } else {
        result += `✅ tasks table exists\n`;
      }
      
      // Check if we can query user_profiles structure
      if (!profileError) {
        const { data: sampleProfile, error: sampleError } = await supabase
          .from('user_profiles')
          .select('id, user_id, full_name, onboarding_completed')
          .limit(1);
          
        if (sampleError) {
          result += `❌ user_profiles query: ${sampleError.message}\n`;
        } else {
          result += `✅ user_profiles structure OK\n`;
        }
      }
      
      setResult(result);
      
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg space-y-4">
      <h3 className="text-lg font-semibold">Database Tables Check</h3>
      
      <Button onClick={checkTables} disabled={loading}>
        {loading ? 'Checking...' : 'Check Tables'}
      </Button>
      
      {result && (
        <div className="p-3 bg-muted rounded text-sm font-mono whitespace-pre-line">
          {result}
        </div>
      )}
    </div>
  );
}