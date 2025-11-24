/**
 * Welcome Header Component
 * Personalized greeting with streak status
 */

import { format } from 'date-fns';
import { getTimeBasedGreeting, getStreakMessage } from '@/lib/dashboard/stats';
import { StreakData } from '@/lib/streak-calculator';

interface WelcomeHeaderProps {
  userName: string;
  streakData: StreakData;
}

export function WelcomeHeader({ userName, streakData }: WelcomeHeaderProps) {
  const greeting = getTimeBasedGreeting();
  const streakMessage = getStreakMessage(streakData);
  const formattedDate = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight">
        {greeting}, {userName}!
      </h1>
      <p className="text-muted-foreground mt-1">{formattedDate}</p>
      {streakMessage && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
            {streakMessage}
          </p>
        </div>
      )}
    </div>
  );
}
