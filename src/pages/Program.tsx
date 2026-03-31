import { PROGRAM, DAY_LABELS, MUSCLE_LABELS } from '@/lib/program-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gauge, Dumbbell } from 'lucide-react';

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ProgramPage = () => {
  const today = new Date().getDay();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Training Program</h1>
        <p className="text-sm text-muted-foreground">Upper / Lower Split — Science-based hypertrophy</p>
      </div>

      {PROGRAM.map(day => (
        <Card key={`${day.id}-${day.dayOfWeek}`} className={day.dayOfWeek === today ? 'border-primary/30' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{WEEKDAY_NAMES[day.dayOfWeek]}</CardTitle>
              <div className="flex items-center gap-2">
                {day.dayOfWeek === today && <Badge className="text-xs">Today</Badge>}
                <Badge variant="secondary" className="text-xs">{day.label}</Badge>
              </div>
            </div>
          </CardHeader>
          {day.exercises.length > 0 && (
            <CardContent className="space-y-2">
              {day.exercises.map(ex => (
                <div key={ex.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                  <div className="flex items-center gap-3">
                    <Dumbbell className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{ex.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {ex.muscleGroups.map(m => MUSCLE_LABELS[m]).join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{ex.sets} sets</span>
                    <span className="flex items-center gap-1">
                      <Gauge className="h-3 w-3" /> RIR {ex.targetRirMin}-{ex.targetRirMax}
                    </span>
                  </div>
                </div>
              ))}
              {(day.id === 'lower-a') && (
                <div className="p-3 rounded-lg bg-accent/10 text-sm text-accent-foreground">
                  🏃 HIIT Cardio — 20 min interval training after lifting
                </div>
              )}
              {(day.id === 'lower-b') && (
                <div className="p-3 rounded-lg bg-accent/10 text-sm text-accent-foreground">
                  🚶 Zone 2 Cardio — 30 min steady state after lifting
                </div>
              )}
            </CardContent>
          )}
          {day.exercises.length === 0 && (
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {day.id === 'rest' ? '💤 Full rest — focus on sleep and nutrition.' : '🧘 Light movement, stretching, or walking.'}
              </p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

export default ProgramPage;
