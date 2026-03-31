export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'core';

export type DayType = 'upper-a' | 'upper-b' | 'lower-a' | 'lower-b' | 'hiit' | 'zone2' | 'rest' | 'active-recovery';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  targetRirMin: number;
  targetRirMax: number;
  muscleGroups: MuscleGroup[];
  isCardio?: boolean;
}

export interface WorkoutDay {
  id: DayType;
  label: string;
  dayOfWeek: number; // 0=Sun, 1=Mon...
  exercises: Exercise[];
}

export interface SetLog {
  setNumber: number;
  weight: number;
  reps: number;
  rir: number;
  timestamp: string;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
}

export interface WorkoutLog {
  id: string;
  date: string;
  dayType: DayType;
  exercises: ExerciseLog[];
  completedAt?: string;
}

export type VolumeStatus = 'low' | 'optimal' | 'excessive';

export interface MuscleVolume {
  muscle: MuscleGroup;
  sets: number;
  status: VolumeStatus;
}

export interface OverloadSuggestion {
  exerciseId: string;
  exerciseName: string;
  type: 'increase-weight' | 'increase-reps' | 'slow-tempo' | 'maintain';
  message: string;
  suggestedWeight?: number;
  suggestedReps?: number;
}

export interface CoachInsight {
  id: string;
  type: 'warning' | 'suggestion' | 'positive';
  icon: string;
  message: string;
  priority: number;
}

export type RecoveryStatus = 'recovered' | 'recovering' | 'fatigued';

export interface MuscleRecovery {
  muscle: MuscleGroup;
  lastTrained: string | null;
  status: RecoveryStatus;
  hoursRemaining: number;
}
