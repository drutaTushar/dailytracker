import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Task } from '@/lib/validations/task';
import type { 
  TaskCompletion, 
  CreateCompletionData, 
  UpdateCompletionData,
  DailyScore 
} from '@/lib/validations/completion';
import { 
  getTodayDateString, 
  calculatePointsEarned,
  calculateDailyScore 
} from '@/lib/validations/completion';

interface UseTaskCompletionsReturn {
  completions: TaskCompletion[];
  dailyScore: DailyScore | null;
  loading: boolean;
  error: string | null;
  toggleTaskCompletion: (task: Task, date?: string) => Promise<boolean>;
  getTaskCompletion: (taskId: string, date?: string) => TaskCompletion | null;
  refreshCompletions: () => Promise<void>;
  calculateTodayStats: () => {
    totalPoints: number;
    completedTasks: number;
    totalTasks: number;
    completionRate: number;
  };
}

interface UseTaskCompletionsOptions {
  date?: string; // YYYY-MM-DD format, defaults to today
  tasks?: Task[]; // Optional tasks array for calculating stats
}

export function useTaskCompletions(options: UseTaskCompletionsOptions = {}): UseTaskCompletionsReturn {
  const { user } = useAuth();
  const supabase = createClient();
  
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [dailyScore, setDailyScore] = useState<DailyScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { date = getTodayDateString(), tasks = [] } = options;

  const updateDailyScore = useCallback(async (scoreDate: string) => {
    if (!user) return;

    try {
      // Get all completions for the date
      const { data: dayCompletions, error: fetchError } = await supabase
        .from('task_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completion_date', scoreDate);

      if (fetchError) throw fetchError;

      // Get all active tasks for the user
      const { data: userTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (tasksError) throw tasksError;

      const totalPoints = calculateDailyScore(dayCompletions || []);
      const completedTasks = (dayCompletions || []).filter(c => c.is_completed).length;
      const totalTasks = userTasks?.length || 0;

      const scoreData = {
        user_id: user.id,
        score_date: scoreDate,
        total_points: totalPoints,
        completed_tasks: completedTasks,
        total_tasks: totalTasks,
      };

      // Upsert daily score
      const { data: updatedScore, error: upsertError } = await supabase
        .from('daily_scores')
        .upsert(scoreData, { onConflict: 'user_id,score_date' })
        .select()
        .single();

      if (upsertError) throw upsertError;

      // Update local state if this is for the current date
      if (scoreDate === date) {
        setDailyScore(updatedScore);
      }
    } catch (err) {
      console.error('Error updating daily score:', err);
    }
  }, [user, supabase, date]);

  const fetchCompletions = useCallback(async () => {
    if (!user) {
      setCompletions([]);
      setDailyScore(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch task completions for the specified date
      const { data: completionsData, error: completionsError } = await supabase
        .from('task_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completion_date', date);

      if (completionsError) throw completionsError;

      setCompletions(completionsData || []);

      // Fetch daily score for the specified date
      const { data: scoreData, error: scoreError } = await supabase
        .from('daily_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('score_date', date)
        .single();

      if (scoreError && scoreError.code !== 'PGRST116') { // Not found error is OK
        throw scoreError;
      }

      setDailyScore(scoreData || null);
    } catch (err) {
      console.error('Error fetching completions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch completions');
    } finally {
      setLoading(false);
    }
  }, [user, supabase, date]);

  const toggleTaskCompletion = useCallback(async (
    task: Task, 
    completionDate: string = date
  ): Promise<boolean> => {
    if (!user) {
      setError('User must be authenticated');
      return false;
    }

    try {
      setError(null);
      
      // Check if completion already exists
      const existingCompletion = completions.find(
        c => c.task_id === task.id && c.completion_date === completionDate
      );

      if (existingCompletion) {
        // Update existing completion
        const newCompletionStatus = !existingCompletion.is_completed;
        const pointsEarned = calculatePointsEarned(task, newCompletionStatus);

        const updateData: Partial<UpdateCompletionData> = {
          is_completed: newCompletionStatus,
          points_earned: pointsEarned,
        };

        const { data: updatedCompletion, error: updateError } = await supabase
          .from('task_completions')
          .update(updateData)
          .eq('id', existingCompletion.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) throw updateError;

        // Optimistically update local state
        setCompletions(prev => prev.map(c => 
          c.id === existingCompletion.id ? updatedCompletion as TaskCompletion : c
        ));
      } else {
        // Create new completion
        const pointsEarned = calculatePointsEarned(task, true);
        
        const createData: CreateCompletionData = {
          task_id: task.id,
          completion_date: completionDate,
          is_completed: true,
          points_earned: pointsEarned,
        };

        const { data: newCompletion, error: createError } = await supabase
          .from('task_completions')
          .insert({ ...createData, user_id: user.id })
          .select()
          .single();

        if (createError) throw createError;

        // Optimistically update local state
        setCompletions(prev => [...prev, newCompletion as TaskCompletion]);
      }

      // Recalculate and update daily score
      await updateDailyScore(completionDate);
      
      return true;
    } catch (err) {
      console.error('Error toggling task completion:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task completion');
      return false;
    }
  }, [user, supabase, completions, date, updateDailyScore]);

  const getTaskCompletion = useCallback((
    taskId: string, 
    completionDate: string = date
  ): TaskCompletion | null => {
    return completions.find(
      c => c.task_id === taskId && c.completion_date === completionDate
    ) || null;
  }, [completions, date]);

  const refreshCompletions = useCallback(async () => {
    await fetchCompletions();
  }, [fetchCompletions]);

  const calculateTodayStats = useCallback(() => {
    const todayCompletions = completions.filter(c => c.completion_date === date);
    const totalPoints = calculateDailyScore(todayCompletions);
    const completedTasks = todayCompletions.filter(c => c.is_completed).length;
    const totalTasks = tasks.filter(t => t.is_active).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalPoints,
      completedTasks,
      totalTasks,
      completionRate,
    };
  }, [completions, date, tasks]);

  // Fetch completions on mount and when dependencies change
  useEffect(() => {
    fetchCompletions();
  }, [fetchCompletions]);

  return {
    completions,
    dailyScore,
    loading,
    error,
    toggleTaskCompletion,
    getTaskCompletion,
    refreshCompletions,
    calculateTodayStats,
  };
}

/**
 * Hook for managing completions across multiple dates (for calendar views)
 */
export function useTaskCompletionsRange(
  startDate: string,
  endDate: string,
  tasks: Task[] = []
) {
  const { user } = useAuth();
  const supabase = createClient();
  
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [dailyScores, setDailyScores] = useState<DailyScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRangeData = useCallback(async () => {
    if (!user) {
      setCompletions([]);
      setDailyScores([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch completions for date range
      const { data: completionsData, error: completionsError } = await supabase
        .from('task_completions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completion_date', startDate)
        .lte('completion_date', endDate);

      if (completionsError) throw completionsError;

      // Fetch daily scores for date range
      const { data: scoresData, error: scoresError } = await supabase
        .from('daily_scores')
        .select('*')
        .eq('user_id', user.id)
        .gte('score_date', startDate)
        .lte('score_date', endDate);

      if (scoresError) throw scoresError;

      setCompletions(completionsData || []);
      setDailyScores(scoresData || []);
    } catch (err) {
      console.error('Error fetching range data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [user, supabase, startDate, endDate]);

  useEffect(() => {
    fetchRangeData();
  }, [fetchRangeData]);

  return {
    completions,
    dailyScores,
    loading,
    error,
    refreshData: fetchRangeData,
  };
}