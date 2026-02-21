export type AppColorPalette = {
  appBackground: string;
  loadTrack: string;
  loadFill: string;
  overlayBackdrop: number;
  panelTitle: number;
  panelText: number;
  panelBase: number;
  panelShadow: number;
  playerBlueBackground: number;
  playerRedBackground: number;
  turnBlue: number;
  turnRed: number;
  sliderFill: number;
  cardBase: number;
};

export const AppThemes = {
  classicCandy: {
    appBackground: "#1e1e1e",
    loadTrack: "#3d3d3d",
    loadFill: "#e72264",
    overlayBackdrop: 0x000000,
    panelTitle: 0xec1561,
    panelText: 0x4a4a4a,
    panelBase: 0xffffff,
    panelShadow: 0xa0a0a0,
    playerBlueBackground: 0x7fb7d6,
    playerRedBackground: 0xf2a07b,
    turnBlue: 0x3b82f6,
    turnRed: 0xef4444,
    sliderFill: 0xef6294,
    cardBase: 0xed427c,
  },
  neonArena: {
    appBackground: "#0a0d1f",
    loadTrack: "#1d2547",
    loadFill: "#2ef2ff",
    overlayBackdrop: 0x02040b,
    panelTitle: 0x2ef2ff,
    panelText: 0x263054,
    panelBase: 0xf6fbff,
    panelShadow: 0x5f72b4,
    playerBlueBackground: 0x3f6bff,
    playerRedBackground: 0xff5d8f,
    turnBlue: 0x2d9cff,
    turnRed: 0xff3f6f,
    sliderFill: 0x8f63ff,
    cardBase: 0x5b4dff,
  },
  sunsetTurbo: {
    appBackground: "#231326",
    loadTrack: "#4a2850",
    loadFill: "#ffb347",
    overlayBackdrop: 0x100814,
    panelTitle: 0xff7a59,
    panelText: 0x4d3342,
    panelBase: 0xfff4eb,
    panelShadow: 0xb78b8b,
    playerBlueBackground: 0x6ba6ff,
    playerRedBackground: 0xff8c66,
    turnBlue: 0x3b8dff,
    turnRed: 0xff5a4d,
    sliderFill: 0xff9c7a,
    cardBase: 0xff6f91,
  },
  forestQuest: {
    appBackground: "#102117",
    loadTrack: "#2a4638",
    loadFill: "#f4c95d",
    overlayBackdrop: 0x08130d,
    panelTitle: 0xb96b2f,
    panelText: 0x314236,
    panelBase: 0xf3efdf,
    panelShadow: 0x8c8f73,
    playerBlueBackground: 0x5aa4a8,
    playerRedBackground: 0xd17a52,
    turnBlue: 0x3f8d95,
    turnRed: 0xc4563e,
    sliderFill: 0xe2a25f,
    cardBase: 0xcf7f45,
  },
  arcticGlow: {
    appBackground: "#0e1d2b",
    loadTrack: "#24435d",
    loadFill: "#8bf1ff",
    overlayBackdrop: 0x07121c,
    panelTitle: 0x2f9dbe,
    panelText: 0x2f4552,
    panelBase: 0xf2fbff,
    panelShadow: 0x89a8b6,
    playerBlueBackground: 0x8ec5e9,
    playerRedBackground: 0xf0a6a6,
    turnBlue: 0x3b86c4,
    turnRed: 0xe07c7c,
    sliderFill: 0x78d8d5,
    cardBase: 0x6eb8d6,
  },
} as const satisfies Record<string, AppColorPalette>;

export type ThemeName = keyof typeof AppThemes;

// Change this to quickly switch global palette.
export const ACTIVE_THEME: ThemeName = "neonArena";

export let AppColors: AppColorPalette = AppThemes[ACTIVE_THEME];

export function selectTheme(theme: ThemeName) {
  AppColors = AppThemes[theme];
  return AppColors;
}

export function selectThemeFromString(theme: string | null | undefined) {
  if (!theme) return ACTIVE_THEME;
  if (theme in AppThemes) {
    selectTheme(theme as ThemeName);
    return theme as ThemeName;
  }
  return ACTIVE_THEME;
}

export function getThemeNames(): ThemeName[] {
  return Object.keys(AppThemes) as ThemeName[];
}
