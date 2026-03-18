import Alert from "../../components/alert";
import api from "../axios";

export const _register = async (data: RequestBodyType<"register">) => {
  try {
    const res = await api.post("register", "/auth/register", data);
    console.log("register response - ");
    Alert.notify({
      heading: "Registration successful",
      text: "You can log in now.",
      variant: "success",
      timeout: 2000,
    });
  } catch (error: any) {
    console.log("error ", error);
    const message =
      error?.response?.data?.message || error?.message || "Please try again.";
    Alert.notify({
      heading: "Registration failed",
      text: message,
      variant: "error",
      timeout: 2000,
    });
    throw error;
  }
};
