import router from '@system.router';
import {
  formatDayHeader,
  getTodayKey,
  groupEventsByDate,
  parseDateKey
} from '../../common/calendar.js';
import { loadEventsPayload, loadPreferences } from '../../common/storage.js';
import { DEFAULT_THEME_ID, getThemeById } from '../../common/theme.js';

export default {
  data: {
    theme: getThemeById(DEFAULT_THEME_ID),
    activeThemeId: DEFAULT_THEME_ID,
    activeMode: 'panel',
    isTimeline: false,
    selectedDateKey: '',
    backYear: 2026,
    backMonth: 0,
    dateTitle: '',
    summaryText: '',
    hasEvents: false,
    events: []
  },

  onInit() {
    var key = (this.dateKey && typeof this.dateKey === 'string')
      ? this.dateKey
      : getTodayKey(new Date());

    this.selectedDateKey = key;
    this.dateTitle = formatDayHeader(key);

    var parsed = parseDateKey(key);
    if (typeof this.returnYear === 'number' && typeof this.returnMonth === 'number') {
      this.backYear = this.returnYear;
      this.backMonth = this.returnMonth;
    } else if (parsed) {
      this.backYear = parsed.year;
      this.backMonth = parsed.monthIndex;
    }

    if (this.themeId && typeof this.themeId === 'string') {
      this.activeThemeId = this.themeId;
      this.theme = getThemeById(this.themeId);
    }
    if (this.dayViewModeParam && typeof this.dayViewModeParam === 'string') {
      this.activeMode = this.dayViewModeParam;
      this.isTimeline = this.dayViewModeParam === 'timeline';
    }

    var self = this;
    loadPreferences(function (prefs) {
      var resolvedThemeId = (self.themeId && typeof self.themeId === 'string') ? self.themeId : prefs.themeId;
      var resolvedMode = (self.dayViewModeParam && typeof self.dayViewModeParam === 'string') ? self.dayViewModeParam : prefs.dayViewMode;
      self.activeThemeId = resolvedThemeId;
      self.activeMode = resolvedMode;
      self.theme = getThemeById(resolvedThemeId);
      self.isTimeline = resolvedMode === 'timeline';

      loadEventsPayload(function (payload) {
        var list = (payload && payload.events) ? payload.events : [];
        var grouped = groupEventsByDate(list);
        var rawEvents = grouped[key] || [];
        var formatted = [];

        for (var i = 0; i < rawEvents.length; i++) {
          var ev = rawEvents[i];
          var timeLabel = 'Todo el día';
          var timeShort = 'Día';
          if (!ev.allDay) {
            if (ev.startTime && ev.endTime) {
              timeLabel = ev.startTime + ' - ' + ev.endTime;
              timeShort = ev.startTime;
            } else if (ev.startTime) {
              timeLabel = ev.startTime;
              timeShort = ev.startTime;
            }
          }
          formatted.push({
            id: ev.id || ('ev-' + i),
            title: ev.title || 'Sin título',
            timeLabel: timeLabel,
            timeShort: timeShort,
            calendar: ev.calendar || 'Calendario',
            color: ev.color || self.theme.accent
          });
        }

        self.events = formatted;
        self.hasEvents = formatted.length > 0;
        if (formatted.length === 0) {
          self.summaryText = 'Sin eventos';
        } else if (formatted.length === 1) {
          self.summaryText = '1 evento';
        } else {
          self.summaryText = formatted.length + ' eventos';
        }
      });
    });
  },

  toggleLayout() {
    this.isTimeline = !this.isTimeline;
  },

  goBack() {
    router.replace({
      uri: 'pages/index/index',
      params: {
        year: this.backYear,
        month: this.backMonth,
        selectedDate: this.selectedDateKey,
        themeId: this.activeThemeId,
        dayViewModeParam: this.activeMode
      }
    });
  },

  onSwipe(e) {
    if (e && e.direction === 'right') {
      this.goBack();
    }
  }
};
