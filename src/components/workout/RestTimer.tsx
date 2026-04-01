import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useWorkoutStore } from '@/stores/workout-store';

interface RestTimerProps {
  onComplete?: () => void;
}

export function RestTimer({ onComplete }: RestTimerProps) {
  const { restTimerEndTime, restTimerDuration, startRestTimer, clearRestTimer } = useWorkoutStore();
  
  const calculateTimeLeft = () => {
    if (!restTimerEndTime) return 0;
    return Math.max(0, Math.round((restTimerEndTime - Date.now()) / 1000));
  };

  // timeLeft is either the remaining time of an active timer, 
  // or a locally paused paused amount, or the default duration.
  const [timeLeft, setTimeLeft] = useState(restTimerDuration);
  const [isRunning, setIsRunning] = useState(false);

  // Sync state when component mounts or global timer changes
  useEffect(() => {
    if (restTimerEndTime) {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      setIsRunning(remaining > 0);
    } else {
      setIsRunning(false);
      // Wait, don't reset timeLeft to duration automatically if it was just paused
      // We only reset if we want. But let's leave timeLeft as is if paused.
    }
  }, [restTimerEndTime]);

  useEffect(() => {
    if (!isRunning || !restTimerEndTime) return;
    
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        setIsRunning(false);
        clearRestTimer();
        onComplete?.();
        // Vibrate if supported
        if (navigator.vibrate) navigator.vibrate(200);
      }
    }, 200);
    
    return () => clearInterval(interval);
  }, [isRunning, restTimerEndTime, onComplete, clearRestTimer]);

  const toggleTimer = () => {
    if (isRunning) {
      // Pause: clear global timer, keep local timeLeft
      clearRestTimer();
      setIsRunning(false);
    } else {
      // Resume or Start
      const durationToStart = timeLeft > 0 ? timeLeft : restTimerDuration;
      startRestTimer(durationToStart);
      setIsRunning(true);
    }
  };

  const resetTimer = () => {
    clearRestTimer();
    setTimeLeft(restTimerDuration);
    setIsRunning(false);
  };

  const progress = ((restTimerDuration - timeLeft) / restTimerDuration) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = Math.max(0, circumference - (progress / 100) * circumference);

  return (
    <Card className="bg-secondary/50 border-border/50">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="relative h-16 w-16 shrink-0">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
            <circle
              cx="50" cy="50" r="45" fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="4" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset || 0}
              className="transition-all duration-1000"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold font-mono">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Rest Timer</p>
          <p className="text-sm text-foreground">{timeLeft === 0 ? 'Time\'s up!' : isRunning ? 'Resting...' : 'Ready'}</p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost" size="icon"
            onClick={toggleTimer}
            className="h-8 w-8"
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost" size="icon"
            onClick={resetTimer}
            className="h-8 w-8"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
