import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorkoutLog, SetLog, DayType } from '@/lib/types';

interface WorkoutState {
  logs: WorkoutLog[];
  activeWorkout: WorkoutLog | null;
  trainingWeeks: number;
  restTimerDuration: number;

  startWorkout: (dayType: DayType, exercises: { id: string; name: string; sets: number }[]) => void;
  logSet: (exerciseId: string, set: SetLog) => void;
  completeWorkout: () => void;
  cancelWorkout: () => void;
  setRestTimerDuration: (seconds: number) => void;
  resetDeloadCounter: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      logs: [],
      activeWorkout: null,
      trainingWeeks: 1,
      restTimerDuration: 90,

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
        set({ activeWorkout: workout });
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
        if (!active) return;

        const completed = { ...active, completedAt: new Date().toISOString() };
        const logs = [...get().logs, completed];

        // Update training weeks (rough: count unique weeks with workouts)
        const weeks = new Set(logs.map(l => {
          const d = new Date(l.date);
          const weekStart = new Date(d);
          weekStart.setDate(d.getDate() - d.getDay());
          return weekStart.toISOString().split('T')[0];
        }));

        set({ logs, activeWorkout: null, trainingWeeks: weeks.size });
      },

      cancelWorkout: () => set({ activeWorkout: null }),

      setRestTimerDuration: (seconds) => set({ restTimerDuration: seconds }),

      resetDeloadCounter: () => set({ trainingWeeks: 1 }),
    }),
    { name: 'ai-workout-store' }
  )
);
