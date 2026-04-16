import store from "../../../redux";
import { setAuthState } from "../../../redux/authReducer";
import eventBus from "../../../util/eventBus";
import { storeLocalData } from "../../../util/localStorage";
import api from "../axios";
import { _logout } from "./logout";

const restoreSessionSuccessSideEffect = (props: AxiosResponseDataType<"refreshToken">) => {
  storeLocalData("accessToken", props.accessToken);
  console.log("setting user loading to false in restore session success sideEffect");
  store.dispatch(setAuthState({ loading: false, user: props.user }));
  eventBus.emitEvent({ type: "AUTH", action: { type: "LOGIN", data: { user: props.user, userId: props.user.id } } });
};

const restoreSession401SideEffect = (props: RequestResponseType<"refreshToken">) => {
  // if response error is received from server it'll always hold type="refreshToken", specifies that server rejected request
  // Axios interceptor sends axios error type if request never server
  // check if request is rejected by server or due to network error
  if (props.type == "refreshToken" && props.status == "error") {
    if (window.location.pathname.includes("/auth")) {
      console.log("we are already on the auth page no need to logout");
    } else {
      console.log("condition match to logout");
      _logout()
        .then((r) => r)
        .catch((e) => e);
    }
  } else {
    console.log("this could be network error, do not log out");
  }
};

/**
 *
 * @param {* successCb?: (props: RequestDataType<"refreshToken">) => void *}
 * @param {* errorCb?: (props: RequestResponseType<"refreshToken">) => void *}
 * @param {* useSideEffects?: boolean *} [default true] weather or not to use success & error sideEffects upon response completion
 * @returns {* Promise<RequestResponseType<"refreshToken">> *}
 *
 */
export const _restoreSession: (props: {
  successCb?: (props: AxiosResponseDataType<"refreshToken">) => void;
  errorCb?: (props: RequestResponseType<"refreshToken">) => void;
  useSideEffects?: boolean;
}) => Promise<RequestResponseType<"refreshToken">> = async ({ successCb, errorCb, useSideEffects = true }) => {
  console.log("refreshing token --");
  const _refreshTokenResponse = await api
    .post("refreshToken", "/auth/refresh", null)
    .then((res) => {
      if (res.data?.accessToken) {
        useSideEffects && restoreSessionSuccessSideEffect(res.data);
        successCb && successCb(res.data);
        return res;
      } else throw res;
    })
    .catch((err) => {
      //TODO check if the request has failed or its a network error, if 401 unauthorized kill current session by logging out
      useSideEffects && restoreSession401SideEffect(err);
      errorCb && errorCb(err);
      return err;
    })
    .finally(() => {
      if (store.getState().user.loading) {
        console.log("setting user loading to false in restore session final block");
        store.dispatch(setAuthState({ loading: false }));
      }
    });
  return _refreshTokenResponse;
};
