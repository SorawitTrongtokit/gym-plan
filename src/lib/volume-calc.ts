import { MuscleGroup, MuscleVolume, VolumeStatus, WorkoutLog } from './types';

const ALL_MUSCLES: MuscleGroup[] = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'calves', 'core'];

/**
 * Calculates weekly sets per muscle group from workout logs.
 * Considers the last 7 days of logged workouts.
 */
export function getWeeklyVolume(logs: WorkoutLog[]): MuscleVolume[] {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const recentLogs = logs.filter(l => new Date(l.date) >= weekAgo);

  const volumeMap: Record<string, number> = {};
  ALL_MUSCLES.forEach(m => (volumeMap[m] = 0));

  // Import program data to map exercises to muscle groups
  recentLogs.forEach(log => {
    log.exercises.forEach(ex => {
      const completedSets = ex.sets.filter(s => s.completed).length;
      // We need to know which muscles this exercise targets
      // This info should come from the exercise definition
      const muscles = getExerciseMuscles(ex.exerciseId);
      muscles.forEach(m => {
        volumeMap[m] = (volumeMap[m] || 0) + completedSets;
      });
    });
  });

  return ALL_MUSCLES.map(muscle => ({
    muscle,
    sets: volumeMap[muscle],
    status: getVolumeStatus(volumeMap[muscle]),
  }));
}

function getVolumeStatus(sets: number): VolumeStatus {
  if (sets < 10) return 'low';
  if (sets <= 20) return 'optimal';
  return 'excessive';
}

// Maps exercise IDs to muscle groups
const EXERCISE_MUSCLE_MAP: Record<string, MuscleGroup[]> = {
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

function getExerciseMuscles(exerciseId: string): MuscleGroup[] {
  return EXERCISE_MUSCLE_MAP[exerciseId] || [];
}
