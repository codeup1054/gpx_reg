/**
 * CONST and GLOBALS
 * */

import {model} from '/app/const.js?2'
// import '/js/jquery/jquery.js'
// import '/js/cookie/jquery.cookie.js'
import {clearCookie} from '/app/map/map.location.cookie.js?2'

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
    // '/app/osm.polyline.js'
]


/**
 / CONST and GLOBALS
 * */

import {_mapObjects}  from "/app/geodata/geo_model.js";
window._map = _mapObjects._map;  /** set global for all modules **/
window._elevator = _mapObjects._elevator;
window._param = model.get();    /** get param from cookie      **/

import {initMap, setMapStyler} from '/app/map/map.init.js?1'
import {mapOverlay, mapOverlayStravaDirect} from '/app/map/map.overlay.js?1'
import {MERCATOR} from '/app/lib/geo.js?1'
import {mapInformer} from '/app/map/map.informer.js?2'
import {mapControls} from '/app/map/map.controls.js?2'


let now = Date.now();
let last = now

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
            // console.log ("@@ 14._param",_param)
            initMap(_param);
            setMapStyler(_param);
            mapOverlay(_param);
            mapOverlayStravaDirect();
            mapControls.add_custom_control_panel()
            // mapControls.add_cache_control()
            mapInformer.add()
            mapControls.add_geozone_control()
        }
    })
}

sync_import()

