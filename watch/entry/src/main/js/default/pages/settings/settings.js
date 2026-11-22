import router from '@system.router';
import { loadPreferences, savePreferences } from '../../common/storage.js';
import {
  DAY_VIEW_MODES,
  DEFAULT_DAY_VIEW_MODE,
  DEFAULT_THEME_ID,
  THEMES,
  getThemeById
} from '../../common/theme.js';

export default {
  data: {
    themes: THEMES,
    dayModes: DAY_VIEW_MODES,
    activeThemeId: DEFAULT_THEME_ID,
    activeModeId: DEFAULT_DAY_VIEW_MODE,
    theme: getThemeById(DEFAULT_THEME_ID),
    backYear: 2026,
    backMonth: 0,
    backSelectedDate: ''
  },

  onInit() {
    if (typeof this.returnYear === 'number') {
      this.backYear = this.returnYear;
    }
    if (typeof this.returnMonth === 'number') {
      this.backMonth = this.returnMonth;
    }
    if (this.selectedDate && typeof this.selectedDate === 'string') {
      this.backSelectedDate = this.selectedDate;
    }

    var self = this;
    loadPreferences(function (prefs) {
      self.activeThemeId = prefs.themeId;
      self.activeModeId = prefs.dayViewMode;
      self.theme = getThemeById(prefs.themeId);
    });
  },

  selectTheme(themeId) {
    this.activeThemeId = themeId;
    this.theme = getThemeById(themeId);
    savePreferences({
      themeId: this.activeThemeId,
      dayViewMode: this.activeModeId
    });
  },

  selectDayMode(modeId) {
    this.activeModeId = modeId;
    savePreferences({
      themeId: this.activeThemeId,
      dayViewMode: this.activeModeId
    });
  },

  goBack() {
    router.replace({
      uri: 'pages/index/index',
      params: {
        year: this.backYear,
        month: this.backMonth,
        selectedDate: this.backSelectedDate
      }
    });
  },

  onSwipe(e) {
    if (e && e.direction === 'right') {
      this.goBack();
    }
  }
};
