// Utilidades puras de calendario para HarmonyOS Lite Wearable (compatible con JerryScript ES5/ES6 básico)

export var WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export var MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];

export var MONTH_SHORT_NAMES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic'
];

export var WEEKDAY_SHORT_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function pad2(n) {
  return n < 10 ? '0' + n : '' + n;
}

export function formatDateKey(year, monthIndex, day) {
  return year + '-' + pad2(monthIndex + 1) + '-' + pad2(day);
}

export function parseDateKey(dateKey) {
  if (!dateKey || typeof dateKey !== 'string') {
    return null;
  }
  var parts = dateKey.split('-');
  if (parts.length !== 3) {
    return null;
  }
  var year = parseInt(parts[0], 10);
  var monthIndex = parseInt(parts[1], 10) - 1;
  var day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(monthIndex) || isNaN(day)) {
    return null;
  }
  return {
    year: year,
    monthIndex: monthIndex,
    day: day
  };
}

export function getTodayKey(nowDate) {
  var d = nowDate || new Date();
  return formatDateKey(d.getFullYear(), d.getMonth(), d.getDate());
}

export function getDaysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

// Convierte Date.getDay() (0=Dom..6=Sab) a índice Lunes=0..Domingo=6
export function getMondayFirstWeekday(year, monthIndex, day) {
  var jsDay = new Date(year, monthIndex, day).getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function getMonthTitle(year, monthIndex) {
  return MONTH_NAMES[monthIndex] + ' ' + year;
}

export function formatDayHeader(dateKey) {
  var parsed = parseDateKey(dateKey);
  if (!parsed) {
    return '';
  }
  var d = new Date(parsed.year, parsed.monthIndex, parsed.day);
  var weekday = WEEKDAY_SHORT_NAMES[d.getDay()];
  var monthShort = MONTH_SHORT_NAMES[parsed.monthIndex];
  return weekday + ' ' + parsed.day + ' ' + monthShort;
}

// Agrupa eventos por clave YYYY-MM-DD y los ordena (todo el día primero, luego por hora)
export function groupEventsByDate(events) {
  var map = {};
  if (!events || !events.length) {
    return map;
  }
  for (var i = 0; i < events.length; i++) {
    var ev = events[i];
    if (!ev || !ev.date) {
      continue;
    }
    if (!map[ev.date]) {
      map[ev.date] = [];
    }
    map[ev.date].push(ev);
  }

  var keys = Object.keys(map);
  for (var k = 0; k < keys.length; k++) {
    map[keys[k]].sort(compareEvents);
  }
  return map;
}

function compareEvents(a, b) {
  if (a.allDay && !b.allDay) {
    return -1;
  }
  if (!a.allDay && b.allDay) {
    return 1;
  }
  var sa = a.startTime || '99:99';
  var sb = b.startTime || '99:99';
  if (sa < sb) {
    return -1;
  }
  if (sa > sb) {
    return 1;
  }
  return 0;
}

// Extrae hasta 3 colores de puntos para la celda del día
function extractDots(dayEvents) {
  var dots = [];
  if (!dayEvents || !dayEvents.length) {
    return dots;
  }
  for (var i = 0; i < dayEvents.length && dots.length < 3; i++) {
    var color = dayEvents[i].color || '#0A84FF';
    dots.push(color);
  }
  return dots;
}

export function stepMonth(year, monthIndex, delta) {
  var total = year * 12 + monthIndex + delta;
  var nextYear = Math.floor(total / 12);
  var nextMonth = total - nextYear * 12;
  return {
    year: nextYear,
    monthIndex: nextMonth
  };
}

/**
 * Construye la grilla mensual plana (35 o 42 celdas) comenzando en Lunes.
 * Cada celda precalcula colores de tema y hasta 3 puntos de color (dot0, dot1, dot2)
 * para evitar bucles anidados y variables CSS no soportadas en HarmonyOS Lite Wearable.
 */
export function buildMonthGrid(year, monthIndex, eventsByDate, todayKey, selectedKey, options) {
  var opts = options || {};
  var compact = !!opts.compact;
  var theme = opts.theme || {
    bg: '#FFFFFF',
    textPrimary: '#111827',
    textMuted: '#B0B7C3',
    weekendText: '#5B6B82',
    todayBg: '#0A84FF',
    todayText: '#FFFFFF',
    selectedBg: '#E6F1FF',
    selectedBorder: '#0A84FF',
    selectedText: '#0A84FF'
  };

  var firstWeekday = getMondayFirstWeekday(year, monthIndex, 1);
  var daysInCurrent = getDaysInMonth(year, monthIndex);

  var prev = stepMonth(year, monthIndex, -1);
  var daysInPrev = getDaysInMonth(prev.year, prev.monthIndex);

  var next = stepMonth(year, monthIndex, 1);

  var totalNeeded = firstWeekday + daysInCurrent;
  var totalCells = totalNeeded <= 35 ? 35 : 42;
  var rowCount = totalCells / 7;

  var cellHeight;
  if (compact) {
    cellHeight = rowCount === 5 ? 46 : 40;
  } else {
    cellHeight = rowCount === 5 ? 66 : 58;
  }

  var badgeSize = compact ? 28 : 38;
  var badgeRadius = compact ? 14 : 19;
  var cells = [];

  for (var i = 0; i < totalCells; i++) {
    var cellYear;
    var cellMonth;
    var cellDay;
    var isCurrentMonth;

    if (i < firstWeekday) {
      cellYear = prev.year;
      cellMonth = prev.monthIndex;
      cellDay = daysInPrev - firstWeekday + 1 + i;
      isCurrentMonth = false;
    } else if (i < firstWeekday + daysInCurrent) {
      cellYear = year;
      cellMonth = monthIndex;
      cellDay = i - firstWeekday + 1;
      isCurrentMonth = true;
    } else {
      cellYear = next.year;
      cellMonth = next.monthIndex;
      cellDay = i - firstWeekday - daysInCurrent + 1;
      isCurrentMonth = false;
    }

    var dateKey = formatDateKey(cellYear, cellMonth, cellDay);
    var colIndex = i % 7;
    var isWeekend = colIndex >= 5;
    var isToday = dateKey === todayKey;
    var isSelected = dateKey === selectedKey;

    var dayEvents = (eventsByDate && eventsByDate[dateKey]) ? eventsByDate[dateKey] : [];
    var dots = extractDots(dayEvents);

    var badgeClass = 'day-badge';
    var badgeBg = theme.bg;
    var badgeBorderColor = theme.bg;
    var badgeBorderWidth = 0;

    if (isToday && isSelected) {
      badgeClass = 'day-badge-today-selected';
      badgeBg = theme.todayBg;
      badgeBorderColor = theme.textPrimary;
      badgeBorderWidth = 2;
    } else if (isToday) {
      badgeClass = 'day-badge-today';
      badgeBg = theme.todayBg;
    } else if (isSelected) {
      badgeClass = 'day-badge-selected';
      badgeBg = theme.selectedBg;
      badgeBorderColor = theme.selectedBorder;
      badgeBorderWidth = 2;
    }

    var numClass = 'day-num';
    var numColor = theme.textPrimary;
    if (isToday) {
      numClass = 'day-num-today';
      numColor = theme.todayText;
    } else if (isSelected) {
      numClass = 'day-num-selected';
      numColor = theme.selectedText;
    } else if (!isCurrentMonth) {
      numClass = 'day-num-muted';
      numColor = theme.textMuted;
    } else if (isWeekend) {
      numClass = 'day-num-weekend';
      numColor = theme.weekendText;
    }

    cells.push({
      dateKey: dateKey,
      day: '' + cellDay,
      year: cellYear,
      monthIndex: cellMonth,
      isCurrentMonth: isCurrentMonth,
      isWeekend: isWeekend,
      isToday: isToday,
      isSelected: isSelected,
      badgeClass: badgeClass,
      badgeBg: badgeBg,
      badgeBorderColor: badgeBorderColor,
      badgeBorderWidth: badgeBorderWidth,
      numClass: numClass,
      numColor: numColor,
      eventCount: dayEvents.length,
      dot0: dots.length > 0 ? dots[0] : '',
      dot1: dots.length > 1 ? dots[1] : '',
      dot2: dots.length > 2 ? dots[2] : ''
    });
  }

  return {
    year: year,
    monthIndex: monthIndex,
    title: getMonthTitle(year, monthIndex),
    rowCount: rowCount,
    cellHeight: cellHeight,
    badgeSize: badgeSize,
    badgeRadius: badgeRadius,
    cells: cells
  };
}
