import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MuscleRecovery } from '@/lib/types';
import { MUSCLE_LABELS } from '@/lib/program-data';
import { cn } from '@/lib/utils';

interface RecoveryStatusProps {
  recovery: MuscleRecovery[];
}

export function RecoveryStatusPanel({ recovery }: RecoveryStatusProps) {
  const trained = recovery.filter(r => r.lastTrained !== null);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recovery Status</CardTitle>
      </CardHeader>
      <CardContent>
        {trained.length === 0 ? (
          <p className="text-sm text-muted-foreground">No workouts logged yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {trained.map(r => (
              <div key={r.muscle} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                <div className={cn(
                  'h-2 w-2 rounded-full shrink-0',
                  r.status === 'recovered' && 'bg-primary',
                  r.status === 'recovering' && 'bg-yellow-500',
                  r.status === 'fatigued' && 'bg-destructive',
                )} />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{MUSCLE_LABELS[r.muscle]}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{r.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
