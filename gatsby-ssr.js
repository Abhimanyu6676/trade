import { GlobalRootComp } from "./src/components/globalRootComp";

export const wrapRootElement = GlobalRootComp;

export const onRenderBody = ({ setHtmlAttributes }) => {
  setHtmlAttributes({
    lang: "en",
    // Add other attributes as needed
    "data-theme": "dark",
  });
};
