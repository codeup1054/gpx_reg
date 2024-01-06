/**
 * CONST and GLOBALS
 * */

import {_mapObjects}  from "/app/geodata/geo_model.js";
import {model} from '/app/const.js?2'
import {addLayer}  from "./layers/osm.layers.js";
import {addControl} from "./controls/osm.controls.custom.js";


const center_map = [55.69, 37.43];

const teply_stan = [55.59, 37.48];


const map = L.map('map').setView(teply_stan, 12);


_mapObjects._osmmap = map;
window._osmmap = _mapObjects._osmmap;  /** set global for all modules **/

addLayer();
addControl();


