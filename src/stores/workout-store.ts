import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorkoutLog, SetLog, DayType } from '@/lib/types';

interface WorkoutState {
  activeWorkout: WorkoutLog | null;
  restTimerDuration: number;
  restTimerEndTime: number | null;

  startWorkout: (dayType: DayType, exercises: { id: string; name: string; sets: number }[]) => void;
  logSet: (exerciseId: string, set: SetLog) => void;
  completeWorkout: () => WorkoutLog | null;
  cancelWorkout: () => void;
  setRestTimerDuration: (seconds: number) => void;
  startRestTimer: (durationInSeconds: number) => void;
  clearRestTimer: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      activeWorkout: null,
      restTimerDuration: 90,
      restTimerEndTime: null,

      startWorkout: (dayType, exercises) => {
        const workout: WorkoutLog = {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          dayType,
          exercises: exercises.map(ex => ({
            exerciseId: ex.id,
            exerciseName: ex.name,
            sets: Array.from({ length: ex.sets }, (_, i) => ({
              setNumber: i + 1,
              weight: 0,
              reps: 0,
              rir: 2,
              timestamp: '',
              completed: false,
            })),
          })),
        };
        set({ activeWorkout: workout, restTimerEndTime: null });
      },

      logSet: (exerciseId, setData) => {
        const active = get().activeWorkout;
        if (!active) return;

        const updated = {
          ...active,
          exercises: active.exercises.map(ex =>
            ex.exerciseId === exerciseId
              ? {
                  ...ex,
                  sets: ex.sets.map(s =>
                    s.setNumber === setData.setNumber ? { ...setData, completed: true, timestamp: new Date().toISOString() } : s
                  ),
                }
              : ex
          ),
        };
        set({ activeWorkout: updated });
      },

      completeWorkout: () => {
        const active = get().activeWorkout;
        if (!active) return null;

        const completed = { ...active, completedAt: new Date().toISOString() };
        set({ activeWorkout: null, restTimerEndTime: null });
        return completed;
      },

      cancelWorkout: () => set({ activeWorkout: null, restTimerEndTime: null }),

      setRestTimerDuration: (seconds) => set({ restTimerDuration: seconds }),
      
      startRestTimer: (durationInSeconds) => set({ 
        restTimerEndTime: Date.now() + durationInSeconds * 1000 
      }),
      
      clearRestTimer: () => set({ restTimerEndTime: null }),
    }),
    { name: 'ai-workout-store' }
  )
);
