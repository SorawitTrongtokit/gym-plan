import { Exercise, WorkoutDay } from './types';

const upperExercises: Exercise[] = [
  { id: 'db-floor-press', name: 'Dumbbell Floor Press', sets: 4, targetRirMin: 1, targetRirMax: 2, muscleGroups: ['chest', 'triceps'] },
  { id: 'db-row', name: 'One-Arm Dumbbell Row', sets: 4, targetRirMin: 1, targetRirMax: 2, muscleGroups: ['back'] },
  { id: 'db-ohp', name: 'Dumbbell Overhead Press', sets: 3, targetRirMin: 1, targetRirMax: 2, muscleGroups: ['shoulders'] },
  { id: 'db-lateral-raise', name: 'Dumbbell Lateral Raise', sets: 3, targetRirMin: 0, targetRirMax: 1, muscleGroups: ['shoulders'] },
  { id: 'db-rear-delt-fly', name: 'Dumbbell Rear Delt Fly', sets: 3, targetRirMin: 0, targetRirMax: 1, muscleGroups: ['shoulders', 'back'] },
  { id: 'bicep-curl', name: 'Bicep Curl', sets: 3, targetRirMin: 0, targetRirMax: 0, muscleGroups: ['biceps'] },
  { id: 'tricep-extension', name: 'Tricep Extension', sets: 3, targetRirMin: 0, targetRirMax: 0, muscleGroups: ['triceps'] },
];

const lowerExercises: Exercise[] = [
  { id: 'goblet-squat', name: 'Goblet Squat', sets: 3, targetRirMin: 1, targetRirMax: 2, muscleGroups: ['quads', 'glutes'] },
  { id: 'rdl', name: 'Romanian Deadlift', sets: 3, targetRirMin: 1, targetRirMax: 2, muscleGroups: ['hamstrings', 'glutes'] },
  { id: 'hip-thrust', name: 'Hip Thrust', sets: 3, targetRirMin: 1, targetRirMax: 2, muscleGroups: ['glutes'] },
  { id: 'walking-lunges', name: 'Walking Lunges', sets: 3, targetRirMin: 1, targetRirMax: 2, muscleGroups: ['quads', 'glutes'] },
  { id: 'calf-raises', name: 'Calf Raises', sets: 3, targetRirMin: 0, targetRirMax: 0, muscleGroups: ['calves'] },
  { id: 'core', name: 'Core (Plank / Leg Raises)', sets: 3, targetRirMin: 0, targetRirMax: 2, muscleGroups: ['core'] },
];

export const PROGRAM: WorkoutDay[] = [
  { id: 'upper-a', label: 'Upper A', dayOfWeek: 1, exercises: upperExercises },
  { id: 'lower-a', label: 'Lower A + HIIT', dayOfWeek: 2, exercises: lowerExercises },
  { id: 'rest', label: 'Rest Day', dayOfWeek: 3, exercises: [] },
  { id: 'upper-b', label: 'Upper B', dayOfWeek: 4, exercises: upperExercises },
  { id: 'lower-b', label: 'Lower B + Zone 2', dayOfWeek: 5, exercises: lowerExercises },
  { id: 'active-recovery', label: 'Active Recovery', dayOfWeek: 6, exercises: [] },
  { id: 'active-recovery', label: 'Active Recovery', dayOfWeek: 0, exercises: [] },
];

export const DAY_LABELS: Record<string, string> = {
  'upper-a': 'Upper A',
  'upper-b': 'Upper B',
  'lower-a': 'Lower A + HIIT',
  'lower-b': 'Lower B + Zone 2',
  'rest': 'Rest Day',
  'active-recovery': 'Active Recovery',
};

export function getTodaysWorkout(): WorkoutDay {
  const dayOfWeek = new Date().getDay();
  return PROGRAM.find(p => p.dayOfWeek === dayOfWeek) || PROGRAM[5];
}

export const MUSCLE_LABELS: Record<string, string> = {
  chest: 'Chest', back: 'Back', shoulders: 'Shoulders',
  biceps: 'Biceps', triceps: 'Triceps', quads: 'Quads',
  hamstrings: 'Hamstrings', glutes: 'Glutes', calves: 'Calves', core: 'Core',
};
