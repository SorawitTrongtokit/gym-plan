

# AI Workout System — Implementation Plan

## Overview
An intelligent hypertrophy training system with progressive overload logic, recovery management, and volume tracking. All data persisted in localStorage using Zustand.

## Pages & Navigation
- **Dashboard** (`/`) — Today's workout summary, weekly volume overview, AI coach insights, recovery status
- **Workout** (`/workout`) — Active workout mode for the current day's session
- **Progress** (`/progress`) — Exercise history, progression charts, personal bests
- **Program** (`/program`) — Weekly split overview with all exercises and target RIR

Bottom tab navigation (mobile-first), sidebar on desktop.

## Core Data & State (Zustand + localStorage)
- **Program store**: Predefined Upper A/B, Lower A/B splits with exercises, sets, target RIR
- **Workout log store**: Historical logs (date, exercise, sets with weight/reps/RIR/timestamp)
- **User preferences**: Rest timer duration, units (kg/lbs)
- **Recovery store**: Last trained date per muscle group

## Key Features

### 1. Workout Mode
- Auto-detect today's workout from the weekly split (Mon=Upper A, etc.)
- Exercise cards shown in order; each with set rows to input weight, reps, RIR
- "Complete Set" button logs data and starts rest timer
- Visual progress (completed vs remaining sets)

### 2. Progressive Overload Engine
- After completing an exercise, compare to last session:
  - RIR ≤ 1 consistently → suggest +2.5kg next time
  - RIR ≥ 3 → suggest +1-2 reps before adding weight
  - Weight stalled 2+ sessions → suggest tempo manipulation (slower eccentric)
- Suggestions shown as banners on exercise cards

### 3. Rest Timer
- Configurable 30–180s with circular countdown animation
- Auto-starts after completing a set
- Audio/vibration alert on completion

### 4. Progress Dashboard
- Per-exercise line charts (weight over time) using Recharts
- Personal best highlights (badges)
- Filter by exercise or muscle group

### 5. Volume Tracking
- Calculate weekly sets per muscle group from logged workouts
- Color-coded bars: red (<10), green (10-20), orange (>20)
- Mapped from exercises to muscle groups

### 6. AI Coach Panel (Dashboard widget)
- Rule-based insights analyzing recent logs:
  - Average RIR too high → "Train closer to failure"
  - Volume below threshold → "Increase volume for [muscle]"
  - Same muscle trained <48h apart → "Recovery insufficient"
  - 4-6 weeks without deload → "Consider a deload week"
  - Too many RIR 0 sets → "Reduce failure sets to manage fatigue"

### 7. Recovery Tracking
- Track last trained timestamp per muscle group
- Warning banner if attempting to train a muscle group within 48 hours
- Recovery status indicators (recovered/recovering/fatigued)

### 8. Fatigue & Deload Management
- Track consecutive training weeks
- Suggest deload at week 5 (reduce volume by 40%)
- Flag if >30% of sets are at RIR 0

## Design
- Dark theme with accent color (electric blue/green)
- Card-based layout, large touch targets
- Mobile-first responsive design
- Gym/fitness aesthetic with clean typography

## File Structure
```
src/
  stores/        — Zustand stores (workout, program, recovery, preferences)
  pages/         — Dashboard, Workout, Progress, Program
  components/
    workout/     — ExerciseCard, SetRow, RestTimer, WorkoutHeader
    dashboard/   — VolumeChart, AICoachPanel, RecoveryStatus, TodayOverview
    progress/    — ProgressChart, PersonalBests
    layout/      — BottomNav, AppLayout
  lib/
    program-data.ts    — Predefined training program
    overload-engine.ts — Progressive overload logic
    volume-calc.ts     — Volume per muscle group calculations
    coach-engine.ts    — AI coach rule engine
    recovery.ts        — Recovery status calculations
```

