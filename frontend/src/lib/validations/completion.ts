import { z } from 'zod';

/**
 * Task completion validation schemas
 */
export const taskCompletionSchema = z.object({
  task_id: z.string().uuid('Invalid task ID'),
  user_id: z.string().uuid('Invalid user ID'),
  completion_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  is_completed: z.boolean(),
  points_earned: z.number().int('Points must be a whole number'),
});

/**
 * Schema for creating a new task completion
 */
export const createCompletionSchema = taskCompletionSchema.omit({
  user_id: true, // Will be set by the server
});

/**
 * Schema for updating an existing completion
 */
export const updateCompletionSchema = z.object({
  id: z.string().uuid('Invalid completion ID'),
  is_completed: z.boolean(),
  points_earned: z.number().int('Points must be a whole number'),
});

/**
 * Complete task completion schema including all database fields
 */
export const taskCompletionWithMetadataSchema = taskCompletionSchema.extend({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

/**
 * Schema for daily score aggregation
 */
export const dailyScoreSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  score_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  total_points: z.number().int('Total points must be a whole number'),
  completed_tasks: z.number().int('Completed tasks must be a whole number').min(0),
  total_tasks: z.number().int('Total tasks must be a whole number').min(0),
});

/**
 * Complete daily score schema including metadata
 */
export const dailyScoreWithMetadataSchema = dailyScoreSchema.extend({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
});

/**
 * TypeScript types derived from schemas
 */
export type TaskCompletion = z.infer<typeof taskCompletionWithMetadataSchema>;
export type CreateCompletionData = z.infer<typeof createCompletionSchema>;
export type UpdateCompletionData = z.infer<typeof updateCompletionSchema>;
export type DailyScore = z.infer<typeof dailyScoreWithMetadataSchema>;
export type DailyScoreData = z.infer<typeof dailyScoreSchema>;

/**
 * Utility functions for validation
 */
export const validateTaskCompletion = (data: unknown) => taskCompletionSchema.safeParse(data);
export const validateCreateCompletion = (data: unknown) => createCompletionSchema.safeParse(data);
export const validateUpdateCompletion = (data: unknown) => updateCompletionSchema.safeParse(data);
export const validateDailyScore = (data: unknown) => dailyScoreSchema.safeParse(data);

/**
 * Helper functions for date handling
 */
export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const formatDateForDatabase = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const parseCompletionDate = (dateString: string): Date => {
  return new Date(dateString + 'T00:00:00.000Z');
};

/**
 * Point calculation helpers
 */
export const calculatePointsEarned = (
  task: { positive_points: number; negative_points: number },
  isCompleted: boolean
): number => {
  return isCompleted ? task.positive_points : -task.negative_points;
};

/**
 * Daily score calculation helpers
 */
export const calculateDailyScore = (completions: TaskCompletion[]): number => {
  return completions.reduce((total, completion) => total + completion.points_earned, 0);
};

export const calculateCompletionRate = (
  completedTasks: number,
  totalTasks: number
): number => {
  if (totalTasks === 0) return 0;
  return Math.round((completedTasks / totalTasks) * 100);
};