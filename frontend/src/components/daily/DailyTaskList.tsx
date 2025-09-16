'use client';

import React, { useState, useMemo } from 'react';
import { 
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';
import { DailyTaskCard, DailyTaskCardSkeleton } from './DailyTaskCard';
import type { Task } from '@/lib/validations/task';
import type { TaskCompletion } from '@/lib/validations/completion';
import { TASK_CATEGORIES, formatCategoryDisplay } from '@/lib/validations/task';

interface DailyTaskListProps {
  tasks: Task[];
  completions: TaskCompletion[];
  onToggleCompletion: (task: Task) => Promise<boolean>;
  loading?: boolean;
  date?: string;
  onDateChange?: (date: string) => void;
  onCreateTask?: () => void;
  showDateNavigation?: boolean;
  compact?: boolean;
}

type FilterOption = 'all' | 'completed' | 'pending';

export function DailyTaskList({
  tasks,
  completions,
  onToggleCompletion,
  loading = false,
  date,
  onDateChange,
  onCreateTask,
  showDateNavigation = true,
  compact = false,
}: DailyTaskListProps) {
  const [filter, setFilter] = useState<FilterOption>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Get today's date as default
  const today = new Date().toISOString().split('T')[0];
  const currentDate = date || today;
  const isToday = currentDate === today;

  // Create completion lookup map
  const completionMap = useMemo(() => {
    const map = new Map<string, TaskCompletion>();
    completions.forEach(completion => {
      map.set(completion.task_id, completion);
    });
    return map;
  }, [completions]);

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => task.is_active);

    // Apply completion filter
    if (filter === 'completed') {
      filtered = filtered.filter(task => {
        const completion = completionMap.get(task.id);
        return completion?.is_completed === true;
      });
    } else if (filter === 'pending') {
      filtered = filtered.filter(task => {
        const completion = completionMap.get(task.id);
        return !completion || completion.is_completed === false;
      });
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(task => task.category === categoryFilter);
    }

    return filtered;
  }, [tasks, filter, categoryFilter, completionMap]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeTasks = tasks.filter(task => task.is_active);
    const completedTasks = activeTasks.filter(task => {
      const completion = completionMap.get(task.id);
      return completion?.is_completed === true;
    });
    
    const totalPoints = completions
      .filter(c => c.completion_date === currentDate)
      .reduce((sum, completion) => sum + completion.points_earned, 0);

    return {
      total: activeTasks.length,
      completed: completedTasks.length,
      pending: activeTasks.length - completedTasks.length,
      totalPoints,
      completionRate: activeTasks.length > 0 ? Math.round((completedTasks.length / activeTasks.length) * 100) : 0,
    };
  }, [tasks, completionMap, completions, currentDate]);

  // Date navigation handlers
  const navigateDate = (direction: 'prev' | 'next') => {
    if (!onDateChange) return;
    
    const current = new Date(currentDate);
    const newDate = new Date(current);
    newDate.setDate(current.getDate() + (direction === 'next' ? 1 : -1));
    onDateChange(newDate.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    if (onDateChange) {
      onDateChange(today);
    }
  };

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else if (dateString === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <CalendarDaysIcon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {filter === 'all' ? 'No tasks for this day' : 
         filter === 'completed' ? 'No completed tasks' : 'No pending tasks'}
      </h3>
      <p className="text-gray-500 mb-6">
        {filter === 'all' && onCreateTask ? 
          'Create your first task to start tracking your habits.' :
          'Try adjusting your filters or check back later.'
        }
      </p>
      {filter === 'all' && onCreateTask && (
        <Button onClick={onCreateTask}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      )}
    </div>
  );

  const renderLoadingState = () => (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <DailyTaskCardSkeleton key={i} compact={compact} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Date Navigation */}
      {showDateNavigation && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('prev')}
                disabled={!onDateChange}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="h-5 w-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {formatDisplayDate(currentDate)}
                </h2>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('next')}
                disabled={!onDateChange}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>

            {!isToday && (
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                disabled={!onDateChange}
              >
                Today
              </Button>
            )}
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'border-primary text-primary' : ''}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-xl font-bold text-green-600">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <XCircleIcon className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-xl font-bold text-orange-600">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <div className={`w-5 h-5 rounded ${stats.totalPoints >= 0 ? 'bg-green-600' : 'bg-red-600'}`}></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Points</p>
              <p className={`text-xl font-bold ${stats.totalPoints >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.totalPoints >= 0 ? '+' : ''}{stats.totalPoints}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex space-x-2">
                {([
                  { value: 'all', label: 'All Tasks' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'pending', label: 'Pending' },
                ] as const).map(option => (
                  <Button
                    key={option.value}
                    variant={filter === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="">All Categories</option>
                {TASK_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {formatCategoryDisplay(category)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(filter !== 'all' || categoryFilter) && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">
                {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} match your filters
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilter('all');
                  setCategoryFilter('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Task List */}
      {loading ? (
        renderLoadingState()
      ) : filteredTasks.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="space-y-4">
          {filteredTasks.map(task => (
            <DailyTaskCard
              key={task.id}
              task={task}
              completion={completionMap.get(task.id) || null}
              onToggleCompletion={onToggleCompletion}
              compact={compact}
            />
          ))}
        </div>
      )}
    </div>
  );
}