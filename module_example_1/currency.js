/* Module example 1 */

// Exchange rate as of 14-Jan-2017.
var canadianDollar = 0.76;

/**
 *  roundTwoDecimals - return number rounded off.
 *  @param      {number}    amount
 *  @returns    {number}    rounded amount
 */
function roundTwoDecimals(amount) {
    return Math.round(amount * 100) / 100;
}

/**
 *  canadianToUS - exchange conversion
 *  @param      {number}    canadian dollars
 *  @returns    {number}    US dollars
 */
exports.canadianToUS = function(canadian) {
    return roundTwoDecimals(canadian * canadianDollar);
};

/**
 *  USToCanadian - exchange conversion
 *  @param      {number}    US dollars
 *  @returns    {number}    canadian dollars
 */
exports.USToCanadian = function(us) {
    return roundTwoDecimals(us / canadianDollar);
};

