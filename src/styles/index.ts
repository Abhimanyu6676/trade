import { typographyStyles } from "./typography";
import { _colors } from "./colors";
import { StyleSheet } from "react-native";

export default {
  typography: typographyStyles,
  colors: _colors,
  styles: StyleSheet.create({
    center: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    shadowLight: {
      shadowColor: "#aaaaaa",
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },
    shadowMid: {
      shadowColor: "#555555",
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 3.5,
    },
    shadowDark: {
      shadowColor: "black",
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
  }),
};
