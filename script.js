const PLAN_STORAGE_KEY = 'solo-strength-plan';
const LOG_STORAGE_KEY = 'solo-strength-logs';
const SESSION_STORAGE_KEY = 'solo-strength-session-state';

const defaultPlan = {
  Monday: [
    { exercise: 'Back Squat', sets: 5, reps: 5, weight: 80, notes: '2-3 min rest' },
    { exercise: 'Romanian Deadlift', sets: 3, reps: 8, weight: 70, notes: 'Keep lats tight' },
    { exercise: 'Split Squat', sets: 3, reps: 12, weight: 24, notes: 'DBs, each leg' }
  ],
  Wednesday: [
    { exercise: 'Bench Press', sets: 5, reps: 5, weight: 70, notes: '1 count pause' },
    { exercise: 'Weighted Pull-up', sets: 4, reps: 6, weight: 16, notes: 'Full hang' },
    { exercise: 'Dip', sets: 3, reps: 10, weight: 8, notes: 'Controlled tempo' }
  ],
  Friday: [
    { exercise: 'Deadlift', sets: 3, reps: 5, weight: 110, notes: 'Reset each rep' },
    { exercise: 'Front Squat', sets: 3, reps: 5, weight: 70, notes: 'Elbows high' },
    { exercise: 'Single Arm Row', sets: 3, reps: 10, weight: 30, notes: 'Each arm' }
  ]
};

const plan = loadFromStorage(PLAN_STORAGE_KEY, defaultPlan);
const logs = loadFromStorage(LOG_STORAGE_KEY, []);
let sessionState = loadFromStorage(SESSION_STORAGE_KEY, {});

const planForm = document.getElementById('planForm');
const planContainer = document.getElementById('plan');
const sessionDaySelect = document.getElementById('sessionDay');
const loadSessionButton = document.getElementById('loadSession');
const sessionExercisesContainer = document.getElementById('sessionExercises');
const logForm = document.getElementById('logForm');
const logList = document.getElementById('logList');
const progressChart = document.getElementById('progressChart');

const totalSessionsDisplay = document.getElementById('totalSessions');
const totalVolumeDisplay = document.getElementById('totalVolume');
const bestLiftDisplay = document.getElementById('bestLift');

const timerDisplay = document.getElementById('timerDisplay');
const timerStart = document.getElementById('timerStart');
const timerPause = document.getElementById('timerPause');
const timerReset = document.getElementById('timerReset');

let timerInterval = null;
let countdownSeconds = 120;

function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return cloneValue(fallback);
    return JSON.parse(stored);
  } catch (error) {
    console.warn(`Unable to parse storage key ${key}`, error);
    return cloneValue(fallback);
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function renderPlan() {
  planContainer.innerHTML = '';
  const days = Object.keys(plan);
  if (!days.length) {
    planContainer.innerHTML = '<p class="empty">No training days yet. Add your first session above.</p>';
    return;
  }

  const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  days.sort((a, b) => order.indexOf(a) - order.indexOf(b));

  days.forEach(day => {
    const dayCard = document.createElement('div');
    dayCard.className = 'plan-day';

    const header = document.createElement('div');
    header.className = 'plan-day__title';

    const title = document.createElement('h3');
    title.textContent = day;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn--ghost';
    deleteButton.textContent = 'Clear Day';
    deleteButton.addEventListener('click', () => {
      delete plan[day];
      delete sessionState[day];
      saveToStorage(PLAN_STORAGE_KEY, plan);
      saveSessionState();
      updateSessionOptions();
      renderPlan();
    });

    header.append(title, deleteButton);

    const exerciseList = document.createElement('div');
    exerciseList.className = 'exercise-list';

    plan[day].forEach((exercise, index) => {
      const exerciseCard = document.createElement('div');
      exerciseCard.className = 'exercise';

      const exerciseTitle = document.createElement('h4');
      exerciseTitle.textContent = exercise.exercise;

      const meta = document.createElement('div');
      meta.className = 'exercise__meta';
      meta.textContent = `${exercise.sets} x ${exercise.reps} @ ${exercise.weight} kg`;

      const notes = document.createElement('p');
      notes.className = 'exercise__meta';
      notes.textContent = exercise.notes || '';

      const removeButton = document.createElement('button');
      removeButton.className = 'btn btn--ghost';
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', () => {
        plan[day].splice(index, 1);
        if (!plan[day].length) {
          delete plan[day];
          delete sessionState[day];
        }
        saveToStorage(PLAN_STORAGE_KEY, plan);
        saveSessionState();
        updateSessionOptions();
        renderPlan();
      });

      const controlRow = document.createElement('div');
      controlRow.className = 'exercise__controls';
      controlRow.style.display = 'flex';
      controlRow.style.gap = '0.75rem';
      controlRow.append(removeButton);

      exerciseCard.append(exerciseTitle, meta);
      if (exercise.notes) {
        exerciseCard.append(notes);
      }
      exerciseCard.append(controlRow);
      exerciseList.append(exerciseCard);
    });

    dayCard.append(header, exerciseList);
    planContainer.append(dayCard);
  });
}

function updateSessionOptions() {
  const current = sessionDaySelect.value;
  sessionDaySelect.innerHTML = '';
  const option = document.createElement('option');
  option.value = '';
  option.textContent = 'Select day';
  sessionDaySelect.append(option);

  const orderedDays = Object.keys(plan)
    .sort((a, b) => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(a) - ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(b));
  orderedDays.forEach(day => {
    const opt = document.createElement('option');
    opt.value = day;
    opt.textContent = day;
    sessionDaySelect.append(opt);
  });

  if (orderedDays.includes(current)) {
    sessionDaySelect.value = current;
  } else if (orderedDays.length) {
    sessionDaySelect.value = orderedDays[0];
  }
}

function renderSession(day) {
  sessionExercisesContainer.innerHTML = '';
  if (!day || !plan[day]) {
    sessionExercisesContainer.innerHTML = '<p class="empty">Load a training day to prep your next session.</p>';
    return;
  }

  const exercises = plan[day];
  const state = sessionState[day] || {};

  exercises.forEach((exercise, index) => {
    const card = document.createElement('div');
    card.className = 'session-card';

    const header = document.createElement('div');
    header.className = 'session-card__header';

    const title = document.createElement('h3');
    title.textContent = exercise.exercise;

    const volumeInfo = document.createElement('span');
    volumeInfo.className = 'exercise__meta';
    volumeInfo.textContent = `${exercise.sets} x ${exercise.reps} @ ${exercise.weight} kg`;

    header.append(title, volumeInfo);

    const setList = document.createElement('div');
    setList.className = 'session-card__sets';

    const completed = state[index]?.completed ? [...state[index].completed] : Array(exercise.sets).fill(false);
    const weights = state[index]?.weights ? [...state[index].weights] : Array(exercise.sets).fill(exercise.weight);
    const reps = state[index]?.reps ? [...state[index].reps] : Array(exercise.sets).fill(exercise.reps);

    for (let setIndex = 0; setIndex < exercise.sets; setIndex++) {
      const setRow = document.createElement('div');
      setRow.className = 'session-card__set';

      const setLabel = document.createElement('span');
      setLabel.textContent = `Set ${setIndex + 1}`;

      const inputWrap = document.createElement('div');
      inputWrap.style.display = 'flex';
      inputWrap.style.gap = '0.5rem';

      const weightInput = document.createElement('input');
      weightInput.type = 'number';
      weightInput.min = 0;
      weightInput.max = 500;
      weightInput.value = weights[setIndex];

      const repsInput = document.createElement('input');
      repsInput.type = 'number';
      repsInput.min = 1;
      repsInput.max = 30;
      repsInput.value = reps[setIndex];

      weightInput.addEventListener('change', () => {
        weights[setIndex] = Number(weightInput.value);
        persistSessionState(day, index, completed, weights, reps);
      });

      repsInput.addEventListener('change', () => {
        reps[setIndex] = Number(repsInput.value);
        persistSessionState(day, index, completed, weights, reps);
      });

      inputWrap.append(weightInput, repsInput);

      const completeButton = document.createElement('button');
      completeButton.className = 'btn btn--ghost';
      completeButton.textContent = completed[setIndex] ? 'Completed' : 'Complete';
      if (completed[setIndex]) {
        completeButton.style.background = 'rgba(93, 211, 158, 0.2)';
      }

      completeButton.addEventListener('click', () => {
        completed[setIndex] = !completed[setIndex];
        persistSessionState(day, index, completed, weights, reps);
        renderSession(day);
      });

      setRow.append(setLabel, inputWrap, completeButton);
      if (completed[setIndex]) {
        setRow.style.opacity = 0.7;
      }
      setList.append(setRow);
    }

    const quickLogButton = document.createElement('button');
    quickLogButton.className = 'btn btn--outline';
    quickLogButton.textContent = 'Quick Log to Journal';
    quickLogButton.addEventListener('click', () => {
      const completedSets = completed.filter(Boolean).length;
      if (!completedSets) {
        alert('Mark at least one set as completed before logging.');
        return;
      }
      const avgWeight = Math.round(weights.reduce((sum, val) => sum + val, 0) / weights.length);
      const avgReps = Math.round(reps.reduce((sum, val) => sum + val, 0) / reps.length);
      const today = new Date().toISOString().split('T')[0];
      addLogEntry({
        date: today,
        day,
        exercise: exercise.exercise,
        sets: `${completedSets}x${avgReps}`,
        load: avgWeight,
        notes: 'Quick logged from active session'
      });
      updateAllUI();
    });

    card.append(header, setList, quickLogButton);
    sessionExercisesContainer.append(card);
  });

  sessionState[day] = sessionState[day] || {};
  saveSessionState();
}

function persistSessionState(day, exerciseIndex, completed, weights, reps) {
  if (!sessionState[day]) {
    sessionState[day] = {};
  }
  sessionState[day][exerciseIndex] = { completed, weights, reps };
  saveSessionState();
}

function saveSessionState() {
  saveToStorage(SESSION_STORAGE_KEY, sessionState);
}

function addLogEntry(entry) {
  logs.push(entry);
  saveToStorage(LOG_STORAGE_KEY, logs);
}

function renderLogs() {
  logList.innerHTML = '';
  if (!logs.length) {
    logList.innerHTML = '<p class="empty">No sessions recorded yet. Capture your work above.</p>';
    return;
  }

  const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

  sorted.forEach(entry => {
    const logCard = document.createElement('div');
    logCard.className = 'log-entry';

    const header = document.createElement('div');
    header.className = 'log-entry__header';

    const title = document.createElement('h3');
    title.textContent = entry.day || 'Session';

    const date = document.createElement('span');
    date.textContent = new Date(entry.date).toLocaleDateString();

    header.append(title, date);

    const exercise = document.createElement('div');
    exercise.textContent = `${entry.exercise} — ${entry.sets} @ ${entry.load} kg`;

    const notes = document.createElement('p');
    notes.className = 'exercise__meta';
    notes.textContent = entry.notes || '';

    logCard.append(header, exercise);
    if (entry.notes) {
      logCard.append(notes);
    }

    logList.append(logCard);
  });
}

function parseSets(sets) {
  const match = sets.match(/(\d+)\s*x\s*(\d+)/i);
  if (!match) return 0;
  const [, setCount, reps] = match.map(Number);
  return setCount * reps;
}

function computeStats() {
  const totalSessions = logs.length;
  const totalVolume = logs.reduce((sum, log) => sum + log.load * parseSets(log.sets), 0);
  const best = logs.reduce((prev, log) => (log.load > (prev?.load || 0) ? log : prev), null);

  totalSessionsDisplay.textContent = totalSessions;
  totalVolumeDisplay.textContent = `${totalVolume} kg`;
  bestLiftDisplay.textContent = best ? `${best.exercise} @ ${best.load} kg` : '—';
}

function renderChart() {
  progressChart.innerHTML = '';
  if (!logs.length) {
    progressChart.innerHTML = '<p class="empty">Your best sets will appear here as you log sessions.</p>';
    return;
  }

  const bestByExercise = new Map();
  logs.forEach(log => {
    const existing = bestByExercise.get(log.exercise);
    if (!existing || log.load > existing.load) {
      bestByExercise.set(log.exercise, { load: log.load, date: log.date });
    }
  });

  const bars = Array.from(bestByExercise.entries())
    .map(([exercise, info]) => ({ exercise, ...info }))
    .sort((a, b) => b.load - a.load)
    .slice(0, 6);

  const maxLoad = Math.max(...bars.map(bar => bar.load), 1);

  bars.forEach(bar => {
    const barEl = document.createElement('div');
    barEl.className = 'chart-bar';
    const height = Math.max(30, (bar.load / maxLoad) * 180);
    barEl.style.height = `${height}px`;

    const loadLabel = document.createElement('span');
    loadLabel.textContent = `${bar.load} kg`;
    loadLabel.style.fontWeight = '600';

    const nameLabel = document.createElement('span');
    nameLabel.textContent = bar.exercise;
    nameLabel.style.textAlign = 'center';

    barEl.append(loadLabel, nameLabel);
    progressChart.append(barEl);
  });
}

planForm.addEventListener('submit', event => {
  event.preventDefault();
  const day = document.getElementById('day').value;
  const exercise = document.getElementById('exercise').value.trim();
  const sets = Number(document.getElementById('sets').value);
  const reps = Number(document.getElementById('reps').value);
  const weight = Number(document.getElementById('weight').value);
  const notes = document.getElementById('notes').value.trim();

  if (!day || !exercise || !sets || !reps || weight < 0) {
    return;
  }

  if (!plan[day]) {
    plan[day] = [];
  }

  plan[day].push({ exercise, sets, reps, weight, notes });
  saveToStorage(PLAN_STORAGE_KEY, plan);
  planForm.reset();
  updateSessionOptions();
  renderPlan();
});

loadSessionButton.addEventListener('click', () => {
  const day = sessionDaySelect.value;
  renderSession(day);
});

sessionDaySelect.addEventListener('change', () => {
  renderSession(sessionDaySelect.value);
});

logForm.addEventListener('submit', event => {
  event.preventDefault();
  const entry = {
    date: document.getElementById('logDate').value,
    day: document.getElementById('logDay').value.trim(),
    exercise: document.getElementById('logExercise').value.trim(),
    sets: document.getElementById('logSets').value.trim(),
    load: Number(document.getElementById('logLoad').value),
    notes: document.getElementById('logNotes').value.trim()
  };

  if (!entry.date || !entry.day || !entry.exercise || !entry.sets || Number.isNaN(entry.load)) {
    return;
  }

  addLogEntry(entry);
  logForm.reset();
  document.getElementById('logDate').value = new Date().toISOString().split('T')[0];
  updateAllUI();
});

function updateTimerDisplay() {
  const minutes = String(Math.floor(countdownSeconds / 60)).padStart(2, '0');
  const seconds = String(countdownSeconds % 60).padStart(2, '0');
  timerDisplay.textContent = `${minutes}:${seconds}`;
}

function startTimer() {
  if (timerInterval) return;
  timerDisplay.classList.remove('timer-complete');
  timerInterval = setInterval(() => {
    countdownSeconds = Math.max(0, countdownSeconds - 1);
    updateTimerDisplay();
    if (countdownSeconds === 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerDisplay.classList.add('timer-complete');
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  pauseTimer();
  countdownSeconds = 120;
  timerDisplay.classList.remove('timer-complete');
  updateTimerDisplay();
}

timerStart.addEventListener('click', startTimer);
timerPause.addEventListener('click', pauseTimer);
timerReset.addEventListener('click', resetTimer);

function updateAllUI() {
  renderPlan();
  updateSessionOptions();
  renderSession(sessionDaySelect.value);
  renderLogs();
  computeStats();
  renderChart();
}

updateAllUI();
updateTimerDisplay();

if (!document.getElementById('logDate').value) {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('logDate').value = today;
}
