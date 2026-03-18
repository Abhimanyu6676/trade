import { AxiosResponse } from "axios";
import api from "./axios";

/**
 * Multiple ways of defining global types for axios client and api request then accessing accessing it
 * defined request function and usages are for example purpose only
 *
 * For project use import the types and define a function in different file
 */

/** DES first method */

// region [c1] typedef for function returning apiClient with defined body and response types

export type axiosApiRequest_t = <K extends RequestTypes>(
  type: K,
  path: _responses_i_map_with_type_key[K]["path"],
  body: RequestBodyType<K> extends undefined | null ? null : RequestBodyType<K>,
) => Promise<RequestResponseType<K>>;

export type axiosApiRequest_Union_t = {
  [K in RequestTypes]: axiosApiRequest_t;
}[RequestTypes];

// endregion

// region [c4] multiple ways to write a function returning api client with defined body and response types

const apiRequest1: axiosApiRequest_t = (_, path, body) => {
  return api.instance.post(path, body);
};

const apiRequest2: axiosApiRequest_Union_t = (_, path, body) => {
  return api.instance.post(path, body);
};

const apiRequest3 = <K extends RequestTypes>(
  path: _responses_i_map_with_type_key[K]["path"],
  body: RequestBodyType<K> extends undefined | null ? null : RequestBodyType<K>,
) => {
  return api.instance.post<
    RequestResponseType<K>,
    AxiosResponse<RequestResponseType<K>>
  >(path, body);
};

// endregion

// region [c6] usage with different methods

const f = () => {
  const res1 = apiRequest1("logout", "/auth/logout", null);
  const res11 = apiRequest1<"register">("register", "/auth/register", {
    name: "",
    email: "",
    password: "",
  });

  const res2 = apiRequest2("login", "/auth/login", {
    email: "",
    password: "",
  });
  const res22 = apiRequest2<"refreshToken">(
    "refreshToken",
    "/auth/refresh",
    null,
  );

  const res3 = apiRequest3<"logout">("/auth/logout", null);
  const res33 = apiRequest3("/auth/register", {
    name: "",
    email: "",
    password: "",
  });
};

//endregion

/** DES second method */

/**
 * NOTE
 * another way of doing above but this requires each _apiClient type to written manually for
 * for each `RequestTypes`
 */

type _axiosApi_t<K extends RequestTypes> = (
  type: K,
  path: _responses_i_map_with_type_key[K]["path"],
  body: RequestBodyType<K> extends undefined | null ? null : RequestBodyType<K>,
) => Promise<AxiosResponse<RequestResponseType<K>, any, {}>>;

const _apiClient_login: _axiosApi_t<"login"> = (_, path, body) => {
  return api.instance.post(path, body);
};
const _apiClient_logout: _axiosApi_t<"logout"> = (_, path, body) => {
  return api.instance.post(path, body);
};

const res = await _apiClient_login("login", "/auth/login", {
  email: "",
  password: "",
});
