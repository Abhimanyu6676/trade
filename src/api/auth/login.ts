import store from "../../redux";
import { setAuthState } from "../../redux/authReducer";
import { storeLocalData } from "../../util/localStorage";
import api from "../axios";

export const _login = async (
  data: RequestBodyType<"login">,
  cb?: (props: { user: user_i; accessToken: string }) => void,
) => {
  console.log("now logging in");
  await api
    .post("login", "/auth/login", data)
    .then((res) => {
      console.log("login response --- ", res);

      if (res.data) {
        store.dispatch(
          setAuthState({
            user: res.data.user,
          }),
        );
        storeLocalData("user", res.data.user);
        storeLocalData("accessToken", res.data.accessToken);
        storeLocalData("auth_event", Date.now().toString());
        cb && cb({ user: res.data.user, accessToken: res.data.accessToken });
      } else throw res;
    })
    .catch((err) => {
      console.log("login error - ", err);
    });
};
