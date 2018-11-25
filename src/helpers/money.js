/**
 * @module Money
 * @description Return pure money.
 */
module.exports = {
    // This little function is validates money and looks for unnecessary symbols and predicted amount limits.
    isValid: (v, limits) => {
        return {
            comma: v.indexOf(",") === -1 && v.indexOf("."),
            limits: v <= limits[1] && v >= limits[0]
        };
    }
};