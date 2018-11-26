const config = require("../../config");
const getString = require("./getString");

/**
 * @function Timeout
 * @description Ending conversation after a while of inactivity.
 */
function timeout(c) {
    setTimeout(() => {
        c.say({
            text: getString("chatTimeout_err"),
            buttons: [
                {type: 'postback', title: getString("tryAgain_info"), payload: 'GET_STARTED'}
            ]
        }).then(() => c.end());
    }, config.timeout * 60000) // timeout in minute
}

module.exports = timeout;