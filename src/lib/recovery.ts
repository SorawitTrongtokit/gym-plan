import { MuscleGroup, MuscleRecovery, RecoveryStatus, WorkoutLog } from './types';
import { MUSCLE_LABELS } from './program-data';

const RECOVERY_HOURS = 48;
const ALL_MUSCLES: MuscleGroup[] = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'calves', 'core'];

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

export function getMuscleRecovery(logs: WorkoutLog[]): MuscleRecovery[] {
  const lastTrained: Record<string, string | null> = {};
  ALL_MUSCLES.forEach(m => (lastTrained[m] = null));

  // Find last trained date for each muscle
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  sortedLogs.forEach(log => {
    log.exercises.forEach(ex => {
      if (ex.sets.some(s => s.completed)) {
        const muscles = EXERCISE_MUSCLE_MAP[ex.exerciseId] || [];
        muscles.forEach(m => {
          if (!lastTrained[m]) {
            lastTrained[m] = log.date;
          }
        });
      }
    });
  });

  return ALL_MUSCLES.map(muscle => {
    const last = lastTrained[muscle];
    if (!last) {
      return { muscle, lastTrained: null, status: 'recovered' as RecoveryStatus, hoursRemaining: 0 };
    }

    const hoursSince = (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60);
    const hoursRemaining = Math.max(0, RECOVERY_HOURS - hoursSince);

    let status: RecoveryStatus = 'recovered';
    if (hoursRemaining > 24) status = 'fatigued';
    else if (hoursRemaining > 0) status = 'recovering';

    return { muscle, lastTrained: last, status, hoursRemaining };
  });
}

export function getRecoveryWarnings(logs: WorkoutLog[], targetMuscles: MuscleGroup[]): string[] {
  const recovery = getMuscleRecovery(logs);
  const warnings: string[] = [];

  targetMuscles.forEach(muscle => {
    const rec = recovery.find(r => r.muscle === muscle);
    if (rec && rec.status === 'fatigued') {
      warnings.push(`${MUSCLE_LABELS[muscle]} was trained recently (${Math.round(rec.hoursRemaining)}h until recovered). Consider lighter volume.`);
    }
  });

  return warnings;
}
