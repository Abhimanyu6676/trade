import Alert from "../../../components/alert";
import api from "../axios";

export const _register: (props: AxiosRequestBodyType<"register">) => Promise<RequestResponseType<"register">> = async (
  data,
) => {
  try {
    const res = await api.post("register", "/auth/register", data);
    //console.log("api res :", res);
    if (res.data?.id) {
      Alert.notify({
        heading: "Registration successful",
        text: "You can log in now.",
        variant: "success",
        timeout: 2000,
      });
      return res;
    } else throw res;
  } catch (error: any) {
    //console.log("register error ::", error);
    const message = error?.response?.data?.message || error?.message || "Please try again.";
    Alert.notify({ heading: "Registration failed", text: message, variant: "error", timeout: 2000 });
    return error;
  }
};
