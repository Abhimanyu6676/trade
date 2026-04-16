import api from "../../axios";
import { _queryUserTradesByDate_gql } from "../../../../../../backend/src/crud/trade/tradeGql";

const pad = (n: any) => n.toString().padStart(2, "0");

/**
 * @param data:
 *
 * @returns Promise<>
 */
export const _getUserTradesByDate: (props: {
  day: number;
  month: number;
  year: number;
  keyId: string;
}) => Promise<RequestResponseType<"getUserTradesByDate">> = async (props) => {
  console.log("now getting trades for date :", props.day, props.month, props.year);
  const _response = await api
    .post("getUserTradesByDate", "/api/graphql", {
      query: _queryUserTradesByDate_gql({ includeAllRelatedChildren: true }),
      variables: {
        where: {
          keyId: { equals: props.keyId },
          createdAt: {
            gt: `${props.year}-${pad(props.month)}-${pad(props.day)}T00:00:00+05:30`,
            lt: `${props.year}-${pad(props.month)}-${pad(props.day)}T23:59:59+05:30`,
          },
        },
      },
    })
    .then((res) => {
      console.log("getUserTradesByDate response --- ", res.data);
      if (res.data?.trades) {
        return res;
      } else throw res;
    })
    .catch((err) => {
      console.log("getUserTradesByDate error --- ", err);

      return err;
    });
  return _response;
};
