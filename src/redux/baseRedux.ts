import { reduxConstant_e } from "./baseAction";

export interface _baseAction_Props<R> {
  props: R;
}

export type _baseAction_t<R> = (
  props: R,
) => { props: R } & { type: reduxConstant_e };

type _baseReducer_t<R, S> = (reducerProps: {
  state: S;
  action: { props: R };
}) => S;

/**
 *
 * @template propTypes for reducer
 * @template reducerDefaultState object received as `state` prop
 *
 * @param {# type: _reduxConstant,  reducer: _baseReducer_t<R, S> }
 * @returns [action, reducer]
 */
export const _getRedux: <R, S>(props: {
  type: reduxConstant_e;
  reducer: _baseReducer_t<R, S>;
}) => [_baseAction_t<R>, _baseReducer_t<R, S>] = (props) => {
  return [
    /** action */
    (actionProps) => {
      return {
        type: props.type,
        props: actionProps,
      } as const;
    },
    /** reducer */
    props.reducer,
  ];
};
