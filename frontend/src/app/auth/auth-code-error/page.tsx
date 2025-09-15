import Link from 'next/link';
import { CalendarDaysIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-3">
          <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-xl">
            <CalendarDaysIcon className="h-7 w-7" />
          </div>
          <span className="text-2xl font-bold">HabitTracker</span>
        </div>

        {/* Error Content */}
        <div className="space-y-6">
          <div className="bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <ExclamationTriangleIcon className="h-8 w-8 text-destructive" />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Authentication Error</h1>
            <p className="text-muted-foreground mt-2">
              There was an issue processing your email confirmation link. This could happen if:
            </p>
          </div>

          <div className="text-left bg-muted p-4 rounded-lg space-y-2">
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• The link has expired</li>
              <li>• The link has already been used</li>
              <li>• There was a temporary network issue</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/login">
                Try Signing In Again
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                Go to Homepage
              </Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Need help? Contact support if this issue persists.
          </p>
        </div>
      </div>
    </div>
  );
}