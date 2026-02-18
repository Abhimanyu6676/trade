type keys_t = "user" | "stocksList";

/**
 *
 * @param {* key_<String> >> dataKey} key
 * @param {* value_<Object> >> dataSet} value
 */
export const storeLocalData = async (
  key: keys_t,
  value: unknown,
): Promise<void> => {
  //console.log("SAVING DATA >> " + JSON.stringify(value))
  try {
    await localStorage.setItem(key, JSON.stringify(value));
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
export const getLocalData = async (key: keys_t): Promise<unknown> => {
  try {
    const jsonValue = await localStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.warn(e);
    return null;
  }
};
