import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMonthsForYear, getWeeksForMonth, getTodayInfo } from '../utils/calendarUtils';

export default function Sidebar({ activeYear, activeMonthIndex, activeWeekNumber, activeWeekYear, view }) {
  const navigate = useNavigate();
  const today = getTodayInfo();
  const [open, setOpen] = useState(false);

  const months = getMonthsForYear(activeYear);
  const weeks = getWeeksForMonth(activeYear, activeMonthIndex);
  const activeMonthName = months[activeMonthIndex]?.name ?? '';

  const goMonth = (idx) => {
    navigate(`/month/${activeYear}-${idx}`);
    setOpen(false);
  };

  const goWeek = (wy, wn) => {
    navigate(`/week/${wy}-${wn}`);
    setOpen(false);
  };

  const inner = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="px-4 py-3 flex items-center gap-2 border-b border-[#e3e5e8] flex-shrink-0">
        <div
          className="w-7 h-7 rounded-[6px] flex items-center justify-center text-white font-black text-sm flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7c5cbf, #4e9af1)' }}
        >
          P
        </div>
        <span className="font-semibold text-sm text-[#1a1a2e]">My Planner</span>
      </div>

      {/* Scroll area */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-3 py-1.5 text-[10px] font-bold text-[#9b9eb0] tracking-[0.08em] uppercase">
          {activeYear} Months
        </div>
        {months.map(({ name, index }) => {
          const isActive = index === activeMonthIndex && view === 'monthly';
          return (
            <button
              key={index}
              onClick={() => goMonth(index)}
              className="w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors border-0 bg-transparent outline-none"
              style={{
                background: isActive ? '#f0f0ff' : 'transparent',
                color: isActive ? '#7c5cbf' : '#3d3f4e',
                fontWeight: isActive ? '600' : '400',
                borderLeft: isActive ? '3px solid #7c5cbf' : '3px solid transparent',
              }}
            >
              {name}
            </button>
          );
        })}

        <div className="mx-3 mt-3 mb-1 pt-3 border-t border-[#e3e5e8] text-[10px] font-bold text-[#9b9eb0] tracking-[0.08em] uppercase">
          Weeks – {activeMonthName}
        </div>
        {weeks.map(({ label, weekNumber, weekYear }) => {
          const isActive = weekNumber === activeWeekNumber && weekYear === activeWeekYear;
          return (
            <button
              key={`${weekYear}-${weekNumber}`}
              onClick={() => goWeek(weekYear, weekNumber)}
              className="w-full text-left px-4 py-[7px] text-xs cursor-pointer transition-colors border-0 bg-transparent outline-none"
              style={{
                background: isActive ? '#eef6ff' : 'transparent',
                color: isActive ? '#4e9af1' : '#6b6e80',
                fontWeight: isActive ? '600' : '400',
                borderLeft: isActive ? '3px solid #4e9af1' : '3px solid transparent',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Today button */}
      <div className="p-3 border-t border-[#e3e5e8] flex-shrink-0">
        <button
          onClick={() => { navigate(`/week/${today.weekYear}-${today.weekNumber}`); setOpen(false); }}
          className="w-full py-1.5 rounded text-xs font-semibold text-[#7c5cbf] border border-[#7c5cbf] hover:bg-[#f0f0ff] transition-colors bg-transparent cursor-pointer"
        >
          Today
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-52 bg-white border-r border-[#e3e5e8] flex-shrink-0 flex-col">
        {inner}
      </div>

      {/* Mobile: hamburger + drawer */}
      <div className="md:hidden">
        <button
          onClick={() => setOpen(o => !o)}
          className="fixed top-3 left-3 z-50 w-8 h-8 flex flex-col gap-1.5 items-center justify-center bg-white rounded shadow border border-[#e3e5e8]"
        >
          <span className="w-4 h-0.5 bg-[#3d3f4e] rounded" />
          <span className="w-4 h-0.5 bg-[#3d3f4e] rounded" />
          <span className="w-4 h-0.5 bg-[#3d3f4e] rounded" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setOpen(false)} />
            <div className="fixed top-0 left-0 h-full w-52 bg-white z-50 shadow-xl flex flex-col">
              {inner}
            </div>
          </>
        )}
      </div>
    </>
  );
}
