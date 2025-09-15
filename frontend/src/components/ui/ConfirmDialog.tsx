'use client';

import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

const variantConfig = {
  danger: {
    icon: XCircleIcon,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    confirmButtonVariant: 'destructive' as const,
  },
  warning: {
    icon: ExclamationTriangleIcon,
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    confirmButtonVariant: 'destructive' as const,
  },
  info: {
    icon: InformationCircleIcon,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    confirmButtonVariant: 'default' as const,
  },
  success: {
    icon: CheckCircleIcon,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    confirmButtonVariant: 'default' as const,
  },
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  const handleConfirm = () => {
    onConfirm();
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center`}>
                    <IconComponent className={`h-6 w-6 ${config.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 mb-2"
                    >
                      {title}
                    </Dialog.Title>
                    <Dialog.Description className="text-sm text-gray-500 mb-6">
                      {message}
                    </Dialog.Description>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                      >
                        {cancelText}
                      </Button>
                      <Button
                        variant={config.confirmButtonVariant}
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="min-w-[80px]"
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Loading...</span>
                          </div>
                        ) : (
                          confirmText
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

/**
 * Hook to manage confirm dialog state
 */
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<Omit<ConfirmDialogProps, 'isOpen' | 'onClose' | 'onConfirm'>>({
    title: '',
    message: '',
  });
  const [onConfirm, setOnConfirm] = React.useState<(() => void) | null>(null);

  const showConfirm = React.useCallback((
    confirmConfig: Omit<ConfirmDialogProps, 'isOpen' | 'onClose' | 'onConfirm'>,
    confirmCallback: () => void
  ) => {
    setConfig(confirmConfig);
    setOnConfirm(() => confirmCallback);
    setIsOpen(true);
  }, []);

  const hideConfirm = React.useCallback(() => {
    setIsOpen(false);
    setOnConfirm(null);
  }, []);

  const handleConfirm = React.useCallback(() => {
    if (onConfirm) {
      onConfirm();
    }
    hideConfirm();
  }, [onConfirm, hideConfirm]);

  return {
    isOpen,
    showConfirm,
    hideConfirm,
    confirmDialog: (
      <ConfirmDialog
        {...config}
        isOpen={isOpen}
        onClose={hideConfirm}
        onConfirm={handleConfirm}
      />
    ),
  };
}