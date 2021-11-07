/*** 2021-08-15 Global param */
import '/js/jquery/jquery.js';
import {model} from '/app/const.js'

// console.log ("@@ param cookie")
//
// let location_param = document.location.hash.substr(1)
//     || $.cookie('location-settings'+window.location.pathname)
//     // || default_params


export function ifMapChanged() {

    delete param["map"]

    const location_search = encodeURIComponent(JSON.stringify(param));

    // console.log("@@ ifMapChanged model", [param, location_search, location_search.length])

    let href
    href = window.location.origin + window.location.pathname + "#" + location_search;
    window.location.href = href;
    // console.log("@@ cookie ", [param])
    $.cookie('location-settings' + window.location.pathname, location_search);

} //*** ifMapChanged()


function getString(o) {

    function iter(o, path) {
        if (Array.isArray(o)) {
            o.forEach(function (a) {
                iter(a, path + '[]');
            });
            return;
        }
        if (o !== null && typeof o === 'object') {
            Object.keys(o).forEach(function (k) {
                iter(o[k], path + '[' + k + ']');
            });
            return;
        }
        data.push(path + '=' + o);
    }

    var data = [];
    Object.keys(o).forEach(function (k) {
        iter(o[k], k);
    });
    return data.join('&');
}

export function clearCookie() {

    console.log ("@@ clearCoockie()!!!")
    let href
    href = window.location.origin + window.location.pathname;
    window.location.href = href;

    $.cookie('location-settings'+window.location.pathname, "");

} //*** ifMapChanged()

// console.log ("@@ zoom",$("zoom").html())

$("zoom").on("click",() => { console.log ("@@ 222",222);  clearCookie();});