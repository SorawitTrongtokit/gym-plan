import { ExerciseLog, OverloadSuggestion, WorkoutLog } from './types';

/**
 * Progressive Overload Engine
 * - RIR ≤ 1 consistently → suggest +2.5kg
 * - RIR ≥ 3 → suggest increasing reps first
 * - Weight stalled 2+ sessions → suggest tempo manipulation
 */
export function getOverloadSuggestion(
  exerciseId: string,
  exerciseName: string,
  history: WorkoutLog[]
): OverloadSuggestion {
  const recentLogs = getExerciseHistory(exerciseId, history).slice(-3);

  if (recentLogs.length === 0) {
    return { exerciseId, exerciseName, type: 'maintain', message: 'First session — establish baseline weights.' };
  }

  const lastLog = recentLogs[recentLogs.length - 1];
  const completedSets = lastLog.sets.filter(s => s.completed);

  if (completedSets.length === 0) {
    return { exerciseId, exerciseName, type: 'maintain', message: 'Complete sets to get suggestions.' };
  }

  const avgRir = completedSets.reduce((sum, s) => sum + s.rir, 0) / completedSets.length;
  const lastWeight = completedSets[completedSets.length - 1].weight;
  const lastReps = completedSets[completedSets.length - 1].reps;

  // Check for weight stall (same weight for 2+ sessions)
  if (recentLogs.length >= 2) {
    const weights = recentLogs.map(l => {
      const sets = l.sets.filter(s => s.completed);
      return sets.length > 0 ? sets[0].weight : 0;
    });
    const allSame = weights.every(w => w === weights[0]) && weights[0] > 0;
    if (allSame && avgRir <= 2) {
      return {
        exerciseId, exerciseName, type: 'slow-tempo',
        message: `Weight stalled at ${lastWeight}kg for ${recentLogs.length} sessions. Try slower eccentric (3-4s) to break plateau.`,
      };
    }
  }

  if (avgRir <= 1) {
    return {
      exerciseId, exerciseName, type: 'increase-weight',
      message: `Strong performance (avg RIR ${avgRir.toFixed(1)})! Increase to ${lastWeight + 2.5}kg next session.`,
      suggestedWeight: lastWeight + 2.5,
    };
  }

  if (avgRir >= 3) {
    return {
      exerciseId, exerciseName, type: 'increase-reps',
      message: `RIR too high (${avgRir.toFixed(1)}). Increase reps to ${lastReps + 1}-${lastReps + 2} before adding weight.`,
      suggestedReps: lastReps + 1,
    };
  }

  return {
    exerciseId, exerciseName, type: 'maintain',
    message: `Good intensity (RIR ~${avgRir.toFixed(1)}). Maintain current weight and aim for consistent performance.`,
  };
}

function getExerciseHistory(exerciseId: string, logs: WorkoutLog[]): ExerciseLog[] {
  return logs
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .flatMap(log => log.exercises.filter(e => e.exerciseId === exerciseId));
}
