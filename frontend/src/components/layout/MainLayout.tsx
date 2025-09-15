import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div className={cn('bg-background min-h-screen', className)}>
      {/* Mobile Header - visible on mobile only */}
      <div className="lg:hidden">
        <Header />
      </div>

      <div className="flex h-screen">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden lg:flex">
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Desktop Header - visible on desktop only */}
          <div className="hidden lg:block">
            <Header />
          </div>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
