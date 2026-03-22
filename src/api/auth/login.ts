import store from "../../redux";
import { setAuthState } from "../../redux/authReducer";
import { storeLocalData } from "../../util/localStorage";
import api from "../axios";

/**
 *
 * @param {* data: RequestBodyType<"login"> *}
 * @param {* successCb?: (props:RequestDataType<"login">) => void *}
 * @param {* errorCb?: (props: RequestResponseType<"login">) => void *}
 * @returns {* Promise<RequestResponseType<"login">> *}
 *
 */
export const _login: (props: {
  data: AxiosRequestBodyType<"login">;
  successCb?: (props: AxiosResponseDataType<"login">) => void;
  errorCb?: (props: RequestResponseType<"login">) => void;
}) => Promise<RequestResponseType<"login">> = async ({ data, successCb, errorCb }) => {
  console.log("now logging in");
  const _response = await api
    .post("login", "/auth/login", data)
    .then((res) => {
      console.log("login response --- ", res);

      if (res.data) {
        store.dispatch(setAuthState({ user: res.data.user }));
        storeLocalData("user", res.data.user);
        storeLocalData("accessToken", res.data.accessToken);
        storeLocalData("auth_event", Date.now().toString());
        successCb && successCb(res.data);
        return res;
      } else throw res;
    })
    .catch((err) => {
      console.log("login error --- ", err);
      errorCb && errorCb(err);
      return err;
    });
  return _response;
};
