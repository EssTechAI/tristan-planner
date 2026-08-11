import { supabase } from '../lib/supabase';

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

export function defaultMonthData() {
  return {
    importantDates: ['', '', '', '', '', ''],
    goals: Array.from({ length: 5 }, () => ({ text: '', done: false })),
    birthdays: ['', '', ''],
    notes: '',
  };
}

export function defaultWeekData() {
  return {
    priorities: ['', '', ''],
    todos: Array.from({ length: 3 }, defaultTodo),
    reminders: ['', '', '', ''],
    mealPlan: { MON: '', TUE: '', WED: '', THU: '', FRI: '', SAT: '', SUN: '' },
    dayNotes: { MON: '', TUE: '', WED: '', THU: '', FRI: '', SAT: '', SUN: '' },
    notes: '',
  };
}

function normalizeMonthData(raw) {
  const data = { ...defaultMonthData(), ...raw };
  if (data.goals && typeof data.goals[0] === 'string') {
    data.goals = data.goals.map(g => ({ text: g, done: false }));
  }
  return data;
}

function normalizeWeekData(raw) {
  const data = { ...defaultWeekData(), ...raw };
  if (data.todos) {
    data.todos = data.todos.map(t => ({
      status: 'not_started',
      description: '',
      subtasks: [],
      ...t,
    }));
  }
  return data;
}

export async function loadMonthData(userId, year, monthIndex) {
  const { data, error } = await supabase
    .from('monthly_data')
    .select('data')
    .eq('user_id', userId)
    .eq('year', year)
    .eq('month_index', monthIndex)
    .maybeSingle();

  if (error) {
    console.error('loadMonthData failed', error);
    return defaultMonthData();
  }
  return normalizeMonthData(data?.data || {});
}

export function saveMonthData(userId, year, monthIndex, data) {
  const key = `month_${userId}_${year}_${monthIndex}`;
  debounced(key, async () => {
    const { error } = await supabase.from('monthly_data').upsert(
      { user_id: userId, year, month_index: monthIndex, data, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,year,month_index' }
    );
    if (error) console.error('saveMonthData failed', error);
  });
}

export async function loadWeekData(userId, weekYear, weekNumber) {
  const { data, error } = await supabase
    .from('weekly_data')
    .select('data')
    .eq('user_id', userId)
    .eq('week_year', weekYear)
    .eq('week_number', weekNumber)
    .maybeSingle();

  if (error) {
    console.error('loadWeekData failed', error);
    return defaultWeekData();
  }
  return normalizeWeekData(data?.data || {});
}

export function saveWeekData(userId, weekYear, weekNumber, data) {
  const key = `week_${userId}_${weekYear}_${weekNumber}`;
  debounced(key, async () => {
    const { error } = await supabase.from('weekly_data').upsert(
      { user_id: userId, week_year: weekYear, week_number: weekNumber, data, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,week_year,week_number' }
    );
    if (error) console.error('saveWeekData failed', error);
  });
}

const MIGRATION_FLAG = 'planner_migrated_to_supabase_v1';

export async function migrateLocalStorageToSupabase(userId) {
  if (localStorage.getItem(MIGRATION_FLAG)) return;

  const monthRows = [];
  const weekRows = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    const monthMatch = key.match(/^month_(\d+)_(\d+)$/);
    if (monthMatch) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        monthRows.push({
          user_id: userId,
          year: Number(monthMatch[1]),
          month_index: Number(monthMatch[2]),
          data,
        });
      } catch {
        // skip corrupt entry
      }
      continue;
    }

    const weekMatch = key.match(/^week_(\d+)_(\d+)$/);
    if (weekMatch) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        weekRows.push({
          user_id: userId,
          week_year: Number(weekMatch[1]),
          week_number: Number(weekMatch[2]),
          data,
        });
      } catch {
        // skip corrupt entry
      }
    }
  }

  if (monthRows.length) {
    const { error } = await supabase
      .from('monthly_data')
      .upsert(monthRows, { onConflict: 'user_id,year,month_index' });
    if (error) console.error('month migration failed', error);
  }
  if (weekRows.length) {
    const { error } = await supabase
      .from('weekly_data')
      .upsert(weekRows, { onConflict: 'user_id,week_year,week_number' });
    if (error) console.error('week migration failed', error);
  }

  localStorage.setItem(MIGRATION_FLAG, 'true');
}
