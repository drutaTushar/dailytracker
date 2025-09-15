'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui';
import { 
  taskFormSchema,
  type TaskFormData,
  type Task,
  TASK_CATEGORIES,
  DIFFICULTY_LEVELS,
  getDifficultyLabel,
  getDifficultyColor,
} from '@/lib/validations/task';
import { 
  PlusIcon, 
  XMarkIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

export function TaskForm({ 
  task, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  mode = 'create'
}: TaskFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      name: '',
      description: '',
      positive_points: '1',
      negative_points: '0',
      category: '',
      difficulty_level: '1',
    },
  });

  // Watch form values for real-time updates
  const watchedDifficulty = watch('difficulty_level');
  const watchedPositivePoints = watch('positive_points');
  const watchedNegativePoints = watch('negative_points');

  // Pre-populate form when editing
  useEffect(() => {
    if (task && mode === 'edit') {
      reset({
        name: task.name,
        description: task.description || '',
        positive_points: task.positive_points.toString(),
        negative_points: task.negative_points.toString(),
        category: task.category || '',
        difficulty_level: task.difficulty_level.toString(),
      });
    }
  }, [task, mode, reset]);

  const handleFormSubmit = async (data: TaskFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDifficulty = parseInt(watchedDifficulty) as typeof DIFFICULTY_LEVELS[number];
  const difficultyLabel = getDifficultyLabel(currentDifficulty);
  const difficultyColor = getDifficultyColor(currentDifficulty);

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {mode === 'create' ? 'Create New Task' : 'Edit Task'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="p-2"
          >
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
        {/* Task Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Task Name *
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., Morning Exercise, Read for 30 minutes"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Task Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            rows={3}
            {...register('description')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder="Add more details about this task..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Points Configuration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="positive_points" className="block text-sm font-medium text-gray-700 mb-2">
              Points When Completed
            </label>
            <input
              id="positive_points"
              type="number"
              min="0"
              max="100"
              {...register('positive_points')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.positive_points && (
              <p className="mt-1 text-sm text-red-600">{errors.positive_points.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="negative_points" className="block text-sm font-medium text-gray-700 mb-2">
              Points When Missed
            </label>
            <input
              id="negative_points"
              type="number"
              min="0"
              max="100"
              {...register('negative_points')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.negative_points && (
              <p className="mt-1 text-sm text-red-600">{errors.negative_points.message}</p>
            )}
          </div>
        </div>

        {/* Points Preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-green-600 font-medium">
                +{watchedPositivePoints || 0} points
              </span>
              <span className="text-gray-500">when completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-red-600 font-medium">
                -{watchedNegativePoints || 0} points
              </span>
              <span className="text-gray-500">when missed</span>
            </div>
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80"
          >
            <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
            <InformationCircleIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-4 border-t border-gray-200 pt-4">
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select a category</option>
                {TASK_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            {/* Difficulty Level */}
            <div>
              <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <div className="space-y-3">
                <select
                  id="difficulty_level"
                  {...register('difficulty_level')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {DIFFICULTY_LEVELS.map(level => (
                    <option key={level} value={level.toString()}>
                      {level} - {getDifficultyLabel(level)}
                    </option>
                  ))}
                </select>
                
                {/* Difficulty Preview */}
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${difficultyColor}`}>
                  Level {currentDifficulty}: {difficultyLabel}
                </div>
              </div>
              {errors.difficulty_level && (
                <p className="mt-1 text-sm text-red-600">{errors.difficulty_level.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isLoading || (!isDirty && mode === 'edit')}
            className="min-w-[100px]"
          >
            {isSubmitting || isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{mode === 'create' ? 'Creating...' : 'Saving...'}</span>
              </div>
            ) : (
              <>
                {mode === 'create' ? (
                  <>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Task
                  </>
                ) : (
                  'Save Changes'
                )}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}