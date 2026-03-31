import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface RestTimerProps {
  duration: number;
  autoStart?: boolean;
  onComplete?: () => void;
}

export function RestTimer({ duration, autoStart = false, onComplete }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);

  useEffect(() => {
    if (autoStart) {
      setTimeLeft(duration);
      setIsRunning(true);
    }
  }, [autoStart, duration]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          onComplete?.();
          // Vibrate if supported
          if (navigator.vibrate) navigator.vibrate(200);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  const progress = ((duration - timeLeft) / duration) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

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
              strokeDashoffset={strokeDashoffset}
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
            onClick={() => setIsRunning(!isRunning)}
            className="h-8 w-8"
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost" size="icon"
            onClick={() => { setTimeLeft(duration); setIsRunning(false); }}
            className="h-8 w-8"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
