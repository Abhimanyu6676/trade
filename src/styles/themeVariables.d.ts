declare module "*/themeVariables.module.scss" {
  const content: {
    currentTheme: import("./theme").RootThemes_t;
    bodyBg: string;
    primaryColorDark: string;
    primaryColorLight: string;
    borderColor: string;
    textColor: string;
    subtleText: string;
    highlightedBorder: string;
  };
  export = content;
}

/* declare module "*.module.scss" {
  const classes: { readonly [className: string]: string };
  export default classes;
} */

declare module "*.module.scss";
