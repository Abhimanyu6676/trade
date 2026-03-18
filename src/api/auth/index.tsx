import { _login } from "./login";
import { _logout } from "./logout";
import { _restoreSession } from "./refresh";
import { _register } from "./register";

export const authApi = {
  register: _register,
  login: _login,
  refresh: _restoreSession,
  logout: _logout,
};
