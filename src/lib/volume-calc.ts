import { MuscleVolume, VolumeStatus, WorkoutLog } from './types';
import { ALL_MUSCLES, getExerciseMuscles } from './constants';

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

  recentLogs.forEach(log => {
    log.exercises.forEach(ex => {
      const completedSets = ex.sets.filter(s => s.completed).length;
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
