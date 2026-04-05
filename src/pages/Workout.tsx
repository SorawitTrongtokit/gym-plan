import { useState, useCallback } from 'react';
import { useWorkoutStore } from '@/stores/workout-store';
import { getTodaysWorkout, PROGRAM, DAY_LABELS } from '@/lib/program-data';
import { getOverloadSuggestion } from '@/lib/overload-engine';
import { getRecoveryWarnings } from '@/lib/recovery';
import { useWorkoutLogs, useSaveWorkoutMutation } from '@/hooks/use-workouts';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { RestTimer } from '@/components/workout/RestTimer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { AlertTriangle, CheckCircle2, Play, X } from 'lucide-react';
import { DayType, SetLog } from '@/lib/types';

const WorkoutPage = () => {
  const { activeWorkout, restTimerDuration, startWorkout, logSet, completeWorkout, cancelWorkout, setRestTimerDuration, startRestTimer, restTimerEndTime } = useWorkoutStore();
  const { data: logs = [] } = useWorkoutLogs();
  const { mutate: saveWorkout } = useSaveWorkoutMutation();
  const todaysWorkout = getTodaysWorkout();
  const [selectedDay, setSelectedDay] = useState<DayType>(todaysWorkout.id);

  // showTimer is now derived from the global store
  const showTimer = restTimerEndTime !== null;

  const workoutDays = PROGRAM.filter(p => p.exercises.length > 0);
  const selected = PROGRAM.find(p => p.id === selectedDay) || todaysWorkout;

  const handleStart = () => {
    startWorkout(selected.id, selected.exercises.map(e => ({ id: e.id, name: e.name, sets: e.sets })));
  };

  const handleCompleteSet = useCallback((exerciseId: string, set: SetLog) => {
    logSet(exerciseId, set);
    startRestTimer(restTimerDuration);
  }, [logSet, restTimerDuration, startRestTimer]);

  const handleCompleteWorkout = () => {
    const finishedWorkout = completeWorkout();
    if (finishedWorkout) {
      saveWorkout(finishedWorkout);
    }
  };

  // Recovery warnings
  const targetMuscles = selected.exercises.flatMap(e => e.muscleGroups);
  const uniqueMuscles = [...new Set(targetMuscles)];
  const warnings = getRecoveryWarnings(logs, uniqueMuscles);

  if (!activeWorkout) {
    return (
      <div className="space-y-6 page-enter">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Start Workout</h1>
          <p className="text-sm text-muted-foreground">Select your session and begin training</p>
        </div>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Workout Day</label>
              <Select value={selectedDay} onValueChange={(v) => setSelectedDay(v as DayType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {workoutDays.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rest Timer: {restTimerDuration}s</label>
              <Slider
                value={[restTimerDuration]} min={30} max={180} step={15}
                onValueChange={([v]) => setRestTimerDuration(v)}
              />
            </div>

            {warnings.length > 0 && (
              <div className="space-y-2">
                {warnings.map((w, i) => (
                  <div key={i} className="p-3 rounded-lg bg-destructive/10 text-sm flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              {selected.exercises.length} exercises • {selected.exercises.reduce((s, e) => s + e.sets, 0)} total sets
            </div>

            <Button className="w-full" size="lg" onClick={handleStart}>
              <Play className="h-4 w-4 mr-2" /> Begin {DAY_LABELS[selectedDay]}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active workout view
  const totalSets = activeWorkout.exercises.reduce((s, e) => s + e.sets.length, 0);
  const completedSets = activeWorkout.exercises.reduce((s, e) => s + e.sets.filter(st => st.completed).length, 0);
  const allDone = completedSets === totalSets;

  return (
    <div className="space-y-4 page-enter">
      {/* Workout header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{DAY_LABELS[activeWorkout.dayType]}</h1>
          <p className="text-sm text-muted-foreground">{completedSets}/{totalSets} sets completed</p>
        </div>
        <div className="flex items-center gap-2">
          {allDone ? (
            <Button onClick={handleCompleteWorkout}>
              <CheckCircle2 className="h-4 w-4 mr-2" /> Finish
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={cancelWorkout}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className="h-full bg-primary transition-all progress-stripe" style={{ width: `${(completedSets / totalSets) * 100}%` }} />
      </div>

      {/* Rest timer */}
      {showTimer && (
        <RestTimer />
      )}

      {/* Exercise cards */}
      {activeWorkout.exercises.map((ex) => {
        const exerciseDef = selected.exercises.find(e => e.id === ex.exerciseId);
        if (!exerciseDef) return null;
        const suggestion = getOverloadSuggestion(ex.exerciseId, ex.exerciseName, logs);
        return (
          <ExerciseCard
            key={ex.exerciseId}
            exercise={exerciseDef}
            sets={ex.sets}
            suggestion={suggestion}
            onCompleteSet={(set) => handleCompleteSet(ex.exerciseId, set)}
          />
        );
      })}

      {allDone && (
        <Button className="w-full" size="lg" onClick={handleCompleteWorkout}>
          <CheckCircle2 className="h-4 w-4 mr-2" /> Complete Workout
        </Button>
      )}
    </div>
  );
};

export default WorkoutPage;
