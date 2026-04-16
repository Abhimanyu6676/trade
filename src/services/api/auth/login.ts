import store from "../../../redux";
import { setAuthState } from "../../../redux/authReducer";
import { storeLocalData } from "../../../util/localStorage";
import api from "../axios";

/**
 *
 * @param {* data: RequestBodyType<"login"> *}
 * @param {* successCb?: (props:RequestDataType<"login">) => void *}
 * @param {* errorCb?: (props: RequestResponseType<"login">) => void *}
 * @returns {* Promise<RequestResponseType<"login">> *}
 *
 */

const loginSideEffect = (props: AxiosResponseDataType<"login">) => {
  console.log("loginSideEffect :", props);
  store.dispatch(setAuthState({ user: props.user }));
  storeLocalData("user", props.user);
  storeLocalData("accessToken", props.accessToken);
  storeLocalData("auth_event", Date.now().toString());
};

/**
 *
 * @param data: AxiosRequestBodyType<"login">
 * @param successCb?: (props: AxiosResponseDataType<"login">) => void;
 * @param errorCb?: (props: RequestResponseType<"login">) => void;
 * @param useSideEffects [boolean] (optional) (default: true)
 *
 * @returns Promise<RequestResponseType<"login">>
 */
export const _login: (props: {
  data: AxiosRequestBodyType<"login">;
  successCb?: (props: AxiosResponseDataType<"login">) => void;
  errorCb?: (props: RequestResponseType<"login">) => void;
  useSideEffects?: boolean;
}) => Promise<RequestResponseType<"login">> = async ({ data, successCb, errorCb, useSideEffects = true }) => {
  console.log("now logging in");
  const _response = await api
    .post("login", "/auth/login", data)
    .then((res) => {
      console.log("login response --- ", res.data);
      if (res.data) {
        useSideEffects && loginSideEffect(res.data);
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
