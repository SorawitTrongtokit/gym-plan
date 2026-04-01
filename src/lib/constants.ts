import { MuscleGroup } from './types';

/**
 * Single source of truth for exercise → muscle group mapping.
 * Previously duplicated in recovery.ts and volume-calc.ts.
 */
export const EXERCISE_MUSCLE_MAP: Record<string, MuscleGroup[]> = {
  'db-floor-press': ['chest', 'triceps'],
  'db-row': ['back'],
  'db-ohp': ['shoulders'],
  'db-lateral-raise': ['shoulders'],
  'db-rear-delt-fly': ['shoulders', 'back'],
  'bicep-curl': ['biceps'],
  'tricep-extension': ['triceps'],
  'goblet-squat': ['quads', 'glutes'],
  'rdl': ['hamstrings', 'glutes'],
  'hip-thrust': ['glutes'],
  'walking-lunges': ['quads', 'glutes'],
  'calf-raises': ['calves'],
  'core': ['core'],
};

export const ALL_MUSCLES: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps',
  'quads', 'hamstrings', 'glutes', 'calves', 'core',
];

export function getExerciseMuscles(exerciseId: string): MuscleGroup[] {
  return EXERCISE_MUSCLE_MAP[exerciseId] || [];
}
