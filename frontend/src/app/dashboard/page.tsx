'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  PlusIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui';
import { DailyTaskList } from '@/components/daily/DailyTaskList';
import { DailyScoreCard } from '@/components/dashboard/DailyScoreCard';
import { useTasks } from '@/hooks/useTasks';
import { useTaskCompletions } from '@/hooks/useTaskCompletions';
import { getTodayDateString } from '@/lib/validations/completion';

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  
  // Fetch tasks and completions
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const { 
    completions, 
    dailyScore, 
    loading: completionsLoading, 
    error: completionsError,
    toggleTaskCompletion,
    calculateTodayStats,
  } = useTaskCompletions({ 
    date: selectedDate, 
    tasks 
  });

  const loading = tasksLoading || completionsLoading;
  const error = tasksError || completionsError;

  const isToday = selectedDate === getTodayDateString();
  const stats = calculateTodayStats();

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
  };

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isToday ? 'Welcome Back!' : `Daily Tracking - ${formatDisplayDate(selectedDate)}`}
            </h1>
            <p className="text-muted-foreground">
              {isToday 
                ? "Here's your habit tracking dashboard for today."
                : `Review your habits and progress for ${formatDisplayDate(selectedDate).toLowerCase()}.`
              }
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button asChild variant="outline">
              <Link href="/tasks">
                <CogIcon className="h-4 w-4 mr-2" />
                Manage Tasks
              </Link>
            </Button>
            <Button asChild>
              <Link href="/tasks">
                <PlusIcon className="h-4 w-4 mr-2" />
                New Task
              </Link>
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading data
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Daily Score Card */}
          <div className="lg:col-span-1">
            <DailyScoreCard
              dailyScore={dailyScore}
              isLoading={loading}
              showTrend={isToday}
            />
          </div>

          {/* Quick Stats Cards */}
          <div className="lg:col-span-2">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Completion Rate */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-blue-100">
                    <ChartBarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.completionRate}%
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Active Tasks */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-purple-100">
                    <CalendarDaysIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {tasks.filter(t => t.is_active).length}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {tasks.length - tasks.filter(t => t.is_active).length} inactive
                </p>
              </div>

              {/* Today's Progress */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${stats.totalPoints >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <div className={`w-5 h-5 rounded ${stats.totalPoints >= 0 ? 'bg-green-600' : 'bg-red-600'}`}></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Points</p>
                    <p className={`text-2xl font-bold ${stats.totalPoints >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.totalPoints >= 0 ? '+' : ''}{stats.totalPoints}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.completedTasks} of {stats.totalTasks} completed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Task List */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Daily Tasks</h2>
            <p className="text-sm text-gray-500">
              Track your habits and earn points for completing them.
            </p>
          </div>
          
          <div className="p-6">
            <DailyTaskList
              tasks={tasks}
              completions={completions}
              onToggleCompletion={toggleTaskCompletion}
              loading={loading}
              date={selectedDate}
              onDateChange={handleDateChange}
              onCreateTask={() => window.location.href = '/tasks'}
              showDateNavigation={true}
              compact={false}
            />
          </div>
        </div>

        {/* Empty State for No Tasks */}
        {!loading && tasks.filter(t => t.is_active).length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CalendarDaysIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No active tasks
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Create your first task to start tracking your daily habits and building better routines.
            </p>
            <Button asChild>
              <Link href="/tasks">
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Your First Task
              </Link>
            </Button>
          </div>
        )}

        {/* Weekly Overview Placeholder */}
        {tasks.filter(t => t.is_active).length > 0 && (
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">This Week</h3>
              <Button variant="outline" size="sm" disabled>
                View Weekly Report
              </Button>
            </div>
            <div className="text-center py-8">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">
                Weekly analytics and trends coming soon in Sprint 4.1!
              </p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}