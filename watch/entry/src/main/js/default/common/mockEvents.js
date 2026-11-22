// Contrato JSON de sincronización iPhone (EventKit + Wear Engine) -> Huawei Watch Fit 3
// Genera eventos mockeados relativos al mes actual para que el prototipo siempre
// muestre datos realistas al abrirse en el simulador de DevEco Studio.

import { formatDateKey, getDaysInMonth, stepMonth } from './calendar.js';

export function createMockPayload(baseDate) {
  var ref = baseDate || new Date();
  var y = ref.getFullYear();
  var m = ref.getMonth();
  var today = ref.getDate();
  var maxDay = getDaysInMonth(y, m);

  function safeDay(d) {
    if (d < 1) {
      return 1;
    }
    if (d > maxDay) {
      return maxDay;
    }
    return d;
  }

  var nextMonth = stepMonth(y, m, 1);
  var prevMonth = stepMonth(y, m, -1);

  var todayKey = formatDateKey(y, m, today);
  var tomorrowKey = formatDateKey(y, m, safeDay(today + 1));
  var day3 = formatDateKey(y, m, 3);
  var day7 = formatDateKey(y, m, 7);
  var day12 = formatDateKey(y, m, 12);
  var day15 = formatDateKey(y, m, 15);
  var day19 = formatDateKey(y, m, 19);
  var day25 = formatDateKey(y, m, safeDay(25));
  var nextMonthDay2 = formatDateKey(nextMonth.year, nextMonth.monthIndex, 2);
  var prevMonthDay28 = formatDateKey(prevMonth.year, prevMonth.monthIndex, 28);

  return {
    version: 1,
    syncedAt: ref.toISOString ? ref.toISOString() : '',
    events: [
      {
        id: 'evt-today-1',
        title: 'Daily Standup',
        date: todayKey,
        startTime: '09:30',
        endTime: '10:00',
        allDay: false,
        calendar: 'Trabajo',
        color: '#0A84FF'
      },
      {
        id: 'evt-today-2',
        title: 'Almuerzo con equipo',
        date: todayKey,
        startTime: '13:00',
        endTime: '14:00',
        allDay: false,
        calendar: 'Personal',
        color: '#30D158'
      },
      {
        id: 'evt-today-3',
        title: 'Entrenamiento 5K',
        date: todayKey,
        startTime: '18:30',
        endTime: '19:30',
        allDay: false,
        calendar: 'Salud',
        color: '#FF9F0A'
      },
      {
        id: 'evt-tom-1',
        title: 'Revisión arquitectura iOS',
        date: tomorrowKey,
        startTime: '11:00',
        endTime: '12:00',
        allDay: false,
        calendar: 'Trabajo',
        color: '#0A84FF'
      },
      {
        id: 'evt-d3-1',
        title: 'Pago servicios',
        date: day3,
        startTime: '',
        endTime: '',
        allDay: true,
        calendar: 'Personal',
        color: '#30D158'
      },
      {
        id: 'evt-d7-1',
        title: 'Dentista',
        date: day7,
        startTime: '16:00',
        endTime: '17:00',
        allDay: false,
        calendar: 'Salud',
        color: '#FF9F0A'
      },
      {
        id: 'evt-d7-2',
        title: 'Cena familiar',
        date: day7,
        startTime: '20:30',
        endTime: '22:00',
        allDay: false,
        calendar: 'Familia',
        color: '#BF5AF2'
      },
      {
        id: 'evt-d12-1',
        title: 'Sprint Planning',
        date: day12,
        startTime: '10:00',
        endTime: '11:30',
        allDay: false,
        calendar: 'Trabajo',
        color: '#0A84FF'
      },
      {
        id: 'evt-d15-1',
        title: 'Feriado / Día libre',
        date: day15,
        startTime: '',
        endTime: '',
        allDay: true,
        calendar: 'Familia',
        color: '#BF5AF2'
      },
      {
        id: 'evt-d15-2',
        title: 'Asado cumpleaños',
        date: day15,
        startTime: '14:00',
        endTime: '18:00',
        allDay: false,
        calendar: 'Personal',
        color: '#30D158'
      },
      {
        id: 'evt-d19-1',
        title: 'Demo Watch Fit 3',
        date: day19,
        startTime: '15:00',
        endTime: '16:00',
        allDay: false,
        calendar: 'Trabajo',
        color: '#0A84FF'
      },
      {
        id: 'evt-d25-1',
        title: 'Control médico',
        date: day25,
        startTime: '08:30',
        endTime: '09:15',
        allDay: false,
        calendar: 'Salud',
        color: '#FF9F0A'
      },
      {
        id: 'evt-next-1',
        title: 'Cierre mensual',
        date: nextMonthDay2,
        startTime: '09:00',
        endTime: '10:30',
        allDay: false,
        calendar: 'Trabajo',
        color: '#0A84FF'
      },
      {
        id: 'evt-prev-1',
        title: 'Retrospectiva',
        date: prevMonthDay28,
        startTime: '17:00',
        endTime: '18:00',
        allDay: false,
        calendar: 'Trabajo',
        color: '#0A84FF'
      }
    ]
  };
}
