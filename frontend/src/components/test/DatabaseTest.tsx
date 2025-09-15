'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui';

export function DatabaseTest() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      
      // Test basic connection by checking auth status
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      // Test database connection by querying tasks table
      const { error: dbError } = await supabase
        .from('tasks')
        .select('count', { count: 'exact', head: true });
      
      if (dbError) {
        throw dbError;
      }
      
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="p-6 border rounded-lg space-y-4">
      <h3 className="text-lg font-semibold">Database Connection Test</h3>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span>Status:</span>
          {loading && <span className="text-yellow-600">Testing...</span>}
          {!loading && isConnected === true && (
            <span className="text-green-600">✓ Connected</span>
          )}
          {!loading && isConnected === false && (
            <span className="text-red-600">✗ Failed</span>
          )}
          {!loading && isConnected === null && (
            <span className="text-gray-600">Not tested</span>
          )}
        </div>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
      
      <Button onClick={testConnection} disabled={loading}>
        {loading ? 'Testing...' : 'Test Connection'}
      </Button>
    </div>
  );
}