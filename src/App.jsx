import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import TabBar from './components/TabBar';
import MonthlyOverview from './views/MonthlyOverview';
import WeeklyPlanner from './views/WeeklyPlanner';
import Login from './views/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getTodayInfo, getDatesForWeek } from './utils/calendarUtils';

function CurrentWeekRedirect() {
  const { weekYear, weekNumber } = getTodayInfo();
  return <Navigate to={`/week/${weekYear}-${weekNumber}`} replace />;
}

function AppShell({ year, monthIndex, weekNumber, weekYear, view, children }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar
        activeYear={year}
        activeMonthIndex={monthIndex}
        activeWeekNumber={weekNumber}
        activeWeekYear={weekYear}
        view={view}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar year={year} monthIndex={monthIndex} weekNumber={weekNumber} weekYear={weekYear} view={view} />
        <TabBar year={year} monthIndex={monthIndex} weekNumber={weekNumber} weekYear={weekYear} view={view} />
        <main className="flex-1 overflow-y-auto bg-[#f7f8fa] p-7">
          {children}
        </main>
      </div>
    </div>
  );
}

function MonthRoute() {
  const { monthParam } = useParams();
  const [yearStr, monthStr] = monthParam.split('-');
  const year = Number(yearStr);
  const monthIndex = Number(monthStr);

  return (
    <AppShell year={year} monthIndex={monthIndex} weekNumber={null} weekYear={null} view="monthly">
      <MonthlyOverview year={year} monthIndex={monthIndex} />
    </AppShell>
  );
}

function WeekRoute() {
  const { weekParam } = useParams();
  const [yearStr, weekStr] = weekParam.split('-');
  const weekYear = Number(yearStr);
  const weekNumber = Number(weekStr);

  const dates = getDatesForWeek(weekNumber, weekYear);
  const monday = dates[0];

  return (
    <AppShell
      year={monday.getFullYear()}
      monthIndex={monday.getMonth()}
      weekNumber={weekNumber}
      weekYear={weekYear}
      view="weekly"
    >
      <WeeklyPlanner weekNumber={weekNumber} weekYear={weekYear} />
    </AppShell>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-white" />;
  if (!user) return <Login />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CurrentWeekRedirect />} />
        <Route path="/month/:monthParam" element={<MonthRoute />} />
        <Route path="/week/:weekParam" element={<WeekRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
