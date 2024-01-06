import {_geos, _mapObjects} from "../../geodata/geo_model.js";
import {setGeosActive} from "../controls/osm.actions.js";
import {gpxPolylineEditable, showPathMilestones} from "./osm.polyline.editable.js";



export function osmAllPolyLines() {

    clearMap();

    let allPolyLinePoints = [];

    $.each(_geos, (k, v) => {
        if (v.meta.showPolyLine) {
            osmPolyline(v);
            allPolyLinePoints  = [...allPolyLinePoints, ...v.geojson]; // for fitBounds
        }
    });

    // alert('d');

    // _osmmap.fitBounds(L.latLngBounds(allPolyLinePoints));

}


/**
 2023-12-20 addPolylineEditable(coordinates, param)
 */


function osmPolyline(v)
{
    const _eid = v.id;

    if(v.meta.showPolyLineMilestones)    showPathMilestones(v.geojson, {color: v.meta.color, meta: {_eid: _eid}});


    if (v.active) {

        let polylineOptions = {
            newPolylineConfirmMessage: 'Add a new polyline here?',
            color:  v.meta.color,
            weight: 2,
            meta: {_eid: _eid}
        }

        _mapObjects.polyLines[_eid] = new gpxPolylineEditable(v.geojson, polylineOptions);
        _osmmap.addLayer(_mapObjects.polyLines[_eid]);
    }
    else {
        _mapObjects.polyLines[_eid] = L.polyline(v.geojson, {weight: 2,opacity: .8,color: v.meta.color}).addTo(_osmmap);
        _mapObjects.polyLines[_eid].on('click',(e)=> {
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

    for(let i in _osmmap._layers) {

        if(_osmmap._layers[i]._path != undefined || _osmmap._layers[i]._latlng != undefined) {
            try {
                _osmmap.removeLayer(_osmmap._layers[i]);
            }
            catch(e) {
                console.log("Can not remove with " + e + _osmmap._layers[i]);
            }
        }
    }
}

