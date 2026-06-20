import { useState, useEffect, useRef } from 'react';
import SectionCard from '../components/SectionCard';
import RichTextArea from '../components/RichTextArea';
import DayModal from '../components/DayModal';
import TaskModal from '../components/TaskModal';
import { loadWeekData, saveWeekData } from '../utils/storage';
import { getDatesForWeek, getTodayInfo, formatDate, MONTH_NAMES } from '../utils/calendarUtils';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DEFAULT_QUOTE = 'What will I do, by when, and what is my reward?';

function loadQuote() {
  try { return localStorage.getItem('planner_quote') || DEFAULT_QUOTE; } catch { return DEFAULT_QUOTE; }
}
function saveQuote(q) {
  try { localStorage.setItem('planner_quote', q); } catch { /* ignore */ }
}

function newTodo() {
  return { id: crypto.randomUUID(), text: '', done: false, status: 'not_started', description: '', subtasks: [] };
}

export default function WeeklyPlanner({ weekNumber, weekYear }) {
  const [data, setData] = useState(() => loadWeekData(weekNumber, weekYear));
  const dates = getDatesForWeek(weekNumber, weekYear);
  const today = getTodayInfo();

  const [modalDay, setModalDay] = useState(null);
  const [taskModalId, setTaskModalId] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [quote, setQuote] = useState(loadQuote);
  const [editingQuote, setEditingQuote] = useState(false);
  const quoteRef = useRef(null);

  const priorityRefs = useRef([]);
  const reminderRefs = useRef([]);
  const mealRefs = useRef([]);
  const todoRefs = useRef([]);

  useEffect(() => {
    setData(loadWeekData(weekNumber, weekYear));
    setShowCompleted(false);
    setModalDay(null);
    setTaskModalId(null);
  }, [weekNumber, weekYear]);

  const update = (next) => {
    setData(next);
    saveWeekData(weekNumber, weekYear, next);
  };

  const isTodayIndex = (i) => {
    const d = dates[i];
    return d.getFullYear() === today.year && d.getMonth() === today.monthIndex && d.getDate() === today.date;
  };

  // --- Priorities ---
  const addPriority = () => {
    const priorities = [...data.priorities, ''];
    update({ ...data, priorities });
    return priorities.length - 1;
  };

  // --- Todos ---
  const activeTodos = data.todos.filter(t => !t.done);
  const completedTodos = data.todos.filter(t => t.done);
  const taskModalTodo = taskModalId ? data.todos.find(t => t.id === taskModalId) : null;

  const patchTodo = (id, updates) => {
    update({
      ...data,
      todos: data.todos.map(t => {
        if (t.id !== id) return t;
        const next = { ...t, ...updates };
        if ('done' in updates && !('status' in updates)) {
          next.status = updates.done ? 'done' : 'not_started';
        }
        if ('status' in updates && !('done' in updates)) {
          next.done = updates.status === 'done';
        }
        return next;
      }),
    });
  };

  const addTodo = () => {
    const todo = newTodo();
    const todos = [...data.todos, todo];
    update({ ...data, todos });
    return todos.filter(t => !t.done).length - 1;
  };

  // --- Reminders ---
  const addReminder = () => {
    const reminders = [...data.reminders, ''];
    update({ ...data, reminders });
    return reminders.length - 1;
  };

  const weekLabel = `${formatDate(dates[0])} – ${formatDate(dates[6])}`;
  const headerMonth = MONTH_NAMES[dates[0].getMonth()];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-[#9b9eb0] tracking-[0.1em] uppercase mb-1">
            {headerMonth} {weekYear}
          </div>
          <h1 className="text-[26px] font-extrabold text-[#1a1a2e] leading-none m-0">
            Week of {weekLabel}
          </h1>
        </div>

        {/* Editable weekly quote */}
        <div className="flex-shrink-0 max-w-xs text-right">
          {editingQuote ? (
            <input
              ref={quoteRef}
              value={quote}
              onChange={e => setQuote(e.target.value)}
              onBlur={() => { saveQuote(quote); setEditingQuote(false); }}
              onKeyDown={e => { if (e.key === 'Enter') quoteRef.current?.blur(); }}
              className="text-[13px] italic text-right bg-transparent border-0 border-b outline-none w-full"
              style={{ color: '#9b9eb0', borderColor: '#c4c7d5', fontFamily: 'inherit' }}
              autoFocus
            />
          ) : (
            <span
              onClick={() => setEditingQuote(true)}
              title="Click to edit"
              className="text-[13px] italic cursor-text select-none transition-colors hover:text-[#7c5cbf]"
              style={{ color: '#b0b3c4' }}
            >
              {quote}
            </span>
          )}
        </div>
      </div>

      {/* Row 1: Priorities / To-Do / Reminders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-3.5">

        {/* Priorities */}
        <SectionCard title="🔥 Priorities" showHint>
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
                ref={el => priorityRefs.current[i] = el}
                value={p}
                onChange={e => {
                  const priorities = [...data.priorities];
                  priorities[i] = e.target.value;
                  update({ ...data, priorities });
                }}
                onKeyDown={e => {
                  if (e.key !== 'Enter') return;
                  e.preventDefault();
                  if (i === data.priorities.length - 1) {
                    const idx = addPriority();
                    setTimeout(() => priorityRefs.current[idx]?.focus(), 0);
                  } else {
                    priorityRefs.current[i + 1]?.focus();
                  }
                }}
                placeholder={`Priority ${i + 1}...`}
                className="border-0 bg-transparent text-[13px] text-[#3d3f4e] w-full outline-none placeholder:text-[#c4c7d5]"
              />
            </div>
          ))}
        </SectionCard>

        {/* To-Do */}
        <SectionCard title="✅ To-Do" showHint>
          {activeTodos.map((t, activeIdx) => (
            <div key={t.id} className="flex gap-2 items-center mb-[5px] group">
              <input
                type="checkbox"
                checked={false}
                onChange={() => patchTodo(t.id, { done: true })}
                className="flex-shrink-0 w-[14px] h-[14px] cursor-pointer accent-[#7c5cbf]"
              />
              <input
                ref={el => todoRefs.current[activeIdx] = el}
                value={t.text}
                onChange={e => patchTodo(t.id, { text: e.target.value })}
                onKeyDown={e => {
                  if (e.key !== 'Enter') return;
                  e.preventDefault();
                  if (activeIdx === activeTodos.length - 1) {
                    const idx = addTodo();
                    setTimeout(() => todoRefs.current[idx]?.focus(), 0);
                  } else {
                    todoRefs.current[activeIdx + 1]?.focus();
                  }
                }}
                placeholder="Add task..."
                className="border-0 bg-transparent text-[13px] w-full outline-none placeholder:text-[#c4c7d5]"
                style={{ color: '#3d3f4e' }}
              />
              <button
                onClick={() => setTaskModalId(t.id)}
                title="Open task details"
                className="opacity-0 group-hover:opacity-100 flex-shrink-0 bg-transparent border-0 cursor-pointer p-0 transition-opacity"
                style={{ color: '#9b9eb0', lineHeight: 1 }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 11L11 2M11 2H5.5M11 2V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          ))}

          {completedTodos.length > 0 && (
            <button
              onClick={() => setShowCompleted(s => !s)}
              className="mt-2 text-[11px] text-[#9b9eb0] hover:text-[#7c5cbf] transition-colors bg-transparent border-0 cursor-pointer p-0 block"
            >
              {showCompleted ? 'Hide completed' : `Show completed (${completedTodos.length})`}
            </button>
          )}

          {showCompleted && (
            <div className="mt-2 pt-2 border-t border-[#e8e9ef]">
              {completedTodos.map(t => (
                <div key={t.id} className="flex gap-2 items-center mb-[5px]">
                  <input
                    type="checkbox"
                    checked
                    onChange={() => patchTodo(t.id, { done: false })}
                    className="flex-shrink-0 w-[14px] h-[14px] cursor-pointer accent-[#7c5cbf]"
                  />
                  <span
                    className="text-[13px]"
                    style={{ color: '#9b9eb0', textDecoration: 'line-through' }}
                  >
                    {t.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Reminders */}
        <SectionCard title="🔔 Reminders" showHint>
          {data.reminders.map((r, i) => (
            <input
              key={i}
              ref={el => reminderRefs.current[i] = el}
              value={r}
              onChange={e => {
                const reminders = [...data.reminders];
                reminders[i] = e.target.value;
                update({ ...data, reminders });
              }}
              onKeyDown={e => {
                if (e.key !== 'Enter') return;
                e.preventDefault();
                if (i === data.reminders.length - 1) {
                  const idx = addReminder();
                  setTimeout(() => reminderRefs.current[idx]?.focus(), 0);
                } else {
                  reminderRefs.current[i + 1]?.focus();
                }
              }}
              placeholder="Add reminder..."
              className="block w-full border-0 border-b border-[#e3e5e8] bg-transparent text-[13px] text-[#3d3f4e] outline-none pb-1 mb-2 box-border placeholder:text-[#c4c7d5] focus:border-[#7c5cbf] transition-colors"
            />
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
                className={`rounded-lg p-2.5 cursor-pointer transition-colors ${
                  isToday ? 'bg-[#f0f0ff]' : 'bg-[#f7f8fa] hover:bg-[#efefff]'
                }`}
                style={{ borderLeft: isToday ? '3px solid #7c5cbf' : '3px solid transparent' }}
                onClick={() => setModalDay({ day, index: i })}
              >
                <div className="text-[10px] font-black text-[#9b9eb0] tracking-widest mb-1">{day}</div>
                <div
                  className="text-[11px] mb-2"
                  style={{ color: isToday ? '#7c5cbf' : '#b0b3c4', fontWeight: isToday ? '700' : '400' }}
                >
                  {formatDate(dates[i])}
                </div>
                <div onClick={e => e.stopPropagation()}>
                  <RichTextArea
                    value={data.dayNotes[day]}
                    onChange={val => update({ ...data, dayNotes: { ...data.dayNotes, [day]: val } })}
                    placeholder="..."
                  />
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Row 3: Meal Plans + Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <SectionCard title="🥗 Meal Plans">
          {DAYS.map((day, i) => (
            <div key={day} className="flex gap-2.5 items-center mb-[5px]">
              <span className="text-[11px] font-bold text-[#9b9eb0] w-7 flex-shrink-0">{day}</span>
              <input
                ref={el => mealRefs.current[i] = el}
                value={data.mealPlan[day]}
                onChange={e => update({ ...data, mealPlan: { ...data.mealPlan, [day]: e.target.value } })}
                onKeyDown={e => {
                  if (e.key !== 'Enter') return;
                  e.preventDefault();
                  if (i < DAYS.length - 1) mealRefs.current[i + 1]?.focus();
                }}
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

      {/* Day Modal */}
      {modalDay && (
        <DayModal
          isOpen
          onClose={() => setModalDay(null)}
          dayName={modalDay.day}
          dateLabel={formatDate(dates[modalDay.index])}
          value={data.dayNotes[modalDay.day]}
          onChange={val => update({ ...data, dayNotes: { ...data.dayNotes, [modalDay.day]: val } })}
        />
      )}

      {/* Task Modal */}
      {taskModalTodo && (
        <TaskModal
          task={taskModalTodo}
          onClose={() => setTaskModalId(null)}
          onUpdate={updated => patchTodo(updated.id, updated)}
        />
      )}
    </div>
  );
}
