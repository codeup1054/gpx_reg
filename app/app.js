const gpx_js = [
    '/app/const.js',
    '/js/jquery/jquery.js',
    '/js/jquery/jquery-ui.js',
    '/js/cookie/jquery.cookie.js',
    '/js/gpx.adds.js',
    // '/app/location.cookie.js',
    // '/app/map/map.init.js',
    '/app/map/map.overlay.js',
    '/app/test.js'
]


/**
 * CONST and GLOBALS
 * */

let next_script = 0;
let now = Date.now();
let last = now
// let param = {}
let map

/**
 / CONST and GLOBALS
 * */


window.onload = function() {
    sync_import();
};

now = Date.now();

function sync_import()
{

    import(gpx_js[next_script]+"?" + now).then(() => {
        next_script++;
        // console.time("JS"+next_script)
        if (next_script < gpx_js.length) {
            now = Date.now();

            sync_import()
            // console.timeEnd("JS"+next_script)
            // console.log("@@ next_script", [gpx_js[next_script] , now - last , $("#container")].join('\n'));
            last = now
        }
        else
        {
            import {ifMapChanged} from '/app/location.cookie.js'
            import {initMap} from '/app/map/map.init.js'
            ifMapChanged();
            initMap();
        }
    })
}
