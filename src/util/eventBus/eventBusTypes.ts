export const t = {};

interface _baseEvent_i<TYPE, ACTIONS> {
  type: TYPE;
  action: ACTIONS;
}

interface _baseActionType<TYPE, DATA> {
  type: TYPE;
  data: DATA;
}

/** DES-1 */ // AUTH Events and action

interface _authEventAction_login extends _baseActionType<"LOGIN", USER.base> {}

interface _authEventAction_logout extends _baseActionType<"LOGOUT", null> {}

interface _authEvents_i extends _baseEvent_i<
  "AUTH",
  _authEventAction_login | _authEventAction_logout
> {}

/** DES-2 */ // OpenAlgoClass Events and actions

interface _openAlgoEventAction_LTP extends _baseActionType<"LTP", ltpData_i> {}

interface _openAlgoEvents_i extends _baseEvent_i<
  "OPENALGO",
  _openAlgoEventAction_LTP
> {}

/** DES-3 */ // Trade Events and action

interface _sampleCmdEventAction_sample1 extends _baseActionType<
  "S1",
  USER.base
> {}

interface _sampleCmdEventAction_sample2 extends _baseActionType<
  "S2",
  ORDER.base
> {}

interface _sampleEvents_i extends _baseEvent_i<
  "SAMPLE",
  _sampleCmdEventAction_sample1 | _sampleCmdEventAction_sample2
> {}

// DES-4 All events union

export type _evenBusEventsUnion =
  | _authEvents_i
  | _openAlgoEvents_i
  | _sampleEvents_i;

// #region [c1] DES-5 event types destructuring

export type _evenBusEvents_map_with_type_key = {
  [T in _evenBusEventsUnion as T["type"]]: T;
};

export type _eventBusEvent_types = _evenBusEventsUnion["type"];

export type _getEventAction_t<
  K extends keyof _evenBusEvents_map_with_type_key,
> = _evenBusEvents_map_with_type_key[K]["action"];

type _allEventActions_t = {
  [K in _eventBusEvent_types]: _getEventAction_t<K>;
}[_eventBusEvent_types];

// DES-6 Event emitter function type

type _eventEmitter_t<K extends _eventBusEvent_types> = (
  props: _evenBusEvents_map_with_type_key[K],
) => void;
// Usage example
// ==> emitEvent: _eventEmitter_t<"AUTH"> = (props) => {};
export type _getEventEmitter_t = <K extends _eventBusEvent_types>(
  props: K,
) => _eventEmitter_t<K>;
// #endregion
