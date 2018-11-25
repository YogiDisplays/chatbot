/**
 * @module Button
 * @description Generating dynamically chat bot GUI buttons.
 */
module.exports = (arr, pbName) => {
    // This little function is generates a dynamic data sets of buttons for rendering inside of Messenger.
    let buttons = [];
    for (let x = 0; x < arr.length; x++) {
        const {title, id, type} = arr[x];
        buttons.push({type, title, payload: `${pbName}_${id}`})
    }
    return buttons;
};