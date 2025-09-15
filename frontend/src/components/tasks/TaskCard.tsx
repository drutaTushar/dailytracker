'use client';

import React, { useState } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  CalendarIcon,
  StarIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';
import { Button } from '@/components/ui';
import type { Task } from '@/lib/validations/task';
import { 
  getDifficultyLabel, 
  getDifficultyColor, 
  formatCategoryDisplay 
} from '@/lib/validations/task';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onView?: (task: Task) => void;
  isLoading?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

export function TaskCard({ 
  task, 
  onEdit, 
  onDelete, 
  onView,
  isLoading = false,
  showActions = true,
  compact = false,
}: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const difficultyLabel = getDifficultyLabel(task.difficulty_level);
  const difficultyColor = getDifficultyColor(task.difficulty_level);
  const categoryDisplay = formatCategoryDisplay(task.category);
  const createdDate = new Date(task.created_at).toLocaleDateString();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(task);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(task);
  };

  const handleView = () => {
    onView?.(task);
  };

  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200
        ${isHovered && !isLoading ? 'shadow-md border-gray-300' : ''}
        ${!task.is_active ? 'opacity-60' : ''}
        ${onView ? 'cursor-pointer' : ''}
        ${compact ? 'p-4' : 'p-6'}
        ${isLoading ? 'opacity-50' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onView ? handleView : undefined}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-gray-900 truncate ${compact ? 'text-base' : 'text-lg'}`}>
            {task.name}
          </h3>
          {!compact && task.description && (
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className={`flex items-center space-x-1 ml-3 ${isHovered || compact ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleView}
                className="p-2"
                title="View details"
              >
                <EyeIcon className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="p-2"
                title="Edit task"
                disabled={isLoading}
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete task"
                disabled={isLoading}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Task Metadata */}
      <div className="space-y-3">
        {/* Points */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-green-600 font-medium text-sm">
                +{task.positive_points}
              </span>
              <span className="text-gray-500 text-xs">on completion</span>
            </div>
            {task.negative_points > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-red-600 font-medium text-sm">
                  -{task.negative_points}
                </span>
                <span className="text-gray-500 text-xs">when missed</span>
              </div>
            )}
          </div>
        </div>

        {/* Category and Difficulty */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Category */}
            {task.category && (
              <div className="flex items-center space-x-1">
                <TagIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{categoryDisplay}</span>
              </div>
            )}

            {/* Difficulty */}
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${difficultyColor}`}>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  i < task.difficulty_level ? (
                    <StarIconSolid key={i} className="h-3 w-3" />
                  ) : (
                    <StarIcon key={i} className="h-3 w-3" />
                  )
                ))}
              </div>
              <span className="ml-1">{difficultyLabel}</span>
            </div>
          </div>

          {/* Created Date */}
          {!compact && (
            <div className="flex items-center space-x-1 text-gray-400">
              <CalendarIcon className="h-4 w-4" />
              <span className="text-xs">{createdDate}</span>
            </div>
          )}
        </div>

        {/* Status Indicator */}
        {!task.is_active && (
          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            Inactive
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact version of TaskCard for lists
 */
export function TaskCardCompact(props: Omit<TaskCardProps, 'compact'>) {
  return <TaskCard {...props} compact />;
}

/**
 * Task card skeleton for loading states
 */
export function TaskCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 animate-pulse ${compact ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className={`bg-gray-200 rounded h-5 w-3/4 ${compact ? 'h-4' : 'h-5'}`}></div>
          {!compact && (
            <div className="bg-gray-200 rounded h-4 w-full mt-2"></div>
          )}
        </div>
        <div className="flex space-x-1 ml-3">
          <div className="bg-gray-200 rounded h-8 w-8"></div>
          <div className="bg-gray-200 rounded h-8 w-8"></div>
          <div className="bg-gray-200 rounded h-8 w-8"></div>
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <div className="bg-gray-200 rounded h-4 w-16"></div>
            <div className="bg-gray-200 rounded h-4 w-16"></div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            <div className="bg-gray-200 rounded h-4 w-20"></div>
            <div className="bg-gray-200 rounded-full h-6 w-24"></div>
          </div>
          {!compact && (
            <div className="bg-gray-200 rounded h-4 w-16"></div>
          )}
        </div>
      </div>
    </div>
  );
}