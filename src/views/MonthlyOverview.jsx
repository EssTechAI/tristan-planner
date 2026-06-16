import { useState, useEffect, useRef } from 'react';
import SectionCard from '../components/SectionCard';
import MiniCalendar from '../components/MiniCalendar';
import { loadMonthData, saveMonthData } from '../utils/storage';
import { MONTH_NAMES } from '../utils/calendarUtils';

export default function MonthlyOverview({ year, monthIndex }) {
  const [data, setData] = useState(() => loadMonthData(year, monthIndex));

  const dateRefs = useRef([]);
  const goalRefs = useRef([]);
  const birthdayRefs = useRef([]);

  useEffect(() => {
    setData(loadMonthData(year, monthIndex));
  }, [year, monthIndex]);

  const update = (next) => {
    setData(next);
    saveMonthData(year, monthIndex, next);
  };

  // --- Important Dates ---
  const addDate = () => {
    const importantDates = [...data.importantDates, ''];
    update({ ...data, importantDates });
    return importantDates.length - 1;
  };

  // --- Goals ---
  const addGoal = () => {
    const goals = [...data.goals, { text: '', done: false }];
    update({ ...data, goals });
    return goals.length - 1;
  };

  // --- Birthdays ---
  const addBirthday = () => {
    const birthdays = [...data.birthdays, ''];
    update({ ...data, birthdays });
    return birthdays.length - 1;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="text-[11px] font-bold text-[#9b9eb0] tracking-[0.1em] uppercase mb-1">
          {year} Overview
        </div>
        <h1 className="text-[32px] font-extrabold text-[#1a1a2e] leading-none m-0">
          {MONTH_NAMES[monthIndex]}
        </h1>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <SectionCard title="📅 Important Dates" showHint>
          {data.importantDates.map((d, i) => (
            <input
              key={i}
              ref={el => dateRefs.current[i] = el}
              value={d}
              onChange={e => {
                const importantDates = [...data.importantDates];
                importantDates[i] = e.target.value;
                update({ ...data, importantDates });
              }}
              onKeyDown={e => {
                if (e.key !== 'Enter') return;
                e.preventDefault();
                if (i === data.importantDates.length - 1) {
                  const idx = addDate();
                  setTimeout(() => dateRefs.current[idx]?.focus(), 0);
                } else {
                  dateRefs.current[i + 1]?.focus();
                }
              }}
              placeholder={`Date ${i + 1}...`}
              className="block w-full border-0 border-b border-[#e3e5e8] bg-transparent text-[13px] text-[#3d3f4e] outline-none pb-1 mb-2 box-border placeholder:text-[#c4c7d5] focus:border-[#7c5cbf] transition-colors"
            />
          ))}
        </SectionCard>

        <SectionCard title="🎯 Monthly Goals" showHint>
          {data.goals.map((g, i) => (
            <div key={i} className="flex items-center gap-2 mb-[6px]">
              <button
                onClick={() => {
                  const goals = data.goals.map((goal, gi) =>
                    gi === i ? { ...goal, done: !goal.done } : goal
                  );
                  update({ ...data, goals });
                }}
                className="w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors cursor-pointer bg-transparent outline-none"
                style={{ borderColor: '#7c5cbf', background: g.done ? '#7c5cbf' : 'transparent' }}
              >
                {g.done && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <input
                ref={el => goalRefs.current[i] = el}
                value={g.text}
                onChange={e => {
                  const goals = data.goals.map((goal, gi) =>
                    gi === i ? { ...goal, text: e.target.value } : goal
                  );
                  update({ ...data, goals });
                }}
                onKeyDown={e => {
                  if (e.key !== 'Enter') return;
                  e.preventDefault();
                  if (i === data.goals.length - 1) {
                    const idx = addGoal();
                    setTimeout(() => goalRefs.current[idx]?.focus(), 0);
                  } else {
                    goalRefs.current[i + 1]?.focus();
                  }
                }}
                placeholder={`Goal ${i + 1}...`}
                className="border-0 bg-transparent text-[13px] w-full outline-none placeholder:text-[#c4c7d5]"
                style={{
                  color: g.done ? '#9b9eb0' : '#3d3f4e',
                  textDecoration: g.done ? 'line-through' : 'none',
                }}
              />
            </div>
          ))}
        </SectionCard>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <SectionCard title="🎂 Birthdays" showHint>
          {data.birthdays.map((b, i) => (
            <input
              key={i}
              ref={el => birthdayRefs.current[i] = el}
              value={b}
              onChange={e => {
                const birthdays = [...data.birthdays];
                birthdays[i] = e.target.value;
                update({ ...data, birthdays });
              }}
              onKeyDown={e => {
                if (e.key !== 'Enter') return;
                e.preventDefault();
                if (i === data.birthdays.length - 1) {
                  const idx = addBirthday();
                  setTimeout(() => birthdayRefs.current[idx]?.focus(), 0);
                } else {
                  birthdayRefs.current[i + 1]?.focus();
                }
              }}
              placeholder="Name + date..."
              className="block w-full border-0 border-b border-[#e3e5e8] bg-transparent text-[13px] text-[#3d3f4e] outline-none pb-1 mb-2 box-border placeholder:text-[#c4c7d5] focus:border-[#7c5cbf] transition-colors"
            />
          ))}
        </SectionCard>

        <SectionCard title={`📆 ${MONTH_NAMES[monthIndex]} at a Glance`}>
          <MiniCalendar year={year} monthIndex={monthIndex} />
        </SectionCard>
      </div>

      {/* Notes */}
      <SectionCard title="📝 Other Notes">
        <textarea
          value={data.notes}
          onChange={e => update({ ...data, notes: e.target.value })}
          placeholder="Anything else for the month..."
          className="w-full min-h-[80px] border-0 bg-transparent text-[13px] text-[#3d3f4e] resize-y outline-none leading-relaxed box-border placeholder:text-[#c4c7d5]"
        />
      </SectionCard>
    </div>
  );
}
