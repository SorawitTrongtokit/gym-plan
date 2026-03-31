import { CoachInsight, WorkoutLog } from './types';
import { getWeeklyVolume } from './volume-calc';
import { MUSCLE_LABELS } from './program-data';

/**
 * AI Coach — rule-based insight engine analyzing recent workout logs.
 */
export function getCoachInsights(logs: WorkoutLog[], trainingWeeks: number): CoachInsight[] {
  const insights: CoachInsight[] = [];
  const recentLogs = logs.slice(-10);

  // 1. Check average RIR across recent workouts
  const allSets = recentLogs.flatMap(l => l.exercises.flatMap(e => e.sets.filter(s => s.completed)));
  if (allSets.length > 0) {
    const avgRir = allSets.reduce((sum, s) => sum + s.rir, 0) / allSets.length;
    if (avgRir >= 3) {
      insights.push({
        id: 'high-rir', type: 'warning', icon: '⚡',
        message: `Average RIR is ${avgRir.toFixed(1)} — you're not training close enough to failure. Push harder on working sets.`,
        priority: 1,
      });
    }
    if (avgRir <= 0.5) {
      insights.push({
        id: 'too-many-failure', type: 'warning', icon: '🔴',
        message: 'Too many sets at failure (RIR 0). Reduce failure sets to manage fatigue — aim for RIR 1-2 on compounds.',
        priority: 1,
      });
    }

    // Check percentage of RIR 0 sets
    const failureSets = allSets.filter(s => s.rir === 0).length;
    const failurePercent = (failureSets / allSets.length) * 100;
    if (failurePercent > 30) {
      insights.push({
        id: 'fatigue-risk', type: 'warning', icon: '😤',
        message: `${failurePercent.toFixed(0)}% of your sets are at failure. Keep failure sets under 30% to avoid excessive fatigue.`,
        priority: 2,
      });
    }
  }

  // 2. Volume check per muscle group
  const volumes = getWeeklyVolume(logs);
  volumes.forEach(v => {
    if (v.status === 'low' && v.sets > 0) {
      insights.push({
        id: `low-vol-${v.muscle}`, type: 'suggestion', icon: '📈',
        message: `Increase volume for ${MUSCLE_LABELS[v.muscle]} — only ${v.sets} sets this week (aim for 10-20).`,
        priority: 3,
      });
    }
    if (v.status === 'excessive') {
      insights.push({
        id: `high-vol-${v.muscle}`, type: 'warning', icon: '⚠️',
        message: `${MUSCLE_LABELS[v.muscle]} volume is excessive at ${v.sets} sets/week. Risk of overtraining — consider reducing.`,
        priority: 2,
      });
    }
  });

  // 3. Deload suggestion
  if (trainingWeeks >= 5) {
    insights.push({
      id: 'deload', type: 'suggestion', icon: '🔄',
      message: `Week ${trainingWeeks} of training. Consider a deload week — reduce volume by 40% and use lighter weights.`,
      priority: 1,
    });
  }

  // 4. Positive feedback
  if (logs.length > 0 && insights.length === 0) {
    insights.push({
      id: 'on-track', type: 'positive', icon: '✅',
      message: 'Everything looks great! Training intensity and volume are on point. Keep it up.',
      priority: 5,
    });
  }

  return insights.sort((a, b) => a.priority - b.priority);
}
