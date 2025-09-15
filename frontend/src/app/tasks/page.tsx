'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { ConfirmDialog, useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useTasks } from '@/hooks/useTasks';
import type { Task, TaskFormData } from '@/lib/validations/task';
import { 
  validateCreateTask, 
  validateUpdateTask,
  formatCategoryDisplay 
} from '@/lib/validations/task';

type ViewMode = 'list' | 'create' | 'edit';

export default function TasksPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [detailModalTask, setDetailModalTask] = useState<Task | null>(null);

  const { 
    tasks, 
    loading, 
    error, 
    createTask, 
    updateTask, 
    deleteTask 
  } = useTasks();

  const { isOpen, showConfirm, hideConfirm, confirmDialog } = useConfirmDialog();

  const handleCreateTask = () => {
    setSelectedTask(null);
    setViewMode('create');
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setViewMode('edit');
  };

  const handleDeleteTask = (task: Task) => {
    showConfirm(
      {
        title: 'Delete Task',
        message: `Are you sure you want to delete "${task.name}"? This action cannot be undone.`,
        confirmText: 'Delete Task',
        cancelText: 'Cancel',
        variant: 'danger',
        isLoading: deletingTaskId === task.id,
      },
      async () => {
        setDeletingTaskId(task.id);
        const success = await deleteTask(task.id);
        setDeletingTaskId(null);
        
        if (!success) {
          // Show error - could integrate with toast/notification system
          console.error('Failed to delete task');
        }
      }
    );
  };

  const handleViewTask = (task: Task) => {
    setDetailModalTask(task);
  };

  const handleFormSubmit = async (formData: TaskFormData) => {
    try {
      if (viewMode === 'create') {
        // Convert form data to create task data
        const createData = {
          name: formData.name,
          description: formData.description || null,
          positive_points: parseInt(formData.positive_points),
          negative_points: parseInt(formData.negative_points),
          category: formData.category || null,
          difficulty_level: parseInt(formData.difficulty_level),
        };

        const validation = validateCreateTask(createData);
        if (!validation.success) {
          console.error('Validation failed:', validation.error);
          return;
        }

        const newTask = await createTask(validation.data);
        if (newTask) {
          setViewMode('list');
        }
      } else if (viewMode === 'edit' && selectedTask) {
        // Convert form data to update task data
        const updateData = {
          id: selectedTask.id,
          name: formData.name,
          description: formData.description || null,
          positive_points: parseInt(formData.positive_points),
          negative_points: parseInt(formData.negative_points),
          category: formData.category || null,
          difficulty_level: parseInt(formData.difficulty_level),
        };

        const validation = validateUpdateTask(updateData);
        if (!validation.success) {
          console.error('Validation failed:', validation.error);
          return;
        }

        const updatedTask = await updateTask(selectedTask.id, validation.data);
        if (updatedTask) {
          setViewMode('list');
          setSelectedTask(null);
        }
      }
    } catch (error) {
      console.error('Error submitting task:', error);
    }
  };

  const handleFormCancel = () => {
    setViewMode('list');
    setSelectedTask(null);
  };

  const renderHeader = () => {
    switch (viewMode) {
      case 'create':
        return (
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Create New Task</h1>
            <p className="text-muted-foreground">
              Add a new habit to track in your daily routine.
            </p>
          </div>
        );
      case 'edit':
        return (
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Edit Task</h1>
            <p className="text-muted-foreground">
              Make changes to your existing habit.
            </p>
          </div>
        );
      default:
        return (
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">
              Manage your daily habits and track your progress.
            </p>
          </div>
        );
    }
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'create':
        return (
          <TaskForm
            mode="create"
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        );
      case 'edit':
        return (
          <TaskForm
            mode="edit"
            task={selectedTask}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        );
      default:
        return (
          <TaskList
            tasks={tasks}
            loading={loading}
            onTaskEdit={handleEditTask}
            onTaskDelete={handleDeleteTask}
            onTaskView={handleViewTask}
            onCreateTask={handleCreateTask}
          />
        );
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {renderHeader()}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading tasks
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {renderContent()}

        {/* Task Detail Modal */}
        <TaskDetailModal
          isOpen={detailModalTask !== null}
          onClose={() => setDetailModalTask(null)}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          task={detailModalTask}
        />

        {/* Confirmation Dialog */}
        {confirmDialog}
      </div>
    </MainLayout>
  );
}