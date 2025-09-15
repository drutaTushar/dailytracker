'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
  HomeIcon,
  ListBulletIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

interface SidebarProps {
  className?: string;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: "Today's Tasks", href: '/tasks/today', icon: ListBulletIcon },
  { name: 'All Tasks', href: '/tasks', icon: CalendarDaysIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'History', href: '/history', icon: ClockIcon },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn('border-border bg-card flex h-full w-64 flex-col border-r', className)}>
      {/* Logo */}
      <div className="border-border flex h-16 items-center border-b px-6">
        <div className="flex items-center space-x-2">
          <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-md">
            <CalendarDaysIcon className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">HabitTracker</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        <div className="mb-4">
          <Button className="w-full justify-start" size="sm">
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            Add New Task
          </Button>
        </div>

        {navigation.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-border border-t p-4">
        <div className="text-muted-foreground text-xs">
          <p>Daily Score</p>
          <p className="text-habit-positive text-2xl font-bold">+45</p>
          <p>5 of 8 tasks completed</p>
        </div>
      </div>
    </div>
  );
}
