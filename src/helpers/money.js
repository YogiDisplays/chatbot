/**
 * @module Money
 * @description Return pure money.
 */
module.exports = {
    isValid: (v, limits) => {
        return {
            comma: v.indexOf(",") === -1 && v.indexOf("."),
            limits: v <= limits[1] && v >= limits[0]
        };
    }
};