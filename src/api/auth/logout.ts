import { navigate } from "gatsby";
import store from "../../redux";
import { setAuthState } from "../../redux/authReducer";
import api from "../axios";
import eventBus from "../../util/eventBus";
import { EVENT } from "../../../../tradeServer/src/util/eventBus/eventBusTemplate";

const logoutSideEffect = async () => {
  console.log("executing logoutSideEffect");

  localStorage.removeItem("user");
  localStorage.removeItem("accessToken");
  localStorage.setItem("auth_event", Date.now().toString());
  store.dispatch(setAuthState({ user: null }));
  eventBus.emitEvent({ type: "AUTH", action: { type: "LOGOUT", data: { userID: "" } } }, false);

  console.log("current loc ", window.location.pathname);
  if (!window.location.pathname.includes("/auth"))
    navigate("/auth", { replace: true, state: { from: location?.pathname ?? "/" } });
};

export const _logout = async () => {
  const res = await api
    .post("logout", "/auth/logout", null)
    .then((r) => r)
    .catch((e) => e);
  console.log("removing data from DB");
  logoutSideEffect();
  //TODO upon logout disconnect socket and unset authorization header token to keep socket from connecting again
  //NOTE no need to reroute to login page Protected Route container will handle it
  return res;
};
