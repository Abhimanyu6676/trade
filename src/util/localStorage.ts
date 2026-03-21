type keys_t = "user" | "stocksList" | "auth_event" | "accessToken";

/**
 *
 * @param {* key_<String> >> dataKey} key
 * @param {* value_<JSON Object> >> dataSet} value
 */
export const storeLocalData = (key: keys_t, value: unknown): void => {
  //console.log("SAVING DATA >> " + JSON.stringify(value))
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(e);
  }
};

/**
 *
 * @param {* key_<String> >> dataKey for the dataSet to be resolved} key
 *
 * @returns {* null:: in case dataSet doesn't exists}
 * @returns {* Object: if data exists}
 */
export const getLocalData = (key: keys_t): unknown => {
  try {
    const jsonValue = localStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.warn(e);
    return null;
  }
};
