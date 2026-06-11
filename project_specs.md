# tristan-planner — Project Spec

## What It Does
Personal planning web app that digitizes a physical spiral-bound weekly planner.
Two views: Monthly Overview and Weekly Planner. All data local-only (localStorage).

## Who Uses It
Trist — personal productivity tool.

## Tech Stack
| Concern | Choice |
|---|---|
| Framework | React 18 + Vite |
| Language | JavaScript (JSX) |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| State | React useState + useEffect |
| Persistence | localStorage (Supabase later) |
| Auth | None (v1) |
| Hosting | TBD |

## Pages / Routes
| Route | View | Description |
|---|---|---|
| `/` | — | Redirects to current week |
| `/month/:year-:monthIndex` | MonthlyOverview | Monthly goals, dates, birthdays, mini-cal |
| `/week/:weekYear-:weekNumber` | WeeklyPlanner | Priorities, todos, day grid, meals, notes |

## Data Models (localStorage)

### Monthly — key: `month_{year}_{monthIndex}`
```json
{
  "importantDates": ["", "", "", "", "", ""],
  "goals": [{ "text": "", "done": false }, ...],
  "birthdays": ["", "", ""],
  "notes": ""
}
```

### Weekly — key: `week_{weekYear}_{weekNumber}`
```json
{
  "priorities": ["", "", ""],
  "todos": [{ "id": "uuid", "text": "", "done": false }],
  "reminders": ["", "", "", ""],
  "mealPlan": { "MON": "", ... },
  "dayNotes": { "MON": "", ... },
  "notes": ""
}
```

## File Structure
```
src/
  components/   Sidebar, TopBar, TabBar, SectionCard, LineInput, MiniCalendar
  views/        MonthlyOverview, WeeklyPlanner
  utils/        calendarUtils.js, storage.js
  App.jsx       Router + layout shell
  main.jsx
```

## Design Tokens
- Nav: `#1a1a2e` | Surface: `#ffffff` | BG: `#f7f8fa`
- Primary (monthly): `#7c5cbf` | Secondary (weekly): `#4e9af1`
- Font: Inter

## Done Criteria (v1)
- [ ] Navigate months and weeks via sidebar
- [ ] All fields save to localStorage on change (debounced 300ms)
- [ ] Data persists on page refresh
- [ ] Today's date auto-highlighted in week grid and mini calendar
- [ ] Default route loads current week
- [ ] Mobile: sidebar togglable via hamburger
