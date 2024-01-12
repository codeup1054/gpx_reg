import {_geos, _mapObjects} from "../../geodata/geo_model.js";
import {setGeosActive} from "../controls/osm.actions.js";
import {gpxPolylineEditable, showPathMilestones} from "./osm.polyline.editable.js";


export function osmAllPolyLines() {

    clearMap();

    let allPolyLinePoints = [];

    $.each(_geos, (k, v) => {
        if (v.meta.showPolyLine) {
            osmPolyline(v);
            allPolyLinePoints = [...allPolyLinePoints, ...v.geojson]; // for fitBounds
        }
    });

    // alert('d');
    // _osmmap.fitBounds(L.latLngBounds(allPolyLinePoints));

}


/**
 2023-12-20 addPolylineEditable(coordinates, param)
 */


export function osmPolyline(v) {
    const _eid = v.id;

    if (_mapObjects.polyLines[_eid] != undefined) _mapObjects.polyLines[_eid].removeFrom(_osmmap);

    v.meta.style = typeof v.meta.style === "undefined" || !v.meta.style ?  {} : v.meta.style;

    if (v.meta.showPolyLineMilestones) showPathMilestones(v.geojson,
        {
            color: v.meta.style.color ||  "#ff0000",
            weight: v.meta.style.weight,
            opacity: v.meta.style.opacity,
            meta: {_eid: _eid}
        });

    if (v.active) {

        let polylineOptions = {
            newPolylineConfirmMessage: 'Add a new polyline here?',
            color: v.meta.style.color,
            weight: v.meta.style.weight,
            opacity: v.meta.style.opacity,
            meta: {_eid: _eid}
        }

        _mapObjects.polyLines[_eid] = new gpxPolylineEditable(v.geojson, polylineOptions);
        _osmmap.addLayer(_mapObjects.polyLines[_eid]);
    } else {


        $.map(polylineStyles, (pls, k) => {

            try {
                v.meta.style[k] = v.meta.style[k] == undefined ? pls: v.meta.style[k];
            }
            catch {
                v.meta.style = v.meta.style == undefined ? {}: v.meta.style;
                v.meta.style[k] =  pls;
            }
        });


        const opt = {
            opacity: v.meta.style.opacity,
            weight:  v.meta.style.weight,
            color:   v.meta.style.color,
        };

        // console.log(`@@  __weight opt`, _eid, v.meta.showPolyLine, v.name,    opt,  v.meta);


        _mapObjects.polyLines[_eid] = L.polyline(v.geojson, opt ).addTo(_osmmap);
        _mapObjects.polyLines[_eid].on('click', (e) => {
            setGeosActive(_eid);
            console.log(`@@  setActive`, e)
        });
        _osmmap.addLayer(_mapObjects.polyLines[_eid]);
    }

}


/**
 * 2024-01-02 TODO remove layer from geos? not from map layer
 * */

export function clearMap() {

    for (let i in _osmmap._layers) {

        if (_osmmap._layers[i]._path != undefined || _osmmap._layers[i]._latlng != undefined) {
            try {
                _osmmap.removeLayer(_osmmap._layers[i]);
            } catch (e) {
                // console.log("Can not remove with " + e + _osmmap._layers[i]);
            }
        }
    }
}

