import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildMonthGrid,
  formatDateKey,
  formatDayHeader,
  getDaysInMonth,
  getMondayFirstWeekday,
  groupEventsByDate,
  parseDateKey,
  stepMonth
} from '../watch/entry/src/main/js/default/common/calendar.js';
import { createMockPayload } from '../watch/entry/src/main/js/default/common/mockEvents.js';
import {
  DAY_VIEW_MODES,
  DEFAULT_THEME_ID,
  THEMES,
  getThemeById,
  isValidDayViewMode
} from '../watch/entry/src/main/js/default/common/theme.js';

test('formatDateKey and parseDateKey round-trip', () => {
  const key = formatDateKey(2026, 10, 5);
  assert.equal(key, '2026-11-05');
  assert.deepEqual(parseDateKey(key), { year: 2026, monthIndex: 10, day: 5 });
  assert.equal(parseDateKey('invalid'), null);
});

test('leap year handling for February', () => {
  assert.equal(getDaysInMonth(2024, 1), 29);
  assert.equal(getDaysInMonth(2026, 1), 28);
});

test('Monday-first weekday mapping', () => {
  // 2026-11-02 es Lunes -> 0; 2026-11-01 es Domingo -> 6
  assert.equal(getMondayFirstWeekday(2026, 10, 2), 0);
  assert.equal(getMondayFirstWeekday(2026, 10, 1), 6);
});

test('stepMonth wraps across year boundaries', () => {
  assert.deepEqual(stepMonth(2026, 0, -1), { year: 2025, monthIndex: 11 });
  assert.deepEqual(stepMonth(2026, 11, 1), { year: 2027, monthIndex: 0 });
});

test('buildMonthGrid produces 6 rows for Nov 2026 (starts Sunday) and 5 rows for Feb 2026', () => {
  // Nov 2026: 1 Nov is Sunday (offset 6) + 30 days = 36 -> 42 cells (6 rows)
  const novGrid = buildMonthGrid(2026, 10, {}, '2026-11-22', '2026-11-15');
  assert.equal(novGrid.rowCount, 6);
  assert.equal(novGrid.cells.length, 42);
  assert.equal(novGrid.cellHeight, 58);
  assert.equal(novGrid.cells[0].dateKey, '2026-10-26');
  assert.equal(novGrid.cells[6].dateKey, '2026-11-01');

  const todayCell = novGrid.cells.find((c) => c.dateKey === '2026-11-22');
  assert.equal(todayCell.isToday, true);
  assert.equal(todayCell.badgeClass, 'day-badge-today');

  const selectedCell = novGrid.cells.find((c) => c.dateKey === '2026-11-15');
  assert.equal(selectedCell.isSelected, true);
  assert.equal(selectedCell.badgeClass, 'day-badge-selected');

  // Feb 2026: 1 Feb is Sunday (offset 6) + 28 days = 34 -> 35 cells (5 rows)
  const febGrid = buildMonthGrid(2026, 1, {}, '2026-02-10', '2026-02-10');
  assert.equal(febGrid.rowCount, 5);
  assert.equal(febGrid.cells.length, 35);
  assert.equal(febGrid.cellHeight, 66);

  // Compact panel mode adjusts cell heights to leave room for bottom agenda tray
  const compactNov = buildMonthGrid(2026, 10, {}, '2026-11-22', '2026-11-15', {
    compact: true,
    theme: getThemeById('light_warm')
  });
  assert.equal(compactNov.cellHeight, 40);
  assert.equal(compactNov.badgeSize, 28);
  assert.equal(compactNov.cells.find((c) => c.dateKey === '2026-11-22').badgeBg, '#C96A1B');
});

test('groupEventsByDate sorts all-day first then chronological and extracts up to 3 dots', () => {
  const events = [
    { id: '1', date: '2026-11-22', startTime: '18:00', allDay: false, color: '#FF9F0A' },
    { id: '2', date: '2026-11-22', startTime: '', allDay: true, color: '#BF5AF2' },
    { id: '3', date: '2026-11-22', startTime: '09:00', allDay: false, color: '#0A84FF' },
    { id: '4', date: '2026-11-22', startTime: '13:00', allDay: false, color: '#30D158' }
  ];
  const grouped = groupEventsByDate(events);
  assert.deepEqual(
    grouped['2026-11-22'].map((e) => e.id),
    ['2', '3', '4', '1']
  );

  const grid = buildMonthGrid(2026, 10, grouped, '2026-11-22', '2026-11-22');
  const cell = grid.cells.find((c) => c.dateKey === '2026-11-22');
  assert.equal(cell.eventCount, 4);
  assert.equal(cell.dot0, '#BF5AF2');
  assert.equal(cell.dot1, '#0A84FF');
  assert.equal(cell.dot2, '#30D158');
  assert.equal(cell.badgeClass, 'day-badge-today-selected');
});

test('createMockPayload generates valid schema and formatDayHeader formats Spanish dates', () => {
  const ref = new Date(2026, 10, 22, 10, 0, 0);
  const payload = createMockPayload(ref);
  assert.equal(payload.version, 1);
  assert.ok(payload.events.length >= 10);
  assert.equal(formatDayHeader('2026-11-22'), 'Dom 22 Nov');
});

test('theme palettes and day view mode validation', () => {
  assert.ok(THEMES.length >= 6);
  assert.equal(getThemeById('unknown').id, DEFAULT_THEME_ID);
  assert.equal(getThemeById('light_mint').bg, '#EEF7F2');
  assert.equal(DAY_VIEW_MODES.length, 3);
  assert.equal(isValidDayViewMode('panel'), true);
  assert.equal(isValidDayViewMode('cards'), true);
  assert.equal(isValidDayViewMode('timeline'), true);
  assert.equal(isValidDayViewMode('invalid'), false);
});
