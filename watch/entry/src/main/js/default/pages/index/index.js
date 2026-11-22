import router from '@system.router';
import {
  WEEKDAY_LABELS,
  buildMonthGrid,
  formatDayHeader,
  getTodayKey,
  groupEventsByDate,
  stepMonth
} from '../../common/calendar.js';
import { loadEventsPayload, loadPreferences } from '../../common/storage.js';
import { startWearEngineListener, stopWearEngineListener } from '../../common/sync.js';
import { DEFAULT_DAY_VIEW_MODE, DEFAULT_THEME_ID, getThemeById } from '../../common/theme.js';

export default {
  data: {
    weekdays: WEEKDAY_LABELS,
    theme: getThemeById(DEFAULT_THEME_ID),
    dayViewMode: DEFAULT_DAY_VIEW_MODE,
    isPanelMode: true,
    currentYear: 2026,
    currentMonth: 0,
    monthTitle: '',
    headerHeight: 54,
    headerPadTop: 8,
    weekdayHeight: 24,
    dayNumSize: 17,
    gridHeight: 240,
    cellHeight: 40,
    badgeSize: 28,
    badgeRadius: 14,
    todayKey: '',
    selectedKey: '',
    selectedDayTitle: '',
    selectedDaySummary: '',
    selectedPreviewEvents: [],
    cells: [],
    eventsByDate: {}
  },

  onInit() {
    var now = new Date();
    this.todayKey = getTodayKey(now);

    if (typeof this.year === 'number' && typeof this.month === 'number') {
      this.currentYear = this.year;
      this.currentMonth = this.month;
    } else {
      this.currentYear = now.getFullYear();
      this.currentMonth = now.getMonth();
    }

    if (this.selectedDate && typeof this.selectedDate === 'string') {
      this.selectedKey = this.selectedDate;
    } else {
      this.selectedKey = this.todayKey;
    }

    var self = this;
    loadPreferences(function (prefs) {
      self.theme = getThemeById(prefs.themeId);
      self.dayViewMode = prefs.dayViewMode;
      self.isPanelMode = prefs.dayViewMode === 'panel';
      self.headerHeight = self.isPanelMode ? 54 : 66;
      self.headerPadTop = self.isPanelMode ? 8 : 12;
      self.weekdayHeight = self.isPanelMode ? 24 : 30;
      self.dayNumSize = self.isPanelMode ? 17 : 21;

      loadEventsPayload(function (payload) {
        var list = (payload && payload.events) ? payload.events : [];
        self.eventsByDate = groupEventsByDate(list);
        self.renderMonth();
      });
    });

    startWearEngineListener({
      onSynced: function (payload) {
        var list = (payload && payload.events) ? payload.events : [];
        self.eventsByDate = groupEventsByDate(list);
        self.renderMonth();
      }
    });
  },

  onDestroy() {
    stopWearEngineListener();
  },

  renderMonth() {
    var grid = buildMonthGrid(
      this.currentYear,
      this.currentMonth,
      this.eventsByDate,
      this.todayKey,
      this.selectedKey,
      {
        compact: this.isPanelMode,
        theme: this.theme
      }
    );
    this.monthTitle = grid.title;
    this.cellHeight = grid.cellHeight;
    this.gridHeight = grid.rowCount * grid.cellHeight;
    this.badgeSize = grid.badgeSize;
    this.badgeRadius = grid.badgeRadius;
    this.cells = grid.cells;

    if (this.isPanelMode) {
      this.updateSelectedPanel();
    }
  },

  updateSelectedPanel() {
    this.selectedDayTitle = formatDayHeader(this.selectedKey);
    var dayEvents = this.eventsByDate[this.selectedKey] || [];
    var preview = [];
    var limit = dayEvents.length < 3 ? dayEvents.length : 3;

    for (var i = 0; i < limit; i++) {
      var ev = dayEvents[i];
      preview.push({
        title: ev.title || 'Sin título',
        timeShort: ev.allDay ? 'Día' : (ev.startTime || '--:--'),
        color: ev.color || this.theme.accent
      });
    }

    this.selectedPreviewEvents = preview;
    if (dayEvents.length === 0) {
      this.selectedDaySummary = 'Libre';
    } else if (dayEvents.length === 1) {
      this.selectedDaySummary = '1 evento';
    } else {
      this.selectedDaySummary = dayEvents.length + ' eventos';
    }
  },

  prevMonth() {
    var target = stepMonth(this.currentYear, this.currentMonth, -1);
    this.currentYear = target.year;
    this.currentMonth = target.monthIndex;
    this.renderMonth();
  },

  nextMonth() {
    var target = stepMonth(this.currentYear, this.currentMonth, 1);
    this.currentYear = target.year;
    this.currentMonth = target.monthIndex;
    this.renderMonth();
  },

  goToday() {
    var now = new Date();
    this.todayKey = getTodayKey(now);
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth();
    this.selectedKey = this.todayKey;
    this.renderMonth();
  },

  onDayClick(cell) {
    if (!cell || !cell.dateKey) {
      return;
    }

    if (this.isPanelMode) {
      // En modo panel: el primer toque actualiza la agenda inferior;
      // tocar nuevamente el mismo día ya seleccionado abre el detalle completo.
      if (this.selectedKey === cell.dateKey) {
        this.openSelectedDayDetail();
        return;
      }
      this.selectedKey = cell.dateKey;
      this.currentYear = cell.year;
      this.currentMonth = cell.monthIndex;
      this.renderMonth();
      return;
    }

    this.selectedKey = cell.dateKey;
    router.replace({
      uri: 'pages/day/day',
      params: {
        dateKey: cell.dateKey,
        returnYear: cell.year,
        returnMonth: cell.monthIndex
      }
    });
  },

  openSelectedDayDetail() {
    router.replace({
      uri: 'pages/day/day',
      params: {
        dateKey: this.selectedKey,
        returnYear: this.currentYear,
        returnMonth: this.currentMonth
      }
    });
  },

  openSettings() {
    router.replace({
      uri: 'pages/settings/settings',
      params: {
        returnYear: this.currentYear,
        returnMonth: this.currentMonth,
        selectedDate: this.selectedKey
      }
    });
  },

  onSwipe(e) {
    if (!e) {
      return;
    }
    if (e.direction === 'left') {
      this.nextMonth();
    } else if (e.direction === 'right') {
      this.prevMonth();
    }
  }
};
