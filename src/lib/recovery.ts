import { MuscleGroup, MuscleRecovery, RecoveryStatus, WorkoutLog } from './types';
import { MUSCLE_LABELS } from './program-data';
import { ALL_MUSCLES, EXERCISE_MUSCLE_MAP } from './constants';

const RECOVERY_HOURS = 48;

export function getMuscleRecovery(logs: WorkoutLog[]): MuscleRecovery[] {
  const lastTrained: Record<string, string | null> = {};
  ALL_MUSCLES.forEach(m => (lastTrained[m] = null));

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
