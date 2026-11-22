// Paletas de temas (tonalidades claras principales + modo AMOLED oscuro)
// y modos de vista al seleccionar un día.
// Compatible con HarmonyOS Lite Wearable (sin variables CSS nativas).

export var DEFAULT_THEME_ID = 'light_white';
export var DEFAULT_DAY_VIEW_MODE = 'panel';

export var THEMES = [
  {
    id: 'light_white',
    name: 'Blanco',
    bg: '#FFFFFF',
    surface: '#F2F4F7',
    cardBg: '#F4F5F7',
    border: '#E2E5EA',
    textPrimary: '#111827',
    textSecondary: '#4B5563',
    textMuted: '#B0B7C3',
    weekendText: '#5B6B82',
    accent: '#0A84FF',
    todayBg: '#0A84FF',
    todayText: '#FFFFFF',
    selectedBg: '#E6F1FF',
    selectedBorder: '#0A84FF',
    selectedText: '#0A84FF'
  },
  {
    id: 'light_warm',
    name: 'Crema',
    bg: '#F7F3EA',
    surface: '#EFE8D8',
    cardBg: '#EFE9DC',
    border: '#DFD6C3',
    textPrimary: '#1F1B16',
    textSecondary: '#665D50',
    textMuted: '#B8AFA0',
    weekendText: '#7A6752',
    accent: '#C96A1B',
    todayBg: '#C96A1B',
    todayText: '#FFFFFF',
    selectedBg: '#F2DFC8',
    selectedBorder: '#C96A1B',
    selectedText: '#8F460A'
  },
  {
    id: 'light_sky',
    name: 'Cielo',
    bg: '#EEF4FA',
    surface: '#E1ECF7',
    cardBg: '#E3EDF8',
    border: '#C9DCEF',
    textPrimary: '#0F1F33',
    textSecondary: '#4A627D',
    textMuted: '#A1B4C9',
    weekendText: '#3B6598',
    accent: '#0070E0',
    todayBg: '#0070E0',
    todayText: '#FFFFFF',
    selectedBg: '#D2E5FA',
    selectedBorder: '#0070E0',
    selectedText: '#0055AD'
  },
  {
    id: 'light_mint',
    name: 'Menta',
    bg: '#EEF7F2',
    surface: '#DFEFE6',
    cardBg: '#E1F0E7',
    border: '#C6E2D2',
    textPrimary: '#10241A',
    textSecondary: '#456655',
    textMuted: '#9FB9AB',
    weekendText: '#357355',
    accent: '#158F56',
    todayBg: '#158F56',
    todayText: '#FFFFFF',
    selectedBg: '#CEEBD9',
    selectedBorder: '#158F56',
    selectedText: '#0E6B3F'
  },
  {
    id: 'light_lavender',
    name: 'Lavanda',
    bg: '#F4F0FA',
    surface: '#E8E0F4',
    cardBg: '#EAE3F5',
    border: '#D5C8EB',
    textPrimary: '#1D152B',
    textSecondary: '#5D4E75',
    textMuted: '#AEA2C2',
    weekendText: '#6F50A3',
    accent: '#7C3AED',
    todayBg: '#7C3AED',
    todayText: '#FFFFFF',
    selectedBg: '#DFD2F8',
    selectedBorder: '#7C3AED',
    selectedText: '#5B21B6'
  },
  {
    id: 'dark_amoled',
    name: 'AMOLED',
    bg: '#000000',
    surface: '#161618',
    cardBg: '#161618',
    border: '#2C2C2E',
    textPrimary: '#FFFFFF',
    textSecondary: '#AEAEB2',
    textMuted: '#48484A',
    weekendText: '#8DA2C0',
    accent: '#0A84FF',
    todayBg: '#0A84FF',
    todayText: '#FFFFFF',
    selectedBg: '#1C1C1E',
    selectedBorder: '#FFFFFF',
    selectedText: '#FFFFFF'
  }
];

export var DAY_VIEW_MODES = [
  {
    id: 'panel',
    name: 'Panel inferior',
    desc: 'Agenda debajo de la grilla'
  },
  {
    id: 'cards',
    name: 'Tarjetas',
    desc: 'Pantalla completa detallada'
  },
  {
    id: 'timeline',
    name: 'Cronología',
    desc: 'Lista compacta por hora'
  }
];

export function getThemeById(themeId) {
  for (var i = 0; i < THEMES.length; i++) {
    if (THEMES[i].id === themeId) {
      return THEMES[i];
    }
  }
  return THEMES[0];
}

export function isValidDayViewMode(modeId) {
  for (var i = 0; i < DAY_VIEW_MODES.length; i++) {
    if (DAY_VIEW_MODES[i].id === modeId) {
      return true;
    }
  }
  return false;
}
