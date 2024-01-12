// хелперы

import {_geos} from "/app/geodata/geo_model.js";

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


export function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


export function rgb2hex(rgb) {

    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}


export function roundLatLan(p, presision=6){
    return [ Number(p[0].toFixed(presision)),  Number(p[1].toFixed(presision)) ];
}