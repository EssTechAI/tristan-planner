const timers = {};

function debounced(key, fn) {
  clearTimeout(timers[key]);
  timers[key] = setTimeout(fn, 300);
}

function defaultTodo() {
  return {
    id: crypto.randomUUID(),
    text: '',
    done: false,
    status: 'not_started',
    description: '',
    subtasks: [],
  };
}

function defaultMonthData() {
  return {
    importantDates: ['', '', '', '', '', ''],
    goals: Array.from({ length: 5 }, () => ({ text: '', done: false })),
    birthdays: ['', '', ''],
    notes: '',
  };
}

function defaultWeekData() {
  return {
    priorities: ['', '', ''],
    todos: Array.from({ length: 3 }, defaultTodo),
    reminders: ['', '', '', ''],
    mealPlan: { MON: '', TUE: '', WED: '', THU: '', FRI: '', SAT: '', SUN: '' },
    dayNotes: { MON: '', TUE: '', WED: '', THU: '', FRI: '', SAT: '', SUN: '' },
    notes: '',
  };
}

export function loadMonthData(year, monthIndex) {
  try {
    const raw = localStorage.getItem(`month_${year}_${monthIndex}`);
    if (!raw) return defaultMonthData();
    const data = JSON.parse(raw);
    if (data.goals && typeof data.goals[0] === 'string') {
      data.goals = data.goals.map(g => ({ text: g, done: false }));
    }
    return data;
  } catch {
    return defaultMonthData();
  }
}

export function saveMonthData(year, monthIndex, data) {
  const key = `month_${year}_${monthIndex}`;
  debounced(key, () => localStorage.setItem(key, JSON.stringify(data)));
}

export function loadWeekData(weekNumber, year) {
  try {
    const raw = localStorage.getItem(`week_${year}_${weekNumber}`);
    if (!raw) return defaultWeekData();
    const data = JSON.parse(raw);
    // Migrate todos to extended format
    if (data.todos) {
      data.todos = data.todos.map(t => ({
        status: 'not_started',
        description: '',
        subtasks: [],
        ...t,
      }));
    }
    return data;
  } catch {
    return defaultWeekData();
  }
}

export function saveWeekData(weekNumber, year, data) {
  const key = `week_${year}_${weekNumber}`;
  debounced(key, () => localStorage.setItem(key, JSON.stringify(data)));
}
