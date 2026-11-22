// Capa de caché offline sobre @system.storage para HarmonyOS Lite Wearable.
// Mantiene además una caché en memoria para garantizar cambios instantáneos
// entre páginas tanto en el Previewer como en el reloj físico.

import storage from '@system.storage';
import { createMockPayload } from './mockEvents.js';
import {
  DEFAULT_DAY_VIEW_MODE,
  DEFAULT_THEME_ID,
  getThemeById,
  isValidDayViewMode
} from './theme.js';

var EVENTS_STORAGE_KEY = 'kalendar_events_v1';
var PREFS_STORAGE_KEY = 'kalendar_prefs_v1';

var memoryPayload = null;
var memoryPayloadSource = 'mock';
var memoryPrefs = null;

export function loadEventsPayload(callback) {
  if (memoryPayload) {
    callback(memoryPayload, memoryPayloadSource);
    return;
  }

  try {
    storage.get({
      key: EVENTS_STORAGE_KEY,
      default: '',
      success: function (raw) {
        if (raw && raw.length > 0) {
          try {
            var parsed = JSON.parse(raw);
            if (parsed && parsed.events && parsed.events.length >= 0) {
              memoryPayload = parsed;
              memoryPayloadSource = parsed.source === 'iphone' ? 'storage' : 'mock';
              callback(parsed, memoryPayloadSource);
              return;
            }
          } catch (e) {
            console.warn('Kalendar storage JSON inválido, usando mock');
          }
        }
        var mockPayload = createMockPayload(new Date());
        memoryPayload = mockPayload;
        memoryPayloadSource = 'mock';
        saveEventsPayload(mockPayload, function () {
          callback(mockPayload, 'mock');
        });
      },
      fail: function () {
        var mockPayload = createMockPayload(new Date());
        memoryPayload = mockPayload;
        memoryPayloadSource = 'mock';
        callback(mockPayload, 'mock');
      }
    });
  } catch (err) {
    var mockPayload = createMockPayload(new Date());
    memoryPayload = mockPayload;
    memoryPayloadSource = 'mock';
    callback(mockPayload, 'mock');
  }
}

export function saveEventsPayload(payload, onDone) {
  memoryPayload = payload;
  memoryPayloadSource = (payload && payload.source === 'iphone') ? 'storage' : 'mock';
  try {
    storage.set({
      key: EVENTS_STORAGE_KEY,
      value: JSON.stringify(payload),
      success: function () {
        if (onDone) {
          onDone(true);
        }
      },
      fail: function () {
        if (onDone) {
          onDone(false);
        }
      }
    });
  } catch (err) {
    if (onDone) {
      onDone(false);
    }
  }
}

export function loadPreferences(callback) {
  if (memoryPrefs) {
    callback({
      themeId: memoryPrefs.themeId,
      dayViewMode: memoryPrefs.dayViewMode
    });
    return;
  }

  var defaults = {
    themeId: DEFAULT_THEME_ID,
    dayViewMode: DEFAULT_DAY_VIEW_MODE
  };

  try {
    storage.get({
      key: PREFS_STORAGE_KEY,
      default: '',
      success: function (raw) {
        if (raw && raw.length > 0) {
          try {
            var parsed = JSON.parse(raw);
            var theme = getThemeById(parsed && parsed.themeId ? parsed.themeId : DEFAULT_THEME_ID);
            var mode = (parsed && isValidDayViewMode(parsed.dayViewMode))
              ? parsed.dayViewMode
              : DEFAULT_DAY_VIEW_MODE;
            memoryPrefs = {
              themeId: theme.id,
              dayViewMode: mode
            };
            callback(memoryPrefs);
            return;
          } catch (e) {
            console.warn('Kalendar prefs inválidas, usando defaults');
          }
        }
        memoryPrefs = defaults;
        callback(defaults);
      },
      fail: function () {
        memoryPrefs = defaults;
        callback(defaults);
      }
    });
  } catch (err) {
    memoryPrefs = defaults;
    callback(defaults);
  }
}

export function savePreferences(prefs, onDone) {
  var safe = {
    themeId: getThemeById(prefs && prefs.themeId ? prefs.themeId : DEFAULT_THEME_ID).id,
    dayViewMode: (prefs && isValidDayViewMode(prefs.dayViewMode))
      ? prefs.dayViewMode
      : DEFAULT_DAY_VIEW_MODE
  };

  memoryPrefs = safe;

  try {
    storage.set({
      key: PREFS_STORAGE_KEY,
      value: JSON.stringify(safe),
      success: function () {
        if (onDone) {
          onDone(true);
        }
      },
      fail: function () {
        if (onDone) {
          onDone(false);
        }
      }
    });
  } catch (err) {
    if (onDone) {
      onDone(false);
    }
  }
}
