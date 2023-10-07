const gpx_js = [
    // '/app/const.js',
    '/js/jquery/jquery.js',
    '/js/jquery/jquery-ui.js',
    '/js/cookie/jquery.cookie.js',
    '/app/map/map.location.cookie.js'
    // '/js/gpx.adds.js',
    // '/app/map.location.cookie.js',
    // '/app/map/map.init.js',
    // '/app/map/map.overlay.js',
    // '/app/test.js'
]

/**
 * CONST and GLOBALS
 * */

let now = Date.now();
let last = now

/**
 / CONST and GLOBALS
 * */

import {model} from '/app/const.js?2'

let mod = model

window.param = model.get();

// console.log("@@ model app.js", param)

import '/js/jquery/jquery.js'
import '/js/cookie/jquery.cookie.js'
import {clearCookie} from '/app/map/map.location.cookie.js?2'

import {initMap, setMapStyler} from '/app/map/map.init.js?1'
import {mapOverlay,MERCATOR} from '/app/map/map.overlay.js?1'
import {mapInformer} from '/app/map/map.informer.js?2'
import {mapControls} from '/app/map/map.controls.js?2'

import {mapEvents} from '/app/gpxevents.js?1'

let next_script = 0;


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
            // console.log ("@@ $.cookie('location-settings'+window.location.pathname)",$.cookie('location-settings'+window.location.pathname))
            param.map = initMap(param)
            // console.log ("@@ param",param)
            setMapStyler(param)
            mapOverlay(param)
            mapControls.add_custom_control_panel()
            mapControls.add_cache_control()
            mapInformer.add()
            mapControls.add_layers_controls()
            mapControls.add_geozone_control()
            mapControls.add_polyline_control()
        }
    })
}

sync_import()

// window.onload = function() {
//     param.map = initMap(param)
//     setMapStyler(param.mapLightess)
//     mapOverlay(param)
//     // sync_import();
// };
