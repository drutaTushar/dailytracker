'use client';

import React, { useState } from 'react';
import { 
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleIconSolid,
} from '@heroicons/react/24/solid';
import { Button } from '@/components/ui';
import type { Task } from '@/lib/validations/task';
import type { TaskCompletion } from '@/lib/validations/completion';
import { 
  getDifficultyLabel, 
  getDifficultyColor, 
  formatCategoryDisplay 
} from '@/lib/validations/task';
import { calculatePointsEarned } from '@/lib/validations/completion';

interface DailyTaskCardProps {
  task: Task;
  completion: TaskCompletion | null;
  onToggleCompletion: (task: Task) => Promise<boolean>;
  isLoading?: boolean;
  compact?: boolean;
  showCategory?: boolean;
  showDifficulty?: boolean;
}

export function DailyTaskCard({
  task,
  completion,
  onToggleCompletion,
  isLoading = false,
  compact = false,
  showCategory = true,
  showDifficulty = true,
}: DailyTaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const isCompleted = completion?.is_completed || false;
  const pointsEarned = completion?.points_earned || 0;
  const expectedPoints = calculatePointsEarned(task, true);
  const penaltyPoints = calculatePointsEarned(task, false);

  const handleToggle = async () => {
    if (isUpdating || isLoading) return;
    
    try {
      setIsUpdating(true);
      await onToggleCompletion(task);
    } catch (error) {
      console.error('Error toggling completion:', error);
    } finally {
      setIsUpdating(false);
    }
  };


  const getPointsDisplay = () => {
    if (completion) {
      if (isCompleted) {
        return (
          <span className="text-green-600 font-semibold">
            +{pointsEarned}
          </span>
        );
      } else {
        return (
          <span className="text-red-600 font-semibold">
            {pointsEarned}
          </span>
        );
      }
    }
    
    return (
      <div className="flex items-center space-x-1 text-sm text-gray-500">
        <span className="text-green-600">+{expectedPoints}</span>
        {task.negative_points > 0 && (
          <>
            <span>/</span>
            <span className="text-red-600">{penaltyPoints}</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className={`
      bg-white rounded-lg border transition-all duration-200
      ${isCompleted ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}
      ${!task.is_active ? 'opacity-60' : ''}
      ${compact ? 'p-4' : 'p-6'}
      ${isUpdating ? 'opacity-75' : ''}
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {/* Completion Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            disabled={isUpdating || isLoading}
            className={`
              p-2 rounded-full transition-all duration-200
              ${isCompleted 
                ? 'text-green-600 hover:text-green-700 hover:bg-green-100' 
                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
              }
              ${isUpdating ? 'animate-pulse' : ''}
            `}
            title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isCompleted ? (
              <CheckCircleIconSolid className="h-6 w-6" />
            ) : (
              <CheckCircleIcon className="h-6 w-6" />
            )}
          </Button>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <h3 className={`
              font-semibold text-gray-900 truncate
              ${compact ? 'text-base' : 'text-lg'}
              ${isCompleted ? 'line-through text-gray-600' : ''}
            `}>
              {task.name}
            </h3>
            
            {!compact && task.description && (
              <p className={`
                text-sm mt-1 line-clamp-2
                ${isCompleted ? 'text-gray-500' : 'text-gray-600'}
              `}>
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Points Display */}
        <div className="ml-3 text-right">
          {getPointsDisplay()}
        </div>
      </div>

      {/* Metadata */}
      {!compact && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Category */}
            {showCategory && task.category && (
              <div className="flex items-center space-x-1">
                <TagIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {formatCategoryDisplay(task.category)}
                </span>
              </div>
            )}

            {/* Difficulty */}
            {showDifficulty && (
              <div className={`
                inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                ${getDifficultyColor(task.difficulty_level as 1 | 2 | 3 | 4 | 5)}
              `}>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon 
                      key={i} 
                      className={`h-3 w-3 ${i < task.difficulty_level ? 'fill-current' : ''}`} 
                    />
                  ))}
                </div>
                <span className="ml-1">{getDifficultyLabel(task.difficulty_level as 1 | 2 | 3 | 4 | 5)}</span>
              </div>
            )}
          </div>

          {/* Completion Time */}
          {completion && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <ClockIcon className="h-4 w-4" />
              <span>
                {new Date(completion.updated_at).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Loading Overlay */}
      {(isUpdating || isLoading) && (
        <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for list views
 */
export function DailyTaskCardCompact(props: Omit<DailyTaskCardProps, 'compact'>) {
  return <DailyTaskCard {...props} compact />;
}

/**
 * Loading skeleton for daily task cards
 */
export function DailyTaskCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 animate-pulse ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <div className="bg-gray-200 rounded-full h-10 w-10"></div>
          <div className="flex-1">
            <div className={`bg-gray-200 rounded h-5 w-3/4 ${compact ? 'h-4' : 'h-5'}`}></div>
            {!compact && (
              <div className="bg-gray-200 rounded h-4 w-full mt-2"></div>
            )}
          </div>
        </div>
        <div className="bg-gray-200 rounded h-6 w-12"></div>
      </div>
      
      {!compact && (
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            <div className="bg-gray-200 rounded h-4 w-20"></div>
            <div className="bg-gray-200 rounded-full h-6 w-24"></div>
          </div>
          <div className="bg-gray-200 rounded h-4 w-16"></div>
        </div>
      )}
    </div>
  );
}