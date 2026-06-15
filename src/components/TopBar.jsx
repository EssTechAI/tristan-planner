import { MONTH_NAMES } from '../utils/calendarUtils';
import { useAuth } from '../context/AuthContext';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TopBar({ year, monthIndex, weekNumber, weekYear, view }) {
  const now = new Date();
  const todayStr = `${DOW[now.getDay()]}, ${MONTH_NAMES[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  const { signOut } = useAuth();

  return (
    <div className="bg-[#1a1a2e] text-white px-5 flex items-center gap-4 h-12 text-[13px] flex-shrink-0">
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-[6px] flex items-center justify-center text-white font-black text-sm flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7c5cbf, #4e9af1)' }}
        >
          P
        </div>
        <span className="font-semibold text-sm">My Planner</span>
      </div>

      <span className="opacity-40">›</span>
      <span className="opacity-70">{year}</span>
      <span className="opacity-40">›</span>
      <span className="font-semibold" style={{ color: '#7c8cff' }}>{MONTH_NAMES[monthIndex]}</span>

      {view === 'weekly' && weekNumber != null && (
        <>
          <span className="opacity-40">›</span>
          <span className="font-semibold text-[#4e9af1]">Week {weekNumber}</span>
        </>
      )}

      <div className="ml-auto flex items-center gap-4">
        <span className="text-[12px] opacity-60">{todayStr}</span>
        <button
          onClick={signOut}
          className="text-[12px] opacity-50 hover:opacity-100 transition-opacity bg-transparent border-0 text-white cursor-pointer p-0"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
