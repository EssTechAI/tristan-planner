import { useState, useEffect } from 'react';
import SectionCard from '../components/SectionCard';
import LineInput from '../components/LineInput';
import { loadWeekData, saveWeekData } from '../utils/storage';
import { getDatesForWeek, getTodayInfo, formatDate, MONTH_NAMES } from '../utils/calendarUtils';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function WeeklyPlanner({ weekNumber, weekYear }) {
  const [data, setData] = useState(() => loadWeekData(weekNumber, weekYear));
  const dates = getDatesForWeek(weekNumber, weekYear);
  const today = getTodayInfo();

  useEffect(() => {
    setData(loadWeekData(weekNumber, weekYear));
  }, [weekNumber, weekYear]);

  const update = (next) => {
    setData(next);
    saveWeekData(weekNumber, weekYear, next);
  };

  const isTodayIndex = (i) => {
    const d = dates[i];
    return d.getFullYear() === today.year && d.getMonth() === today.monthIndex && d.getDate() === today.date;
  };

  const addTodo = () => {
    update({ ...data, todos: [...data.todos, { id: crypto.randomUUID(), text: '', done: false }] });
  };

  const removeTodo = (id) => {
    update({ ...data, todos: data.todos.filter(t => t.id !== id) });
  };

  const patchTodo = (id, field, val) => {
    update({ ...data, todos: data.todos.map(t => t.id === id ? { ...t, [field]: val } : t) });
  };

  const weekLabel = `${formatDate(dates[0])} – ${formatDate(dates[6])}`;
  const headerMonth = MONTH_NAMES[dates[0].getMonth()];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="text-[11px] font-bold text-[#9b9eb0] tracking-[0.1em] uppercase mb-1">
          {headerMonth} {weekYear}
        </div>
        <h1 className="text-[26px] font-extrabold text-[#1a1a2e] leading-none m-0">
          Week of {weekLabel}
        </h1>
      </div>

      {/* Row 1: Priorities / To-Do / Reminders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-3.5">
        {/* Priorities */}
        <SectionCard title="🔥 Priorities">
          {data.priorities.map((p, i) => (
            <div key={i} className="flex gap-2 items-center mb-[6px]">
              <div
                className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black select-none"
                style={{
                  background: i === 0 ? '#ff5c5c' : i === 1 ? '#ff9d3d' : '#e3e5e8',
                  color: i < 2 ? '#fff' : '#aaa',
                }}
              >
                {i + 1}
              </div>
              <input
                value={p}
                onChange={e => {
                  const priorities = [...data.priorities];
                  priorities[i] = e.target.value;
                  update({ ...data, priorities });
                }}
                placeholder={`Priority ${i + 1}...`}
                className="border-0 bg-transparent text-[13px] text-[#3d3f4e] w-full outline-none placeholder:text-[#c4c7d5]"
              />
            </div>
          ))}
        </SectionCard>

        {/* To-Do */}
        <SectionCard title="✅ To-Do">
          {data.todos.map((t) => (
            <div key={t.id} className="flex gap-2 items-center mb-[5px] group">
              <input
                type="checkbox"
                checked={t.done}
                onChange={e => patchTodo(t.id, 'done', e.target.checked)}
                className="flex-shrink-0 w-[14px] h-[14px] cursor-pointer accent-[#7c5cbf]"
              />
              <input
                value={t.text}
                onChange={e => patchTodo(t.id, 'text', e.target.value)}
                placeholder="Add task..."
                className="border-0 bg-transparent text-[13px] w-full outline-none placeholder:text-[#c4c7d5]"
                style={{
                  color: t.done ? '#aaa' : '#3d3f4e',
                  textDecoration: t.done ? 'line-through' : 'none',
                }}
              />
              <button
                onClick={() => removeTodo(t.id)}
                className="opacity-0 group-hover:opacity-100 text-[#9b9eb0] hover:text-[#ff5c5c] transition-all text-xl leading-none bg-transparent border-0 cursor-pointer p-0 flex-shrink-0"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={addTodo}
            className="mt-1 text-[12px] text-[#9b9eb0] hover:text-[#7c5cbf] transition-colors flex items-center gap-1 bg-transparent border-0 cursor-pointer p-0"
          >
            <span className="text-base leading-none">+</span> Add task
          </button>
        </SectionCard>

        {/* Reminders */}
        <SectionCard title="🔔 Reminders">
          {data.reminders.map((r, i) => (
            <LineInput key={i} value={r} placeholder="Add reminder..." onChange={v => {
              const reminders = [...data.reminders];
              reminders[i] = v;
              update({ ...data, reminders });
            }} />
          ))}
        </SectionCard>
      </div>

      {/* Row 2: Day grid */}
      <SectionCard title="📅 This Week" className="mb-3.5">
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day, i) => {
            const isToday = isTodayIndex(i);
            return (
              <div
                key={day}
                className="rounded-lg p-2.5"
                style={{ background: isToday ? '#f0f0ff' : '#f7f8fa' }}
              >
                <div className="text-[10px] font-black text-[#9b9eb0] tracking-widest mb-1">{day}</div>
                <div
                  className="text-[11px] mb-2"
                  style={{ color: isToday ? '#7c5cbf' : '#b0b3c4', fontWeight: isToday ? '700' : '400' }}
                >
                  {formatDate(dates[i])}
                </div>
                <textarea
                  value={data.dayNotes[day]}
                  onChange={e => update({ ...data, dayNotes: { ...data.dayNotes, [day]: e.target.value } })}
                  placeholder="..."
                  className="w-full min-h-[60px] border-0 bg-transparent text-[12px] text-[#3d3f4e] resize-none outline-none leading-[1.5] box-border placeholder:text-[#d0d3e0]"
                />
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Row 3: Meal Plans + Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <SectionCard title="🥗 Meal Plans">
          {DAYS.map((day) => (
            <div key={day} className="flex gap-2.5 items-center mb-[5px]">
              <span className="text-[11px] font-bold text-[#9b9eb0] w-7 flex-shrink-0">{day}</span>
              <input
                value={data.mealPlan[day]}
                onChange={e => update({ ...data, mealPlan: { ...data.mealPlan, [day]: e.target.value } })}
                placeholder="Meal..."
                className="border-0 border-b border-[#e3e5e8] bg-transparent text-[13px] text-[#3d3f4e] w-full outline-none pb-0.5 placeholder:text-[#c4c7d5] focus:border-[#4e9af1] transition-colors"
              />
            </div>
          ))}
        </SectionCard>

        <SectionCard title="📝 Notes">
          <textarea
            value={data.notes}
            onChange={e => update({ ...data, notes: e.target.value })}
            placeholder="Anything else this week..."
            className="w-full min-h-[140px] border-0 bg-transparent text-[13px] text-[#3d3f4e] resize-y outline-none leading-relaxed box-border placeholder:text-[#c4c7d5]"
          />
        </SectionCard>
      </div>
    </div>
  );
}
