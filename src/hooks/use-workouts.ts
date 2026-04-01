import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dbFetchLogs, dbSaveWorkoutLog, dbFetchTrainingWeeks, dbDeleteWorkoutLog } from '@/lib/db';
import { WorkoutLog, Exercise } from '@/lib/types';
import { ALL_EXERCISES } from '@/lib/program-data';
import { toast } from 'sonner';

// Keys for tanstack query
export const WORKOUT_KEYS = {
  allLogs: ['workout-logs'] as const,
  weeks: ['training-weeks'] as const,
};

export function useWorkoutLogs() {
  return useQuery({
    queryKey: WORKOUT_KEYS.allLogs,
    queryFn: dbFetchLogs,
    // Add staleTime to ensure we don't refetch too aggressively during a session
    staleTime: 5 * 60 * 1000,
  });
}

export function useTrainingWeeks() {
  return useQuery({
    queryKey: WORKOUT_KEYS.weeks,
    queryFn: dbFetchTrainingWeeks,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveWorkoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workout: WorkoutLog) => dbSaveWorkoutLog(workout),
    onSuccess: () => {
      // Invalidate both keys so they re-fetch fresh data
      queryClient.invalidateQueries({ queryKey: WORKOUT_KEYS.allLogs });
      queryClient.invalidateQueries({ queryKey: WORKOUT_KEYS.weeks });
      toast.success('Workout completed and saved!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to save workout data.');
    }
  });
}

export function useDeleteWorkoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dbDeleteWorkoutLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKOUT_KEYS.allLogs });
      queryClient.invalidateQueries({ queryKey: WORKOUT_KEYS.weeks });
      toast.success('Workout log deleted.');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to delete workout log.');
    }
  });
}

export function useProgressData(exerciseId: string) {
  return useQuery({
    queryKey: WORKOUT_KEYS.allLogs,
    queryFn: dbFetchLogs,
    select: (logs) => {
      const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      return sortedLogs
        .flatMap(log =>
          log.exercises
            .filter(e => e.exerciseId === exerciseId)
            .map(e => {
              const completedSets = e.sets.filter(s => s.completed);
              if (completedSets.length === 0) return null;
              const maxWeight = Math.max(...completedSets.map(s => s.weight));
              const avgReps = Math.round(completedSets.reduce((sum, s) => sum + s.reps, 0) / completedSets.length);
              return {
                date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                rawDate: new Date(log.date).getTime(),
                weight: maxWeight,
                reps: avgReps,
              };
            })
        )
        .filter((Data): Data is NonNullable<typeof Data> => Boolean(Data));
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePersonalBests() {
  return useQuery({
    queryKey: WORKOUT_KEYS.allLogs,
    queryFn: dbFetchLogs,
    select: (logs) => {
      return ALL_EXERCISES.map((ex: Exercise) => {
        let maxWeight = 0;
        let maxReps = 0;
        logs.forEach(log => {
          log.exercises.filter(e => e.exerciseId === ex.id).forEach(e => {
            e.sets.filter(s => s.completed).forEach(s => {
              if (s.weight > maxWeight) maxWeight = s.weight;
              if (s.reps > maxReps) maxReps = s.reps;
            });
          });
        });
        return { ...ex, maxWeight, maxReps };
      }).filter(e => e.maxWeight > 0);
    },
    staleTime: 5 * 60 * 1000,
  });
}
