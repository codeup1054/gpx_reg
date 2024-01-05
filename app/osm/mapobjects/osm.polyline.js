import {_geos, _mapObjects} from "../../geodata/geo_model.js";
import {setGeosActive} from "../controls/osm.actions.js";
import {gpxPolylineEditable} from "./osm.polyline.editable.js";



export function osmAllPolyLines() {

    clearMap();

    let allPolyLinePoints = [];

    $.each(_geos, (k, v) => {
        if (v.meta.showPolyLine) {
            // console.log(`@@ 34 if (v.meta.showPolyLine)  `, v);
            osmPolyline(v);

            allPolyLinePoints  = [...allPolyLinePoints, ...v.geojson]; // for fitBounds
        }
    });

    // alert('d');

    // _osmmap.fitBounds(L.latLngBounds(allPolyLinePoints));

}


function osmPolyline(v)
{
    const _eid = v.id;

    if (v.active) {
        _mapObjects.polyLines[_eid] = addPolylineEditable(v.geojson, {color: v.meta.color, meta: {_eid: _eid}});
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


export function addPolylineEditable(coordinates, param) {
    /*
    L.tileLayer('tile.png', { maxZoom: 18, attribution: '...' }).addTo(map);
    */

    let polylineOptions = {
        // The user can add new polylines by clicking anywhere on the map:
        newPolylines: true,
        newPolylineConfirmMessage: 'Add a new polyline here?',
        // Show editable markers only if less than this number are in map bounds:
        maxMarkers: 300,
        color: param.color,
        weight: 2,
        meta: param.meta
    }

    let _polyline = new gpxPolylineEditable(coordinates, polylineOptions); //.addTo(_osmmap);

    // console.log(`@@ 76 addPolylineEditable `, polylineOptions);
    // _osmmap.fitBounds(_polyline.getBounds());

    return _polyline;
}



export function clearMap() {

    // console.log(`@@  clearMap()`);

    // 2024-01-02 TODO remove layer from geos? not from map layer

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


// let polyline = addPolylineEditable();

/* Check that markers are not left after the polyline is removed! */

let resetPolyline = function() {
    _osmmap.removeLayer(polyline);
    setTimeout(() => {
        polyline = addPolyline()
    }, 500);
};


// export function addPolylineEditable_2(coordinates, param) {
//     /*
//     L.tileLayer('tile.png', { maxZoom: 18, attribution: '...' }).addTo(map);
//     */
//
//     let polylineOptions = {
//         // The user can add new polylines by clicking anywhere on the map:
//         newPolylines: true,
//         newPolylineConfirmMessage: 'Add a new polyline here?',
//         // Show editable markers only if less than this number are in map bounds:
//         maxMarkers: 300,
//         color: param.color,
//         weight: 2,
//         meta: param.meta
//     }
//
//     let _polyline = L.Polyline.PolylineEditor(coordinates, polylineOptions); //.addTo(_osmmap);
//
//     // console.log(`@@ 76 addPolylineEditable `, polylineOptions);
//
//     // _osmmap.fitBounds(_polyline.getBounds());
//
//     let dumpPoints = function() {
//         let pointsTextArea = document.getElementById('pointsTextArea');
//         pointsTextArea.innerHTML = '';
//         _osmmap.getEditablePolylines().forEach(function(polyline) {
//             let points = polyline.getPoints();
//             points.forEach(function(point) {
//                 let latLng = point.getLatLng();
//                 console.log(point.context);
//                 pointsTextArea.innerHTML += 'originalPointNo=' + (point.context ? point.context.originalPointNo : null)
//                     + ' originalPolylineNo=' + (point.context ? point.context.originalPolylineNo : null)
//                     + ' (' + latLng.lat + ',' + latLng.lng + ')\n';
//                 + '\n';
//             });
//             pointsTextArea.innerHTML += '----------------------------------------------------------------------------------------------------\n';
//         });
//     };
//
//     return _polyline;
// }
