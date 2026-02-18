interface themeColors {
  text: string;
  background: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
}

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors /* : { light: themeColors; dark: themeColors } */ = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

// Old colors scheme
export const _colors = {
  spacer: "#D9D9D9",
  logoColor: "#F25427",
  textSecondary: "#84888D",
  textPrimary: "#323841",
  success: "#58D68D",
  warning2: "#F5B041",
  warning: "#EC7063",
  backgroundColor: "#F4F6FB",
  bgHighlight: "#BDDAFF",
  highlight2: "#FFCD8A",
  highlight1: "#FFA72F",
  secondary: "#8ABCFF",
  primaryColor: "#2883FF",
  primaryColorDark: "#142D50",
};
