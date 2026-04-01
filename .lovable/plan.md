# AI Workout System — Development Roadmap

## 📊 Current State Analysis

### ✅ สิ่งที่มีแล้ว
- **4 หน้า**: Dashboard, Workout, Progress, Program
- **Zustand store** + localStorage persistence สำหรับ workout logs
- **Progressive Overload Engine**: RIR ≤1 → +2.5kg, RIR ≥3 → +reps, stall → slow tempo
- **AI Coach (rule-based)**: วิเคราะห์ RIR, volume, fatigue %, deload timing
- **Volume Tracking**: weekly sets/muscle group (low/optimal/excessive)
- **Recovery Tracking**: 48h recovery window per muscle group
- **Rest Timer**: circular SVG countdown 30-180s + vibration
- **Program Data**: Upper/Lower A/B split, 13 exercises
- **Dark theme**: Space Grotesk + Inter, electric green primary
- **Lovable Cloud (Supabase)** เชื่อมต่อแล้ว แต่ยังไม่มี tables

### ⚠️ จุดที่ต้องปรับปรุง
1. ไม่มี Authentication — ข้อมูลอยู่ใน localStorage เท่านั้น
2. ไม่มี Database — ข้อมูลหายเมื่อ clear browser
3. EXERCISE_MUSCLE_MAP ซ้ำซ้อน (volume-calc.ts + recovery.ts)
4. ไม่มี Body Weight Tracking
5. ไม่มี 1RM Calculator
6. Cardio tracking ยังไม่ทำจริง
7. ไม่มี Workout History view
8. ไม่มี Data Export
9. ไม่มี Settings page
10. Upper A/B ใช้ exercises เดียวกัน (ควรแยก variation)

---

## 🚀 Phase 1: Backend & Auth (Priority: HIGH)

### 1.1 Authentication System
- หน้า Login/Signup (email + password)
- Auth guard สำหรับ protected routes
- Social login (Google) ผ่าน Lovable Cloud

### 1.2 Database Schema
```sql
profiles (id, user_id FK, display_name, weight_unit, created_at)
workout_logs (id, user_id FK, date, day_type, completed_at)
exercise_logs (id, workout_log_id FK, exercise_id, exercise_name)
set_logs (id, exercise_log_id FK, set_number, weight, reps, rir, timestamp, completed)
body_weights (id, user_id FK, weight, date)
user_preferences (id, user_id FK, rest_timer_duration, weight_unit)
```

### 1.3 Data Sync
- Offline-first: Zustand + sync เมื่อ online
- RLS policies: users เห็นแค่ข้อมูลตัวเอง

---

## 🎯 Phase 2: Feature Enhancements

### 2.1 Workout History Page
- Timeline view + filter by day type/date
- ดูรายละเอียดแต่ละ session

### 2.2 Body Weight Tracker
- บันทึกน้ำหนักตัว + trend chart

### 2.3 1RM Calculator
- Epley formula, track progression

### 2.4 Cardio Tracking (HIIT & Zone 2)
- Log duration, type, intervals

### 2.5 Exercise Substitutions
- Custom exercise per user

---

## 💡 Phase 3: Intelligence Upgrades

### 3.1 Advanced AI Coach
- Periodization detection, fatigue accumulation model
- Volume landmarks (MEV/MRV), readiness score
- Weekly AI summary

### 3.2 PR Board
- Track PR by weight/reps/volume/estimated 1RM
- PR notifications (toast)

### 3.3 Muscle Heatmap
- Body diagram + interactive volume/recovery view

---

## 🎨 Phase 4: UX & Polish

### 4.1 Settings Page
- Rest timer, weight unit, theme, data export, profile

### 4.2 Onboarding Flow
- Starting weights, experience level, RIR adjustment

### 4.3 Animations (framer-motion)
- Page transitions, set completion, workout complete

### 4.4 PWA Support
- Offline access, install prompt, push notifications

---

## 🔧 Phase 5: Code Quality

### 5.1 Refactoring
- DRY: merge EXERCISE_MUSCLE_MAP → program-data.ts
- Central exercise registry
- Custom hooks: useActiveWorkout, useExerciseProgress

### 5.2 Testing
- Unit tests: engines, Volume calc, coach, recovery
- E2E: Playwright workout flow

### 5.3 Performance
- React.memo, lazy loading, virtual lists

---

## 📋 Implementation Priority

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| 🔴 | Auth + Database | Large | Critical |
| 🟠 | Refactor duplicated code | Small | Medium |
| 🟠 | Workout History | Medium | High |
| 🟡 | Body Weight Tracker | Small | Medium |
| 🟡 | Settings Page | Small | Medium |
| 🟡 | 1RM Calculator | Small | Medium |
| 🟡 | PR Board + Notifications | Medium | High |
| 🟢 | Advanced AI Coach | Large | High |
| 🟢 | Cardio Tracking | Medium | Medium |
| 🟢 | Muscle Heatmap | Medium | Medium |
| 🔵 | PWA Support | Medium | Medium |
| 🔵 | Onboarding Flow | Medium | Medium |
| 🔵 | Animations | Small | Low |
