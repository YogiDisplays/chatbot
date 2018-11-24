module.exports = (arr, pbName) => {
    let buttons = [];
    for (let x = 0; x < arr.length; x++) {
        const {title, id, type} = arr[x];
        buttons.push({type, title, payload: `${pbName}_${id}`})
    }
    return buttons;
};