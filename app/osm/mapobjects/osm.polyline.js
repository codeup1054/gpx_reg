import {_geos, _mapObjects} from "../../geodata/geo_model.js";



export function osmAllPolylines() {
    clearMap();

    let allPolyLinePoints = [];

    $.each(_geos, (k, v) => {
        if (v.meta.showPolyLine) {
            osmPolyline(v);
            allPolyLinePoints  = [...allPolyLinePoints, ...v.geojson];
        }
    });
    _osmmap.fitBounds(L.latLngBounds(allPolyLinePoints));
}


function osmPolyline(v)
{

    const _eid = v.id;

    // _mapObjects.polyLines[_eid] = new L.polyline(v.geojson, {color: v.meta.color});

    _mapObjects.polyLines[_eid] = addPolylineEditable(v.geojson, {color: v.meta.color, meta: {_eid: _eid} })

    // console.log(`@@  osmPolyline 333`, $(_mapObjects.polyLines[_eid]).data('events') , v, v.geojson);



    // _mapObjects.polyLines[_eid].on('editstop', ()=>
    //     {
    //         const polyLineData = _mapObjects.polyLines[_eid];
    //
    //         if (_geos[_eid].active ) {
    //             const points = polyLineData.getPoints();
    //             console.log(`@@  edit_stop`, polyLineData, polyLineData.options.meta._eid, _eid );
    //         }
    //     })

    _osmmap.addLayer(_mapObjects.polyLines[_eid]);

}

function clearMap() {
    
    console.log(`@@  clearMap()`);
    
    for(let i in _osmmap._layers) {
        if(_osmmap._layers[i]._path != undefined) {
            try {
                _osmmap.removeLayer(_osmmap._layers[i]);
            }
            catch(e) {
                console.log("problem with " + e + _osmmap._layers[i]);
            }
        }
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

    let polyline = L.Polyline.PolylineEditor(coordinates, polylineOptions).addTo(_osmmap);

    // _osmmap.fitBounds(polyline.getBounds());

    let dumpPoints = function() {
        let pointsTextArea = document.getElementById('pointsTextArea');
        pointsTextArea.innerHTML = '';
        _osmmap.getEditablePolylines().forEach(function(polyline) {
            let points = polyline.getPoints();
            points.forEach(function(point) {
                let latLng = point.getLatLng();
                console.log(point.context);
                pointsTextArea.innerHTML += 'originalPointNo=' + (point.context ? point.context.originalPointNo : null)
                    + ' originalPolylineNo=' + (point.context ? point.context.originalPolylineNo : null)
                    + ' (' + latLng.lat + ',' + latLng.lng + ')\n';
                + '\n';
            });
            pointsTextArea.innerHTML += '----------------------------------------------------------------------------------------------------\n';
        });
    };

    return polyline;
}



// let polyline = addPolylineEditable();

/* Check that markers are not left after the polyline is removed! */

let resetPolyline = function() {
    _osmmap.removeLayer(polyline);
    setTimeout(() => {
        polyline = addPolyline()
    }, 500);
};