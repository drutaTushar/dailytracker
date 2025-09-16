'use client';

import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  TagIcon,
  ChartBarIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Task } from '@/lib/validations/task';
import { 
  getDifficultyLabel, 
  getDifficultyColor, 
  formatCategoryDisplay 
} from '@/lib/validations/task';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  task: Task | null;
}

export function TaskDetailModal({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  task,
}: TaskDetailModalProps) {
  if (!task) return null;

  const difficultyLabel = getDifficultyLabel(task.difficulty_level as 1 | 2 | 3 | 4 | 5);
  const difficultyColor = getDifficultyColor(task.difficulty_level as 1 | 2 | 3 | 4 | 5);
  const categoryDisplay = formatCategoryDisplay(task.category);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEdit = () => {
    onEdit(task);
    onClose();
  };

  const handleDelete = () => {
    onDelete(task);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <Dialog.Title
                      as="h3"
                      className="text-2xl font-bold leading-6 text-gray-900 mb-2"
                    >
                      {task.name}
                    </Dialog.Title>
                    <div className="flex items-center space-x-4">
                      <Badge
                        variant="secondary"
                        className={`${difficultyColor} border-0`}
                      >
                        <ChartBarIcon className="w-3 h-3 mr-1" />
                        {difficultyLabel}
                      </Badge>
                      {task.category && (
                        <Badge variant="outline">
                          <TagIcon className="w-3 h-3 mr-1" />
                          {categoryDisplay}
                        </Badge>
                      )}
                      <Badge variant={task.is_active ? "default" : "secondary"}>
                        {task.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-6">
                  {/* Description */}
                  {task.description && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                        <InformationCircleIcon className="w-4 h-4 mr-2" />
                        Description
                      </h4>
                      <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-4">
                        {task.description}
                      </p>
                    </div>
                  )}

                  {/* Points System */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Points System</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-800">Positive Points</span>
                          <span className="text-2xl font-bold text-green-600">+{task.positive_points}</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">Earned when completed</p>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-red-800">Negative Points</span>
                          <span className="text-2xl font-bold text-red-600">-{task.negative_points}</span>
                        </div>
                        <p className="text-xs text-red-600 mt-1">Lost when missed</p>
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        <div>
                          <span className="font-medium">Created:</span>
                          <br />
                          <span className="text-xs">{formatDate(task.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        <div>
                          <span className="font-medium">Last Updated:</span>
                          <br />
                          <span className="text-xs">{formatDate(task.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statistics Placeholder */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Performance Statistics</h4>
                    <p className="text-sm text-blue-700">
                      Completion statistics and trends will be available once you start tracking this task.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                  <Button variant="outline" onClick={handleEdit}>
                    Edit Task
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete Task
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}