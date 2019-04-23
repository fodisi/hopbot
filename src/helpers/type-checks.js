/**
 * @name isString
 * @description Checks if a value is a string.
 * @param {string} value The value to be checked.
 * @return {boolean} true is value is string; otherwise, false.
 * @link https://stackoverflow.com/questions/4059147/check-if-a-variable-is-a-string-in-javascript
 */
function isString(value) {
  return (
    Object.prototype.toString.call(value) === '[object String]' || typeof value === 'string' || value instanceof String
  );
}

export default {
  isString,
};
