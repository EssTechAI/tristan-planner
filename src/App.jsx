import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import TabBar from './components/TabBar';
import BacklogDrawer from './components/BacklogDrawer';
import TaskModal from './components/TaskModal';
import MonthlyOverview from './views/MonthlyOverview';
import WeeklyPlanner from './views/WeeklyPlanner';
import Login from './views/Login';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { getTodayInfo, getDatesForWeek } from './utils/calendarUtils';
import {
  migrateLocalStorageToSupabase,
  loadBacklogTodos,
  saveBacklogTodo,
  deleteBacklogTodo,
  defaultBacklogTodo,
} from './utils/storage';

function CurrentWeekRedirect() {
  const { weekYear, weekNumber } = getTodayInfo();
  return <Navigate to={`/week/${weekYear}-${weekNumber}`} replace />;
}

function AppShell({
  year, monthIndex, weekNumber, weekYear, view, children,
  backlog,
}) {
  // The day-of-week quick-assign inside the drawer needs a specific week to
  // reference. On the Weekly page, use whichever week is open; otherwise
  // (e.g. the Monthly page) fall back to the real current week.
  const effectiveWeek = view === 'weekly' && weekNumber != null
    ? { weekYear, weekNumber }
    : (() => {
        const t = getTodayInfo();
        return { weekYear: t.weekYear, weekNumber: t.weekNumber };
      })();

  const backlogModalTask = backlog.taskModalId
    ? backlog.todos.find(t => t.id === backlog.taskModalId)
    : null;

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
        <TopBar year={year} monthIndex={monthIndex} weekNumber={weekNumber} view={view} />
        <TabBar
          year={year}
          monthIndex={monthIndex}
          weekNumber={weekNumber}
          weekYear={weekYear}
          view={view}
          backlogOpen={backlog.open}
          onToggleBacklog={backlog.toggleOpen}
        />
        <main className="flex-1 overflow-y-auto bg-[#f7f8fa] p-4 sm:p-7">
          {children}
        </main>
      </div>

      <BacklogDrawer
        isOpen={backlog.open}
        onClose={backlog.toggleOpen}
        todos={backlog.todos}
        weekYear={effectiveWeek.weekYear}
        weekNumber={effectiveWeek.weekNumber}
        onAdd={backlog.addTodo}
        onToggleDone={backlog.toggleDone}
        onAssignDate={backlog.assignDate}
        onDelete={backlog.deleteTodo}
        onOpenDetail={backlog.openTaskModal}
      />

      {backlogModalTask && (
        <TaskModal
          task={backlogModalTask}
          onClose={backlog.closeTaskModal}
          onUpdate={backlog.updateTodo}
        />
      )}
    </div>
  );
}

function MonthRoute({ backlog }) {
  const { monthParam } = useParams();
  const [yearStr, monthStr] = monthParam.split('-');
  const year = Number(yearStr);
  const monthIndex = Number(monthStr);

  return (
    <AppShell year={year} monthIndex={monthIndex} weekNumber={null} weekYear={null} view="monthly" backlog={backlog}>
      <MonthlyOverview year={year} monthIndex={monthIndex} />
    </AppShell>
  );
}

function WeekRoute({ backlog }) {
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
      backlog={backlog}
    >
      <WeeklyPlanner
        weekNumber={weekNumber}
        weekYear={weekYear}
        backlogTodos={backlog.todos}
        onSendToBacklog={backlog.sendToBacklog}
        onUpdateBacklogTodo={backlog.updateTodo}
        onOpenBacklogDetail={backlog.openTaskModal}
      />
    </AppShell>
  );
}

function useBacklog(user) {
  const [todos, setTodos] = useState([]);
  const [open, setOpen] = useState(false);
  const [taskModalId, setTaskModalId] = useState(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    loadBacklogTodos(user.id).then(loaded => {
      if (!cancelled) setTodos(loaded);
    });
    return () => { cancelled = true; };
  }, [user]);

  const persist = (todo) => {
    if (user) saveBacklogTodo(user.id, todo);
  };

  const updateTodo = (updated) => {
    setTodos(prev => prev.map(t => (t.id === updated.id ? updated : t)));
    persist(updated);
  };

  const toggleDone = (id) => {
    setTodos(prev => prev.map(t => {
      if (t.id !== id) return t;
      const done = !t.done;
      const next = { ...t, done, status: done ? 'done' : 'not_started' };
      persist(next);
      return next;
    }));
  };

  const assignDate = (id, dateStr) => {
    setTodos(prev => prev.map(t => {
      if (t.id !== id) return t;
      const next = { ...t, assignedDate: dateStr };
      persist(next);
      return next;
    }));
  };

  const addTodo = (text) => {
    const todo = { ...defaultBacklogTodo(), text };
    setTodos(prev => [...prev, todo]);
    persist(todo);
  };

  const deleteTodoHandler = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    if (user) deleteBacklogTodo(user.id, id);
  };

  const sendToBacklog = (weeklyTodo) => {
    const todo = {
      ...defaultBacklogTodo(),
      text: weeklyTodo.text,
      status: weeklyTodo.status,
      done: weeklyTodo.done,
      description: weeklyTodo.description,
      subtasks: weeklyTodo.subtasks,
      createdAt: weeklyTodo.createdAt || new Date().toISOString(),
    };
    setTodos(prev => [...prev, todo]);
    persist(todo);
  };

  return {
    todos,
    open,
    toggleOpen: () => setOpen(o => !o),
    taskModalId,
    openTaskModal: (id) => setTaskModalId(id),
    closeTaskModal: () => setTaskModalId(null),
    addTodo,
    toggleDone,
    assignDate,
    deleteTodo: deleteTodoHandler,
    updateTodo,
    sendToBacklog,
  };
}

function AuthGate() {
  const { user, loading } = useAuth();
  const backlog = useBacklog(user);

  useEffect(() => {
    if (user) migrateLocalStorageToSupabase(user.id);
  }, [user]);

  if (loading) return <div className="min-h-screen bg-white" />;
  if (!user) return <Login />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CurrentWeekRedirect />} />
        <Route path="/month/:monthParam" element={<MonthRoute backlog={backlog} />} />
        <Route path="/week/:weekParam" element={<WeekRoute backlog={backlog} />} />
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
