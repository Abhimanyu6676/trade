export enum reduxConstant_e {
  SAGA_TEST = "ACT_1",
  SAGA_STOCKS = "ACT_2",
  SAGA_STOCKS_SIDE_EFFECT = "ACT_3",
}

export interface baseAction_Props<R> {
  props: R;
}
type getBaseAction_t<R> = (
  props: R,
) => baseAction_Props<R> & { type: reduxConstant_e };

export const getBaseAction: <R>(type: reduxConstant_e) => getBaseAction_t<R> = (
  type,
) => {
  return (props) => {
    return {
      type,
      props,
    } as const;
  };
};
