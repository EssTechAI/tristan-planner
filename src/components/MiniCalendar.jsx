import { getMiniCalendarGrid, getTodayInfo } from '../utils/calendarUtils';

const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function MiniCalendar({ year, monthIndex }) {
  const cells = getMiniCalendarGrid(year, monthIndex);
  const today = getTodayInfo();
  const isCurrentMonth = today.year === year && today.monthIndex === monthIndex;

  return (
    <div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAY_HEADERS.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-[#9b9eb0]">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          const isToday = isCurrentMonth && d === today.date;
          return (
            <div
              key={i}
              className={`text-center text-[11px] py-[3px] rounded ${
                isToday
                  ? 'bg-[#7c5cbf] text-white font-bold'
                  : d
                  ? 'text-[#3d3f4e]'
                  : 'invisible'
              }`}
            >
              {d ?? ''}
            </div>
          );
        })}
      </div>
    </div>
  );
}
