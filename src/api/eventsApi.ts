import api from "./axios";

export const _eventApi: (props: {
  data: AxiosRequestBodyType<"event">;
}) => Promise<RequestResponseType<"event">> = async ({ data }) => {
  console.log("now logging in");
  const _response = await api
    .post("event", "/event", data)
    .then((res) => {
      console.log("/event api response --- ", res.data);
      if (res.data) {
        return res;
      } else throw res;
    })
    .catch((err) => {
      console.log("/event api --- ", err);

      return err;
    });
  return _response;
};
