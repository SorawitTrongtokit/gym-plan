import { useEffect, useState } from 'react';
import { useWorkoutStore } from '@/stores/workout-store';
import { Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Global Rest Timer indicator that shows in the navbar
 * when a timer is active, even on other pages.
 */
export function GlobalTimerIndicator() {
  const { restTimerEndTime, clearRestTimer } = useWorkoutStore();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!restTimerEndTime) {
      setTimeLeft(0);
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, Math.round((restTimerEndTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearRestTimer();
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [restTimerEndTime, clearRestTimer]);

  if (!restTimerEndTime || timeLeft <= 0) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft <= 5;

  return (
    <div
      className={cn(
        'fixed top-3 right-3 z-[60] flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold shadow-lg border transition-all',
        isUrgent
          ? 'bg-destructive/90 text-destructive-foreground border-destructive animate-pulse'
          : 'bg-card/95 text-primary border-primary/30 glass pulse-ring'
      )}
    >
      <Timer className="h-3.5 w-3.5" />
      <span>{minutes}:{seconds.toString().padStart(2, '0')}</span>
    </div>
  );
}
