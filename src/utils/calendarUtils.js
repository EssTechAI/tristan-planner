const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getISOWeekData(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return { week, year: d.getUTCFullYear() };
}

function getMondayOf(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
}

export function getMonthsForYear(year) {
  return MONTH_NAMES.map((name, index) => ({ name, index, year }));
}

export function getWeeksForMonth(year, monthIndex) {
  const weeks = [];
  const firstOfMonth = new Date(year, monthIndex, 1);
  const lastOfMonth = new Date(year, monthIndex + 1, 0);
  let monday = getMondayOf(firstOfMonth);

  while (monday <= lastOfMonth) {
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const { week: weekNumber, year: weekYear } = getISOWeekData(monday);
    weeks.push({
      label: `${SHORT_MONTHS[monday.getMonth()]} ${monday.getDate()} – ${SHORT_MONTHS[sunday.getMonth()]} ${sunday.getDate()}`,
      weekNumber,
      weekYear,
      startDate: new Date(monday),
      endDate: new Date(sunday),
    });
    monday = new Date(monday);
    monday.setDate(monday.getDate() + 7);
  }
  return weeks;
}

export function getDatesForWeek(weekNumber, year) {
  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() || 7;
  const week1Monday = new Date(jan4);
  week1Monday.setDate(jan4.getDate() - (jan4Day - 1));
  week1Monday.setHours(0, 0, 0, 0);
  const monday = new Date(week1Monday);
  monday.setDate(week1Monday.getDate() + (weekNumber - 1) * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function getMiniCalendarGrid(year, monthIndex) {
  const firstDay = new Date(year, monthIndex, 1);
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  let startOffset = firstDay.getDay();
  startOffset = startOffset === 0 ? 6 : startOffset - 1;
  const cells = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length < 42) cells.push(null);
  return cells;
}

export function getTodayInfo() {
  const today = new Date();
  const { week: weekNumber, year: weekYear } = getISOWeekData(today);
  return {
    year: today.getFullYear(),
    monthIndex: today.getMonth(),
    date: today.getDate(),
    weekNumber,
    weekYear,
  };
}

export function formatDate(date) {
  return `${SHORT_MONTHS[date.getMonth()]} ${date.getDate()}`;
}
