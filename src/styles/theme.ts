export const RootThemes_e = {
  light: "light",
  dark: "dark",
} as const;

export type RootThemes_t = (typeof RootThemes_e)[keyof typeof RootThemes_e];

export const DefaultRootTheme: RootThemes_t = "dark";
