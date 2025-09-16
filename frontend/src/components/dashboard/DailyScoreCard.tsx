'use client';

import React from 'react';
import { 
  TrophyIcon,
  FireIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { 
  TrophyIcon as TrophyIconSolid,
} from '@heroicons/react/24/solid';
import type { DailyScore } from '@/lib/validations/completion';

interface DailyScoreCardProps {
  dailyScore: DailyScore | null;
  isLoading?: boolean;
  compact?: boolean;
  showTrend?: boolean;
  previousScore?: number;
}

export function DailyScoreCard({
  dailyScore,
  isLoading = false,
  compact = false,
  showTrend = false,
  previousScore,
}: DailyScoreCardProps) {
  if (isLoading) {
    return <DailyScoreCardSkeleton compact={compact} />;
  }

  const totalPoints = dailyScore?.total_points || 0;
  const completedTasks = dailyScore?.completed_tasks || 0;
  const totalTasks = dailyScore?.total_tasks || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate trend
  const trend = showTrend && previousScore !== undefined ? totalPoints - previousScore : null;
  const hasPositiveTrend = trend !== null && trend > 0;
  const hasNegativeTrend = trend !== null && trend < 0;

  const getScoreColor = (points: number) => {
    if (points > 0) return 'text-green-600';
    if (points < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-100';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100';
    if (rate >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${totalPoints >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <TrophyIcon className={`h-5 w-5 ${getScoreColor(totalPoints)}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Today&apos;s Score</p>
              <p className={`text-xl font-bold ${getScoreColor(totalPoints)}`}>
                {totalPoints >= 0 ? '+' : ''}{totalPoints}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Completion</p>
            <p className="text-sm font-semibold text-gray-700">
              {completedTasks}/{totalTasks}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-full ${totalPoints >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
            {totalPoints > 0 ? (
              <TrophyIconSolid className="h-6 w-6 text-green-600" />
            ) : (
              <TrophyIcon className={`h-6 w-6 ${getScoreColor(totalPoints)}`} />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Today&apos;s Score</h3>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Trend Indicator */}
        {showTrend && trend !== null && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            hasPositiveTrend ? 'text-green-700 bg-green-100' :
            hasNegativeTrend ? 'text-red-700 bg-red-100' :
            'text-gray-700 bg-gray-100'
          }`}>
            {hasPositiveTrend && <ArrowUpIcon className="h-3 w-3" />}
            {hasNegativeTrend && <ArrowDownIcon className="h-3 w-3" />}
            <span>
              {trend > 0 ? '+' : ''}{trend} vs yesterday
            </span>
          </div>
        )}
      </div>

      {/* Main Score */}
      <div className="text-center mb-6">
        <div className={`text-4xl font-bold ${getScoreColor(totalPoints)} mb-2`}>
          {totalPoints >= 0 ? '+' : ''}{totalPoints}
        </div>
        <p className="text-gray-600">Points earned today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Completion Rate */}
        <div className="text-center">
          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getCompletionRateColor(completionRate)}`}>
            {completionRate}%
          </div>
          <p className="text-xs text-gray-500 mt-1">Completion Rate</p>
        </div>

        {/* Tasks Completed */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1">
            <CalendarDaysIcon className="h-4 w-4 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">
              {completedTasks}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Completed</p>
        </div>

        {/* Total Tasks */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1">
            <ChartBarIcon className="h-4 w-4 text-purple-600" />
            <span className="text-lg font-semibold text-gray-900">
              {totalTasks}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Total Tasks</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{completedTasks} of {totalTasks} tasks</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              completionRate >= 80 ? 'bg-green-500' :
              completionRate >= 60 ? 'bg-yellow-500' :
              completionRate >= 40 ? 'bg-orange-500' :
              'bg-red-500'
            }`}
            style={{ width: `${Math.min(completionRate, 100)}%` }}
          />
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-4 text-center">
        {completionRate === 100 ? (
          <p className="text-green-600 font-medium flex items-center justify-center space-x-1">
            <FireIcon className="h-4 w-4" />
            <span>Perfect day! 🎉</span>
          </p>
        ) : completionRate >= 80 ? (
          <p className="text-green-600 font-medium">Great progress! Keep it up! 💪</p>
        ) : completionRate >= 60 ? (
          <p className="text-yellow-600 font-medium">Good work! You&apos;re on track! ⭐</p>
        ) : completionRate >= 40 ? (
          <p className="text-orange-600 font-medium">You can do this! Keep going! 🚀</p>
        ) : completionRate > 0 ? (
          <p className="text-red-600 font-medium">Every task counts! Start small! 🌱</p>
        ) : (
          <p className="text-gray-600 font-medium">Ready to start your day? 🌟</p>
        )}
      </div>
    </div>
  );
}

/**
 * Loading skeleton for daily score card
 */
export function DailyScoreCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="bg-white rounded-lg border p-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-200 rounded-full h-10 w-10"></div>
            <div>
              <div className="bg-gray-200 rounded h-4 w-20 mb-2"></div>
              <div className="bg-gray-200 rounded h-6 w-16"></div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-gray-200 rounded h-3 w-16 mb-1"></div>
            <div className="bg-gray-200 rounded h-4 w-12"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gray-200 rounded-full h-12 w-12"></div>
          <div>
            <div className="bg-gray-200 rounded h-5 w-24 mb-2"></div>
            <div className="bg-gray-200 rounded h-4 w-32"></div>
          </div>
        </div>
        <div className="bg-gray-200 rounded-full h-6 w-20"></div>
      </div>

      {/* Main Score */}
      <div className="text-center mb-6">
        <div className="bg-gray-200 rounded h-12 w-20 mx-auto mb-2"></div>
        <div className="bg-gray-200 rounded h-4 w-32 mx-auto"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="text-center">
            <div className="bg-gray-200 rounded-full h-6 w-12 mx-auto mb-1"></div>
            <div className="bg-gray-200 rounded h-3 w-16 mx-auto"></div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between mb-2">
          <div className="bg-gray-200 rounded h-4 w-16"></div>
          <div className="bg-gray-200 rounded h-4 w-20"></div>
        </div>
        <div className="bg-gray-200 rounded-full h-2 w-full"></div>
      </div>

      {/* Motivational Message */}
      <div className="mt-4 text-center">
        <div className="bg-gray-200 rounded h-4 w-40 mx-auto"></div>
      </div>
    </div>
  );
}