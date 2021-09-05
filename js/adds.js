// хелперы

function isInt(n) {
    return Number(n) === n && n % 1 === 0;
}

function isFloat(n) {
    return Number(n) === n && n % 1 !== 0;
}


window.tm = function (s = "") {
    let lap
    let start
    let last_lap

    if (s === "") {
        lap = last_lap = start = Date.now();
        // var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        console.log("Старт: %s", start);
    } else {
        lap = Date.now();
        console.log("%s %s %s", lap - start, lap - last_lap, s);
        let last_lap = lap;
    }
};
