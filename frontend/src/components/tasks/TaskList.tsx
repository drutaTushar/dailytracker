'use client';

import React, { useState, useMemo } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  Bars3Icon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';
import { TaskCard, TaskCardSkeleton } from './TaskCard';
import type { Task } from '@/lib/validations/task';
import { TASK_CATEGORIES, formatCategoryDisplay } from '@/lib/validations/task';

interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (task: Task) => void;
  onTaskView?: (task: Task) => void;
  onCreateTask?: () => void;
  emptyStateMessage?: string;
}

type SortOption = 'name' | 'created_at' | 'difficulty_level' | 'positive_points';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

interface FilterState {
  search: string;
  category: string;
  difficulty: string;
  showInactive: boolean;
}

export function TaskList({
  tasks,
  loading = false,
  onTaskEdit,
  onTaskDelete,
  onTaskView,
  onCreateTask,
  emptyStateMessage = "No tasks found. Create your first task to get started!"
}: TaskListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    difficulty: '',
    showInactive: false,
  });

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.name.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(task => task.category === filters.category);
    }

    // Apply difficulty filter
    if (filters.difficulty) {
      filtered = filtered.filter(task => 
        task.difficulty_level === parseInt(filters.difficulty)
      );
    }

    // Apply active status filter
    if (!filters.showInactive) {
      filtered = filtered.filter(task => task.is_active);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'difficulty_level':
          aValue = a.difficulty_level;
          bValue = b.difficulty_level;
          break;
        case 'positive_points':
          aValue = a.positive_points;
          bValue = b.positive_points;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tasks, filters, sortBy, sortOrder]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      difficulty: '',
      showInactive: false,
    });
  };

  const hasActiveFilters = filters.search || filters.category || filters.difficulty || filters.showInactive;

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <PlusIcon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {hasActiveFilters ? 'No tasks match your filters' : 'No tasks yet'}
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        {hasActiveFilters 
          ? 'Try adjusting your search criteria or filters to find tasks.'
          : emptyStateMessage
        }
      </p>
      {hasActiveFilters ? (
        <Button variant="outline" onClick={clearFilters}>
          Clear Filters
        </Button>
      ) : onCreateTask ? (
        <Button onClick={onCreateTask}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Your First Task
        </Button>
      ) : null}
    </div>
  );

  const renderLoadingState = () => (
    <div className={viewMode === 'grid' 
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
      : 'space-y-4'
    }>
      {[...Array(6)].map((_, i) => (
        <TaskCardSkeleton key={i} compact={viewMode === 'list'} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col space-y-4">
        {/* Top Row: Search and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Squares2X2Icon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Bars3Icon className="h-4 w-4" />
              </button>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={hasActiveFilters ? 'border-primary text-primary' : ''}
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 bg-primary text-white rounded-full px-2 py-0.5 text-xs">
                  {[filters.category, filters.difficulty, filters.search, filters.showInactive].filter(Boolean).length}
                </span>
              )}
            </Button>

            {onCreateTask && (
              <Button onClick={onCreateTask}>
                <PlusIcon className="h-4 w-4 mr-2" />
                New Task
              </Button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
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

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="">All Levels</option>
                  {[1, 2, 3, 4, 5].map(level => (
                    <option key={level} value={level.toString()}>
                      Level {level}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="created_at">Date Created</option>
                  <option value="name">Name</option>
                  <option value="difficulty_level">Difficulty</option>
                  <option value="positive_points">Points</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Additional Options */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.showInactive}
                  onChange={(e) => handleFilterChange('showInactive', e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Show inactive tasks</span>
              </label>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {loading ? 'Loading...' : `${filteredAndSortedTasks.length} task${filteredAndSortedTasks.length !== 1 ? 's' : ''}`}
            {hasActiveFilters && ` (filtered from ${tasks.length})`}
          </span>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        renderLoadingState()
      ) : filteredAndSortedTasks.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {filteredAndSortedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onTaskEdit}
              onDelete={onTaskDelete}
              onView={onTaskView}
              compact={viewMode === 'list'}
            />
          ))}
        </div>
      )}
    </div>
  );
}