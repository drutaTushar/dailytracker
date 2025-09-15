import { z } from 'zod';

/**
 * Task category options based on common habit categories
 */
export const TASK_CATEGORIES = [
  'Health',
  'Learning',
  'Productivity',
  'Social',
  'Creativity',
  'Mindfulness',
  'Finance',
  'Fitness',
  'Career',
  'Personal',
] as const;

export type TaskCategory = typeof TASK_CATEGORIES[number];

/**
 * Difficulty levels (1-5 scale)
 */
export const DIFFICULTY_LEVELS = [1, 2, 3, 4, 5] as const;
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

/**
 * Base task schema for validation
 */
export const taskSchema = z.object({
  name: z
    .string()
    .min(1, 'Task name is required')
    .max(100, 'Task name must be less than 100 characters')
    .trim(),
  
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),
  
  positive_points: z
    .number()
    .int('Points must be a whole number')
    .min(0, 'Points cannot be negative')
    .max(100, 'Points cannot exceed 100')
    .default(1),
  
  negative_points: z
    .number()
    .int('Points must be a whole number')
    .min(0, 'Negative points cannot be negative')
    .max(100, 'Negative points cannot exceed 100')
    .default(0),
  
  category: z
    .enum(TASK_CATEGORIES)
    .optional()
    .nullable(),
  
  difficulty_level: z
    .number()
    .int('Difficulty must be a whole number')
    .min(1, 'Difficulty must be at least 1')
    .max(5, 'Difficulty cannot exceed 5')
    .default(1),
  
  is_active: z
    .boolean()
    .default(true),
});

/**
 * Schema for creating a new task
 */
export const createTaskSchema = taskSchema.omit({
  // Remove fields that are auto-generated or set by the system
});

/**
 * Schema for updating an existing task
 */
export const updateTaskSchema = taskSchema.partial().extend({
  id: z.string().uuid('Invalid task ID'),
});

/**
 * Complete task schema including all database fields
 */
export const taskWithMetadataSchema = taskSchema.extend({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

/**
 * Schema for task form data (client-side)
 */
export const taskFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Task name is required')
    .max(100, 'Task name must be less than 100 characters'),
  
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  
  positive_points: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(0).max(100)),
  
  negative_points: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(0).max(100)),
  
  category: z
    .enum(['', ...TASK_CATEGORIES])
    .transform((val) => val === '' ? null : val as TaskCategory)
    .optional(),
  
  difficulty_level: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(5)),
});

/**
 * TypeScript types derived from schemas
 */
export type Task = z.infer<typeof taskWithMetadataSchema>;
export type CreateTaskData = z.infer<typeof createTaskSchema>;
export type UpdateTaskData = z.infer<typeof updateTaskSchema>;
export type TaskFormData = z.infer<typeof taskFormSchema>;

/**
 * Utility functions for validation
 */
export const validateTask = (data: unknown) => taskSchema.safeParse(data);
export const validateCreateTask = (data: unknown) => createTaskSchema.safeParse(data);
export const validateUpdateTask = (data: unknown) => updateTaskSchema.safeParse(data);
export const validateTaskForm = (data: unknown) => taskFormSchema.safeParse(data);

/**
 * Helper function to get difficulty level label
 */
export const getDifficultyLabel = (level: DifficultyLevel): string => {
  const labels = {
    1: 'Very Easy',
    2: 'Easy', 
    3: 'Medium',
    4: 'Hard',
    5: 'Very Hard',
  };
  return labels[level];
};

/**
 * Helper function to get difficulty color class
 */
export const getDifficultyColor = (level: DifficultyLevel): string => {
  const colors = {
    1: 'text-green-600 bg-green-50',
    2: 'text-blue-600 bg-blue-50',
    3: 'text-yellow-600 bg-yellow-50',
    4: 'text-orange-600 bg-orange-50',
    5: 'text-red-600 bg-red-50',
  };
  return colors[level];
};

/**
 * Helper function to format task category for display
 */
export const formatCategoryDisplay = (category: TaskCategory | null | undefined): string => {
  if (!category) return 'Uncategorized';
  return category;
};