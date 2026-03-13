declare module "*/themeVariables.module.scss" {
  const content: {
    bodyBg: string;
    primaryColorDark: string;
    primaryColorLight: string;
    textColor: string;
    borderColor: string;
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
