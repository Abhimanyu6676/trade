import axios, { AxiosInstance } from "axios";
import { axiosApiRequest_t } from "./axiosTypes";
import { authApi } from "./auth";
import { storeLocalData } from "../util/localStorage";

/**
 * Axios instance used across the application
 */
const _api = axios.create({ baseURL: `${process.env.BASE_URL}/backend`, withCredentials: true });

let refreshPromise: any = null;
/**
 * Attach access token automatically
 */
_api.interceptors.request.use((req) => {
  const token = localStorage.getItem("accessToken");

  if (token) req.headers!.authorization = `Bearer ${token}`;

  return req;
});

_api.interceptors.response.use(
  (res) => {
    console.log("response Interceptor res = ", res);
    if (res?.data) return res.data;
    return res;
  },
  async (error) => {
    const original = error.config;
    console.log(`${original.url} error interceptor `, error);

    if (error.response?.status === 401 && !original._retry && !original.url.includes("/auth")) {
      console.log(`refreshing access token for request ${original.url}`);
      original._retry = true;

      const res = await _api
        .post("/auth/refresh")
        .then((res) => res)
        .catch((err) => err);

      console.log("refreshToken response : ", res);

      const accessToken = res.data?.accessToken;
      if (!accessToken) {
        console.log("no access token received, logging out");
        authApi.logout();
        throw error;
      }

      storeLocalData("accessToken", accessToken);

      original.headers.Authorization = `Bearer ${accessToken}`;

      return _api(original);
    } else {
      console.log(`${original.url} error:`, error);
      if (error?.response) {
        console.log(`${original.url} error.response`, error?.response);
        if (error.response?.data) {
          let errData: RequestResponseTypes = error.response?.data;
          errData.error = { ...errData.error, statusCode: errData.error?.statusCode ?? error.status };
          throw errData;
        } else throw error?.response;
      } else {
        console.log(`${original.url} error without response`, JSON.stringify(error));
        const _err: RequestResponseTypes = {
          type: "axiosError",
          status: "error",
          statusCode: error.response?.status,
          error: { message: error?.message ?? "Unknown Error", error },
          data: null,
        };
        console.log("new axios error object =  ", _err);
        throw _err;
      }
    }
    console.log("response outside if-else - ", JSON.stringify(error));
    throw error;
  },
);

const api: { get: axiosApiRequest_t; post: axiosApiRequest_t; auth: typeof authApi; instance: AxiosInstance } = {
  get: (type, path, body) => {
    return _api.post(path, { ...body, type });
  },
  post: (type, path, body) => {
    return _api.post(path, { ...body, type });
  },
  auth: authApi,
  instance: _api,
};

export default api;
//export default api;

/* 

export default api;

export const post: axiosApiRequest_t = (_, path, body) => {
  return api.post(path, body);
};

export const get: axiosApiRequest_t = (_, path, body) => {
  return api.post(path, body);
}; 

*/
