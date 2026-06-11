import { useNavigate } from 'react-router-dom';
import { getWeeksForMonth } from '../utils/calendarUtils';

export default function TabBar({ year, monthIndex, weekNumber, weekYear, view }) {
  const navigate = useNavigate();

  const goMonthly = () => navigate(`/month/${year}-${monthIndex}`);

  const goWeekly = () => {
    if (weekNumber != null && weekYear != null) {
      navigate(`/week/${weekYear}-${weekNumber}`);
    } else {
      const weeks = getWeeksForMonth(year, monthIndex);
      if (weeks.length > 0) {
        const { weekYear: wy, weekNumber: wn } = weeks[0];
        navigate(`/week/${wy}-${wn}`);
      }
    }
  };

  return (
    <div className="bg-white border-b border-[#e3e5e8] flex items-center px-8 h-11 flex-shrink-0">
      <TabBtn label="Monthly Overview" active={view === 'monthly'} onClick={goMonthly} />
      <TabBtn label="Weekly Planner" active={view === 'weekly'} onClick={goWeekly} />
    </div>
  );
}

function TabBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-5 h-11 bg-transparent text-[13px] cursor-pointer transition-colors border-0 outline-none"
      style={{
        fontWeight: active ? '600' : '400',
        color: active ? '#7c5cbf' : '#6b6e80',
        borderBottom: active ? '2px solid #7c5cbf' : '2px solid transparent',
      }}
    >
      {label}
    </button>
  );
}
