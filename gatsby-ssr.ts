import type { RenderBodyArgs } from "gatsby";
import { GlobalRootComp } from "./src/components/globalRootComp";
import { DefaultRootTheme } from "./src/styles/theme";

export const wrapRootElement = GlobalRootComp;

export const onRenderBody = ({ setHtmlAttributes }: RenderBodyArgs) => {
  setHtmlAttributes({
    lang: "en",

    className: DefaultRootTheme, //NOTE don't change this value here, instead change `DefaultRootTheme` value in `styles/theme.ts`
    // Add other attributes as needed
    //@ts-ignore
    "data-theme": DefaultRootTheme,
  });
};
