import { useState, useEffect } from 'react';
import SectionCard from '../components/SectionCard';
import LineInput from '../components/LineInput';
import MiniCalendar from '../components/MiniCalendar';
import { loadMonthData, saveMonthData } from '../utils/storage';
import { MONTH_NAMES } from '../utils/calendarUtils';

export default function MonthlyOverview({ year, monthIndex }) {
  const [data, setData] = useState(() => loadMonthData(year, monthIndex));

  useEffect(() => {
    setData(loadMonthData(year, monthIndex));
  }, [year, monthIndex]);

  const update = (next) => {
    setData(next);
    saveMonthData(year, monthIndex, next);
  };

  const setImportantDate = (i, val) => {
    const importantDates = [...data.importantDates];
    importantDates[i] = val;
    update({ ...data, importantDates });
  };

  const setGoal = (i, field, val) => {
    const goals = data.goals.map((g, gi) => gi === i ? { ...g, [field]: val } : g);
    update({ ...data, goals });
  };

  const setBirthday = (i, val) => {
    const birthdays = [...data.birthdays];
    birthdays[i] = val;
    update({ ...data, birthdays });
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
        <SectionCard title="📅 Important Dates">
          {data.importantDates.map((d, i) => (
            <LineInput key={i} value={d} placeholder={`Date ${i + 1}...`} onChange={v => setImportantDate(i, v)} />
          ))}
        </SectionCard>

        <SectionCard title="🎯 Monthly Goals">
          {data.goals.map((g, i) => (
            <div key={i} className="flex items-center gap-2 mb-[6px]">
              <button
                onClick={() => setGoal(i, 'done', !g.done)}
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
                value={g.text}
                onChange={e => setGoal(i, 'text', e.target.value)}
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
        <SectionCard title="🎂 Birthdays">
          {data.birthdays.map((b, i) => (
            <LineInput key={i} value={b} placeholder="Name + date..." onChange={v => setBirthday(i, v)} />
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
