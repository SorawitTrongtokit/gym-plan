import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Check, TrendingUp, Gauge, Clock } from 'lucide-react';
import { SetLog, Exercise, OverloadSuggestion } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ExerciseCardProps {
  exercise: Exercise;
  sets: SetLog[];
  suggestion?: OverloadSuggestion;
  onCompleteSet: (set: SetLog) => void;
}

export function ExerciseCard({ exercise, sets, suggestion, onCompleteSet }: ExerciseCardProps) {
  const completedSets = sets.filter(s => s.completed).length;
  const allComplete = completedSets === exercise.sets;

  return (
    <Card className={cn('transition-all', allComplete && 'border-primary/30 bg-primary/5')}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{exercise.name}</CardTitle>
          <Badge variant={allComplete ? 'default' : 'secondary'} className="text-xs">
            {completedSets}/{exercise.sets} sets
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Gauge className="h-3 w-3" /> RIR {exercise.targetRirMin}-{exercise.targetRirMax}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {exercise.sets} sets
          </span>
        </div>
        {suggestion && suggestion.type !== 'maintain' && (
          <div className={cn(
            'mt-2 p-2 rounded-lg text-xs flex items-start gap-2',
            suggestion.type === 'increase-weight' && 'bg-primary/10 text-primary',
            suggestion.type === 'increase-reps' && 'bg-accent/10 text-accent-foreground',
            suggestion.type === 'slow-tempo' && 'bg-warning/10 text-foreground',
          )}>
            <TrendingUp className="h-3 w-3 mt-0.5 shrink-0" />
            {suggestion.message}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {sets.map((set) => (
          <SetRow
            key={set.setNumber}
            set={set}
            onComplete={(data) => onCompleteSet({ ...data, setNumber: set.setNumber })}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function SetRow({ set, onComplete }: { set: SetLog; onComplete: (data: SetLog) => void }) {
  const [weight, setWeight] = useState(set.weight || 0);
  const [reps, setReps] = useState(set.reps || 0);
  const [rir, setRir] = useState(set.rir ?? 2);

  if (set.completed) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/5 text-sm">
        <Check className="h-4 w-4 text-primary shrink-0" />
        <span className="text-muted-foreground">Set {set.setNumber}</span>
        <span className="font-medium">{set.weight}kg</span>
        <span>×</span>
        <span className="font-medium">{set.reps} reps</span>
        <span className="text-muted-foreground ml-auto">RIR {set.rir}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
      <span className="text-xs text-muted-foreground w-8 shrink-0">S{set.setNumber}</span>
      <div className="flex items-center gap-1 flex-1">
        <Input
          type="number" placeholder="kg" value={weight || ''}
          onChange={e => setWeight(Number(e.target.value))}
          className="h-8 w-16 text-center text-sm bg-background"
        />
        <span className="text-xs text-muted-foreground">×</span>
        <Input
          type="number" placeholder="reps" value={reps || ''}
          onChange={e => setReps(Number(e.target.value))}
          className="h-8 w-16 text-center text-sm bg-background"
        />
        <Input
          type="number" placeholder="RIR" value={rir} min={0} max={5}
          onChange={e => setRir(Number(e.target.value))}
          className="h-8 w-14 text-center text-sm bg-background"
        />
      </div>
      <Button
        size="sm" className="h-8 text-xs"
        disabled={weight <= 0 || reps <= 0}
        onClick={() => onComplete({ setNumber: set.setNumber, weight, reps, rir, timestamp: '', completed: true })}
      >
        Done
      </Button>
    </div>
  );
}
