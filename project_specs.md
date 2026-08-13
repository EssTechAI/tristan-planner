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
| Persistence | Supabase Postgres (`monthly_data`, `weekly_data` tables, RLS scoped to `auth.uid()`) |
| Auth | Supabase Auth, email/password, login-gated (no public sign-up) |
| Hosting | Vercel (auto-deploys from GitHub `main`) |

## Pages / Routes
| Route | View | Description |
|---|---|---|
| `/` | — | Redirects to current week |
| `/month/:year-:monthIndex` | MonthlyOverview | Monthly goals, dates, birthdays, mini-cal |
| `/week/:weekYear-:weekNumber` | WeeklyPlanner | Priorities, todos, day grid, meals, notes |

## Data Models (Supabase Postgres)

### `monthly_data` — one row per user per month
| Column | Type | Notes |
|---|---|---|
| `user_id` | uuid | FK to `auth.users`, RLS key |
| `year` | int | |
| `month_index` | int | 0-11 |
| `data` | jsonb | `{ importantDates, goals, birthdays, notes }` — same shape as v1 localStorage |
| `updated_at` | timestamptz | |

Unique on `(user_id, year, month_index)`.

### `weekly_data` — one row per user per ISO week
| Column | Type | Notes |
|---|---|---|
| `user_id` | uuid | FK to `auth.users`, RLS key |
| `week_year` | int | |
| `week_number` | int | ISO week number |
| `data` | jsonb | `{ priorities, todos, reminders, mealPlan, dayNotes, notes }` — same shape as v1 localStorage |
| `updated_at` | timestamptz | |

Unique on `(user_id, week_year, week_number)`.

Both tables: RLS enabled, single `for all` policy scoped to `auth.uid() = user_id`.

On first login after this change, any data still sitting in the browser's localStorage (old v1 keys) is auto-uploaded once via `migrateLocalStorageToSupabase`, then a flag prevents re-running it.

### Keeping the Supabase project awake
Free-tier Supabase projects auto-pause after ~7 days of no API activity. `.github/workflows/keep-alive.yml` pings the project every 3 days via GitHub Actions so it doesn't pause between visits. Requires repo secrets `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

## File Structure
```
src/
  components/   Sidebar, TopBar, TabBar, SectionCard, MiniCalendar,
                RichTextArea, DayModal, TaskModal
  views/        MonthlyOverview, WeeklyPlanner, Login
  context/      AuthContext.jsx (AuthProvider), useAuth.js (context + hook)
  lib/          supabase.js (Supabase client)
  utils/        calendarUtils.js, storage.js
  App.jsx       Router + layout shell
  main.jsx
```

## Design Tokens
- Nav: `#1a1a2e` | Surface: `#ffffff` | BG: `#f7f8fa`
- Primary (monthly): `#7c5cbf` | Secondary (weekly): `#4e9af1`
- Font: Inter

## Done Criteria (v1)
- [x] Navigate months and weeks via sidebar
- [x] All fields save on change (debounced 300ms)
- [x] Data persists on page refresh
- [x] Today's date auto-highlighted in week grid and mini calendar
- [x] Default route loads current week
- [x] Mobile: sidebar togglable via hamburger

## Done Criteria (v2 — Supabase-backed storage)
- [ ] `monthly_data` / `weekly_data` tables have correct columns, unique constraints, RLS policies
- [ ] App reads/writes planner data through Supabase instead of localStorage
- [ ] Existing localStorage data migrates to Supabase automatically on first login
- [ ] Data opened on a second device/browser shows the same content
- [ ] Vercel env vars confirmed working against the live deployment
- [ ] Keep-alive workflow pings Supabase every 3 days
- [ ] Password reset flow works end-to-end (next up)
