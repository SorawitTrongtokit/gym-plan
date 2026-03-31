import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MuscleVolume } from '@/lib/types';
import { MUSCLE_LABELS } from '@/lib/program-data';
import { cn } from '@/lib/utils';

interface VolumeChartProps {
  volumes: MuscleVolume[];
}

export function VolumeChart({ volumes }: VolumeChartProps) {
  const maxSets = Math.max(25, ...volumes.map(v => v.sets));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Weekly Volume</CardTitle>
        <p className="text-xs text-muted-foreground">Sets per muscle group (target: 10-20)</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {volumes.map(v => (
          <div key={v.muscle} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{MUSCLE_LABELS[v.muscle]}</span>
              <span className={cn(
                'font-medium',
                v.status === 'optimal' && 'text-primary',
                v.status === 'low' && 'text-destructive',
                v.status === 'excessive' && 'text-yellow-500',
              )}>
                {v.sets} sets
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  v.status === 'optimal' && 'bg-primary',
                  v.status === 'low' && 'bg-destructive',
                  v.status === 'excessive' && 'bg-yellow-500',
                )}
                style={{ width: `${Math.min(100, (v.sets / maxSets) * 100)}%` }}
              />
            </div>
          </div>
        ))}
        <div className="flex items-center gap-4 pt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" /> Low (&lt;10)</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Optimal (10-20)</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-500" /> Excessive (&gt;20)</span>
        </div>
      </CardContent>
    </Card>
  );
}
