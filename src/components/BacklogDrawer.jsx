import { useState, useRef } from 'react';
import { DAYS, DAY_COLORS, getDatesForWeek, toISODate, fromISODate, dayAbbrevForDate, formatDate } from '../utils/calendarUtils';

export default function BacklogDrawer({
  isOpen,
  onClose,
  todos,
  weekYear,
  weekNumber,
  onAdd,
  onToggleDone,
  onAssignDate,
  onDelete,
  onOpenDetail,
}) {
  const [newText, setNewText] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const newInputRef = useRef(null);

  const weekDates = getDatesForWeek(weekNumber, weekYear);

  const activeTodos = todos.filter(t => !t.done);
  const completedTodos = todos.filter(t => t.done);

  const handleAdd = () => {
    const text = newText.trim();
    if (!text) return;
    onAdd(text);
    setNewText('');
    setTimeout(() => newInputRef.current?.focus(), 0);
  };

  return (
    <>
      {/* Dim backdrop only where the drawer takes the full screen (mobile) —
          on wider screens it's not full-width, so the week stays visible and
          usable underneath with no backdrop dimming it. */}
      <div
        className={`fixed inset-0 z-[60] bg-black/30 sm:hidden transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-[380px] bg-white z-[70] flex flex-col shadow-2xl transition-transform duration-200 ease-out"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e9ef] flex-shrink-0">
          <div>
            <h2 className="text-[18px] font-extrabold text-[#1a1a2e] leading-none m-0">To Do</h2>
            <p className="text-[11px] text-[#9b9eb0] mt-1 mb-0">Everything waiting for a day</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close To Do panel"
            className="w-8 h-8 flex items-center justify-center text-[#9b9eb0] hover:text-[#3d3f4e] transition-colors bg-transparent border-0 cursor-pointer text-[22px] leading-none flex-shrink-0"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-3 border-b border-[#e8e9ef] flex-shrink-0">
          <input
            ref={newInputRef}
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
            placeholder="Add a task to the backlog..."
            className="w-full border-0 border-b border-[#e3e5e8] bg-transparent text-[13px] text-[#3d3f4e] outline-none pb-2 placeholder:text-[#c4c7d5] focus:border-[#7c5cbf] transition-colors"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {activeTodos.length === 0 && (
            <p className="text-[12px] text-[#c4c7d5] text-center mt-8">Nothing in the backlog — add something above.</p>
          )}
          {activeTodos.map(t => (
            <BacklogCard
              key={t.id}
              todo={t}
              weekDates={weekDates}
              onToggleDone={onToggleDone}
              onAssignDate={onAssignDate}
              onDelete={onDelete}
              onOpenDetail={onOpenDetail}
            />
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
                <BacklogCard
                  key={t.id}
                  todo={t}
                  weekDates={weekDates}
                  onToggleDone={onToggleDone}
                  onAssignDate={onAssignDate}
                  onDelete={onDelete}
                  onOpenDetail={onOpenDetail}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function BacklogCard({ todo, weekDates, onToggleDone, onAssignDate, onDelete, onOpenDetail }) {
  const assignedInThisWeek = todo.assignedDate
    ? weekDates.find(d => toISODate(d) === todo.assignedDate)
    : null;

  const assignedDateObj = todo.assignedDate ? fromISODate(todo.assignedDate) : null;
  const dayAbbrev = assignedDateObj ? dayAbbrevForDate(assignedDateObj) : null;
  const dayColor = dayAbbrev ? DAY_COLORS[dayAbbrev] : null;

  return (
    <div
      className="mb-2 p-2.5 rounded-lg"
      style={{
        border: todo.assignedDate ? '1px solid #e3e5e8' : '1px dashed #d4d7e0',
        borderLeftWidth: todo.assignedDate ? 3 : 1,
        borderLeftColor: todo.assignedDate ? dayColor : '#d4d7e0',
      }}
    >
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={todo.done}
          onChange={() => onToggleDone(todo.id)}
          className="flex-shrink-0 w-[14px] h-[14px] cursor-pointer accent-[#7c5cbf]"
        />
        <span
          className="flex-1 text-[13px] truncate cursor-pointer"
          title={`${todo.text} — tap for details`}
          onClick={() => onOpenDetail(todo.id)}
          style={{
            color: todo.done ? '#9b9eb0' : '#3d3f4e',
            textDecoration: todo.done ? 'line-through' : 'none',
          }}
        >
          {todo.text || 'Untitled task'}
        </span>
        <button
          onClick={() => onDelete(todo.id)}
          title="Remove from backlog"
          className="flex-shrink-0 bg-transparent border-0 cursor-pointer p-0 text-[#c4c7d5] hover:text-[#ff5c5c] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 mt-2 pl-[22px] flex-wrap">
        <select
          value={assignedInThisWeek ? todo.assignedDate : ''}
          onChange={e => onAssignDate(todo.id, e.target.value || null)}
          title="Assign to a day this week"
          className="text-[10px] font-bold border-0 outline-none cursor-pointer rounded-full px-2 py-0.5 text-center appearance-none flex-shrink-0"
          style={{
            background: assignedInThisWeek ? dayColor : '#eef0f3',
            color: assignedInThisWeek ? '#fff' : '#b0b3c4',
          }}
        >
          <option value="">—</option>
          {weekDates.map((d, i) => (
            <option key={DAYS[i]} value={toISODate(d)}>{DAYS[i]}</option>
          ))}
        </select>

        {todo.assignedDate && !assignedInThisWeek && (
          <span className="text-[10px] text-[#9b9eb0] flex-shrink-0">
            Scheduled {dayAbbrev} · {formatDate(assignedDateObj)}
          </span>
        )}
      </div>
    </div>
  );
}
