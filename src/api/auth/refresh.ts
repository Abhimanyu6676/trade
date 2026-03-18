import { storeLocalData } from "../../util/localStorage";
import api from "../axios";
import { _logout } from "./logout";

export const _restoreSession = async () => {
  try {
    console.log("refreshing token----------------------------------------");
    const res = await api.post("refreshToken", "/auth/refresh", null);
    if (res.data) {
      storeLocalData("accessToken", res.data.accessToken);
    } else throw res;
  } catch (err: any) {
    //TODO check if the request has failed or its a network error, if 401 unauthorized kill current session by logging out
    if (err.type == "refreshToken" && err.status == "error") {
      if (window.location.pathname.includes("/auth")) {
        console.log("we are already on the auth page no need to logout");
      } else {
        console.log("condition match to logout");
        _logout()
          .then((r) => r)
          .catch((e) => e);
      }
    } else {
      console.log("this could be network error doesNotThrow, log out");
    }
  }
};
