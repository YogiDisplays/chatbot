/**
 * @module Money
 * @description Return pure money.
 */
module.exports = {
  isValid: (v) => {
      return v.indexOf(",") === -1 && v.indexOf(".") === -1
  }
};