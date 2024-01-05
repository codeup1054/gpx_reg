/**
 * CONST and GLOBALS
 * */

import {_mapObjects}  from "/app/geodata/geo_model.js";
import {model} from '/app/const.js?2'
import {addLayer}  from "./layers/osm.layers.js";
import {addControl} from "./controls/osm.controls.custom.js";


const center_map = [55.69, 37.43];

const map = L.map('map').setView(center_map, 13);


_mapObjects._osmmap = map;
window._osmmap = _mapObjects._osmmap;  /** set global for all modules **/

addLayer();
addControl();


