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
  cardInner?: number;
  cardBorder?: number;
  cardFlippedBorder?: number;
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
  cyberPunk: {
    appBackground: "#120421",
    loadTrack: "#2d0a4e",
    loadFill: "#f0f000",
    overlayBackdrop: 0x090211,
    panelTitle: 0xff00e6,
    panelText: 0x2a0845,
    panelBase: 0xfcf0ff,
    panelShadow: 0xbc26d9,
    playerBlueBackground: 0x00d0ff,
    playerRedBackground: 0xff3366,
    turnBlue: 0x00b8ff,
    turnRed: 0xff1c55,
    sliderFill: 0x00ffcc,
    cardBase: 0xff00e6,
  },
  matrixNeon: {
    appBackground: "#061206",
    loadTrack: "#0e260e",
    loadFill: "#00ff41",
    overlayBackdrop: 0x030803,
    panelTitle: 0x00ff41,
    panelText: 0x0a260a,
    panelBase: 0x0f520f,
    panelShadow: 0xfeebf5,
    playerBlueBackground: 0x2a8af6,
    playerRedBackground: 0xf23c3c,
    turnBlue: 0x1e81ed,
    turnRed: 0xe82c2c,
    sliderFill: 0x00ff41,
    cardBase: 0xeaffea,
  },
  synthWave: {
    appBackground: "#1a052b",
    loadTrack: "#300a4d",
    loadFill: "#00ffff",
    overlayBackdrop: 0x0c0214,
    panelTitle: 0xff007f,
    panelText: 0x1f0633,
    panelBase: 0x7a08b3,
    panelShadow: 0xaa1e76,
    playerBlueBackground: 0x2077f5,
    playerRedBackground: 0xf53b5c,
    turnBlue: 0x1a6ae6,
    turnRed: 0xe62749,
    sliderFill: 0xff007f,
    cardBase: 0xfeebf5,
  },
  cyberOcean: {
    appBackground: "#030a14",
    loadTrack: "#081b33",
    loadFill: "#00d2ff",
    overlayBackdrop: 0x01050a,
    panelTitle: 0x00d2ff,
    panelText: 0x061426,
    panelBase: 0x072040,
    panelShadow: 0x0088aa,
    playerBlueBackground: 0x2a8af6,
    playerRedBackground: 0xf23c3c,
    turnBlue: 0x1e81ed,
    turnRed: 0xe82c2c,
    sliderFill: 0x00d2ff,
    cardBase: 0x1f5a8a,
  },
  amberGlow: {
    appBackground: "#140a02",
    loadTrack: "#331a08",
    loadFill: "#ffb347",
    overlayBackdrop: 0x0a0501,
    panelTitle: 0xffb347,
    panelText: 0x261406,
    panelBase: 0x40210a,
    panelShadow: 0xaa6600,
    playerBlueBackground: 0x2a8af6,
    playerRedBackground: 0xf23c3c,
    turnBlue: 0x1e81ed,
    turnRed: 0xe82c2c,
    sliderFill: 0xffb347,
    cardBase: 0x8a4b14,
  },
  neonAmethyst: {
    appBackground: "#0e0314",
    loadTrack: "#260833",
    loadFill: "#d47dff",
    overlayBackdrop: 0x07010a,
    panelTitle: 0xd47dff,
    panelText: 0xffffff,
    panelBase: 0x2f0c40,
    panelShadow: 0x8833aa,
    playerBlueBackground: 0x2a8af6,
    playerRedBackground: 0xf23c3c,
    turnBlue: 0x1e81ed,
    turnRed: 0xe82c2c,
    sliderFill: 0xd47dff,
    cardBase: 0x813b9e,
  },
  toxicWaste: {
    appBackground: "#081208",
    loadTrack: "#122a12",
    loadFill: "#bfff00",
    overlayBackdrop: 0x040904,
    panelTitle: 0xbfff00,
    panelText: 0xffffff,
    panelBase: 0x0f290f,
    panelShadow: 0x6aa84f,
    playerBlueBackground: 0x2a8af6,
    playerRedBackground: 0xf23c3c,
    turnBlue: 0x1e81ed,
    turnRed: 0xe82c2c,
    sliderFill: 0xbfff00,
    cardBase: 0x487a32,
  },
  bloodMoon: {
    appBackground: "#140505",
    loadTrack: "#330f0f",
    loadFill: "#ff1a1a",
    overlayBackdrop: 0x0a0202,
    panelTitle: 0xff1a1a,
    panelText: 0xffffff,
    panelBase: 0x400a0a,
    panelShadow: 0xaa1111,
    playerBlueBackground: 0x2a8af6,
    playerRedBackground: 0xf23c3c,
    turnBlue: 0x1e81ed,
    turnRed: 0xe82c2c,
    sliderFill: 0xff1a1a,
    cardBase: 0x8c2121,
  },
  electricSky: {
    appBackground: "#0a0b1f",
    loadTrack: "#151842",
    loadFill: "#00f2fe",
    overlayBackdrop: 0x05050f,
    panelTitle: 0x4facfe,
    panelText: 0xffffff,
    panelBase: 0x12174a,
    panelShadow: 0x00f2fe,
    playerBlueBackground: 0x2a8af6,
    playerRedBackground: 0xf23c3c,
    turnBlue: 0x1e81ed,
    turnRed: 0xe82c2c,
    sliderFill: 0x00f2fe,
    cardBase: 0x324f9c,
  },
  tileGame: {
    appBackground: "#6b5bf9ff",
    loadTrack: "#a55c34",
    loadFill: "#39fc1fff",
    overlayBackdrop: 0x000000,
    panelTitle: 0xff4068,
    panelText: 0x834020,
    panelBase: 0xfff2e3,
    panelShadow: 0x834020,
    playerBlueBackground: 0x00a2e8,
    playerRedBackground: 0xff6b81,
    turnBlue: 0x0080b8,
    turnRed: 0xcc2222,
    sliderFill: 0xffb815,
    cardBase: 0xffb815,
    cardInner: 0x1663b6,
    cardBorder: 0xffffff,
    cardFlippedBorder: 0xffffff,
  },
} as const satisfies Record<string, AppColorPalette>;

export type ThemeName = keyof typeof AppThemes;

// Change this to quickly switch global palette.
export const ACTIVE_THEME: ThemeName = "tileGame";

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
