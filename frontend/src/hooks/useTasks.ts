import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Task, CreateTaskData, UpdateTaskData } from '@/lib/validations/task';

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  createTask: (data: CreateTaskData) => Promise<Task | null>;
  updateTask: (id: string, data: Partial<UpdateTaskData>) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  refreshTasks: () => Promise<void>;
  getTaskById: (id: string) => Task | undefined;
}

interface UseTasksOptions {
  activeOnly?: boolean;
  category?: string;
  sortBy?: 'name' | 'created_at' | 'difficulty_level' | 'positive_points';
  sortOrder?: 'asc' | 'desc';
}

export function useTasks(options: UseTasksOptions = {}): UseTasksReturn {
  const { user } = useAuth();
  const supabase = createClient();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    activeOnly = true,
    category,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = options;

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      // Apply filters
      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      if (category) {
        query = query.eq('category', category);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [user, supabase, activeOnly, category, sortBy, sortOrder]);

  const createTask = useCallback(async (data: CreateTaskData): Promise<Task | null> => {
    if (!user) {
      setError('User must be authenticated to create tasks');
      return null;
    }

    try {
      setError(null);
      
      const taskData = {
        ...data,
        user_id: user.id,
      };

      const { data: newTask, error: createError } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (createError) throw createError;

      // Optimistically update local state
      setTasks(prev => [newTask, ...prev]);
      
      return newTask;
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to create task');
      return null;
    }
  }, [user, supabase]);

  const updateTask = useCallback(async (id: string, data: Partial<UpdateTaskData>): Promise<Task | null> => {
    if (!user) {
      setError('User must be authenticated to update tasks');
      return null;
    }

    try {
      setError(null);

      const { data: updatedTask, error: updateError } = await supabase
        .from('tasks')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user can only update their own tasks
        .select()
        .single();

      if (updateError) throw updateError;

      // Optimistically update local state
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));

      return updatedTask;
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task');
      return null;
    }
  }, [user, supabase]);

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    if (!user) {
      setError('User must be authenticated to delete tasks');
      return false;
    }

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure user can only delete their own tasks

      if (deleteError) throw deleteError;

      // Optimistically update local state
      setTasks(prev => prev.filter(task => task.id !== id));

      return true;
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      return false;
    }
  }, [user, supabase]);

  const refreshTasks = useCallback(async () => {
    await fetchTasks();
  }, [fetchTasks]);

  const getTaskById = useCallback((id: string): Task | undefined => {
    return tasks.find(task => task.id === id);
  }, [tasks]);

  // Fetch tasks on mount and when dependencies change
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refreshTasks,
    getTaskById,
  };
}

/**
 * Hook for managing a single task (useful for task detail views)
 */
export function useTask(id: string) {
  const { user } = useAuth();
  const supabase = createClient();
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    if (!user || !id) {
      setTask(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      setTask(data);
    } catch (err) {
      console.error('Error fetching task:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch task');
      setTask(null);
    } finally {
      setLoading(false);
    }
  }, [user, supabase, id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  return {
    task,
    loading,
    error,
    refreshTask: fetchTask,
  };
}

/**
 * Hook for task statistics and analytics
 */
export function useTaskStats() {
  const { user } = useAuth();
  const supabase = createClient();
  
  const [stats, setStats] = useState({
    totalTasks: 0,
    activeTasks: 0,
    completedToday: 0,
    averageDifficulty: 0,
    categoryCounts: {} as Record<string, number>,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch basic task stats
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('category, difficulty_level, is_active')
        .eq('user_id', user.id);

      if (tasksError) throw tasksError;

      const totalTasks = tasks?.length || 0;
      const activeTasks = tasks?.filter(t => t.is_active).length || 0;
      
      const avgDifficulty = tasks?.length 
        ? tasks.reduce((sum, t) => sum + (t.difficulty_level || 1), 0) / tasks.length
        : 0;

      const categoryCounts = tasks?.reduce((acc, task) => {
        const category = task.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      setStats({
        totalTasks,
        activeTasks,
        completedToday: 0, // TODO: Implement when we have completions table
        averageDifficulty: Math.round(avgDifficulty * 10) / 10,
        categoryCounts,
      });
    } catch (err) {
      console.error('Error fetching task stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch task statistics');
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refreshStats: fetchStats,
  };
}