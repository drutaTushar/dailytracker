'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarDaysIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className={cn('border-border bg-card border-b', className)}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-md">
              <CalendarDaysIcon className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">HabitTracker</span>
          </Link>

          {/* Navigation */}
          {user && (
            <nav className="hidden items-center space-x-6 md:flex">
              <Link href="/" className="hover:text-primary text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/tasks" className="hover:text-primary text-sm font-medium">
                Tasks
              </Link>
              <Link href="/analytics" className="hover:text-primary text-sm font-medium">
                Analytics
              </Link>
              <Link href="/history" className="hover:text-primary text-sm font-medium">
                History
              </Link>
            </nav>
          )}

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {profile?.display_name || profile?.full_name || user.email}
                </span>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/profile">
                    <Cog6ToothIcon className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button asChild variant="default">
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
