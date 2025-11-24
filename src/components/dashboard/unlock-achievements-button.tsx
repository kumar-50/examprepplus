'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UnlockAchievementsButtonProps {
  hasAchievements: boolean;
  testsCompleted: number;
  nextAchievementProgress?: number;
}

/**
 * Button to manually unlock achievements
 * Auto-triggers when user has completed tests but achievements not unlocked
 * Also triggers when next achievement is at 100%
 */
export function UnlockAchievementsButton({ 
  hasAchievements, 
  testsCompleted,
  nextAchievementProgress = 0,
}: UnlockAchievementsButtonProps) {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  // Auto-unlock on mount if conditions met
  useEffect(() => {
    const shouldAutoUnlock = 
      (!hasAchievements && testsCompleted > 0) || // No achievements but has tests
      (nextAchievementProgress >= 100); // Next achievement is 100% complete
      
    console.log('🔍 Auto-unlock check:', { 
      shouldAutoUnlock, 
      hasAchievements, 
      testsCompleted, 
      nextAchievementProgress 
    });
      
    if (shouldAutoUnlock) {
      // Auto-trigger unlock once per session
      const hasAutoUnlocked = sessionStorage.getItem('achievements-auto-unlocked');
      console.log('📦 Session storage check:', { hasAutoUnlocked });
      
      if (!hasAutoUnlocked) {
        console.log('✅ Auto-triggering achievement unlock...');
        handleUnlock();
        sessionStorage.setItem('achievements-auto-unlocked', 'true');
      }
    }
  }, [hasAchievements, testsCompleted, nextAchievementProgress]);

  const handleUnlock = async () => {
    setIsUnlocking(true);
    setMessage('');

    try {
      const response = await fetch('/api/achievements/unlock', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        if (data.unlockedCount > 0) {
          setMessage(`🎉 Unlocked ${data.unlockedCount} achievement${data.unlockedCount > 1 ? 's' : ''}! (+${data.totalPoints} pts)`);
          // Refresh the page to show new achievements
          setTimeout(() => {
            router.refresh();
          }, 1500);
        } else {
          setMessage('No new achievements to unlock');
        }
      } else {
        setMessage('Failed to unlock achievements');
      }
    } catch (error) {
      console.error('Error unlocking achievements:', error);
      setMessage('Error unlocking achievements');
    } finally {
      setIsUnlocking(false);
    }
  };

  // Show button if no achievements but has tests, OR if next achievement is 100% complete
  const shouldShowButton = 
    (!hasAchievements && testsCompleted > 0) || 
    (nextAchievementProgress >= 100);

  if (!shouldShowButton) {
    return null;
  }

  return (
    <div className="text-center space-y-2">
      {nextAchievementProgress >= 100 && (
        <p className="text-sm text-primary font-medium">
          🎉 Achievement ready to unlock!
        </p>
      )}
      <Button
        onClick={handleUnlock}
        disabled={isUnlocking}
        variant={nextAchievementProgress >= 100 ? "default" : "outline"}
        size="sm"
        className="gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isUnlocking ? 'animate-spin' : ''}`} />
        {isUnlocking ? 'Checking...' : 'Check for Achievements'}
      </Button>
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
