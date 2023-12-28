// 2023-12-28 https://github.com/FacilMap/Leaflet.DraggableLines

import {_geos, _mapObjects} from "../../geodata/geo_model.js";


export function addPolylineEditable(coordinates, param) {
    /*
    L.tileLayer('tile.png', { maxZoom: 18, attribution: '...' }).addTo(map);
    */


    console.log(`@@  _osmmap`, _osmmap);

    // let osmUrl='http://{s}.tile.openstreet_osmmap.org/{z}/{x}/{y}.png';
    // let osmAttrib='Map data © OpenStreetMap contributors';


    // L.tileLayer(osmUrl, {minZoom: 0, maxZoom: 15, attribution: osmAttrib}).addTo(_osmmap);

    let coordinates = [
        [55.6750072361, 37.3187695503],
        [55.6757622049, 37.3198746204],
        [55.6763963762, 37.3197780609],
        [55.6787216541, 37.3263333797],
        [55.6787216812, 37.32808218],
        [55.6776703394, 37.3291487239],
        [55.6746230524, 37.3283730778],
        [55.6739752209, 37.327448813],
        [55.6735003071, 37.3272656303],
        [55.6732175518, 37.3276246501],
        [55.6721955264, 37.3278538799],
        [55.6714755129, 37.3272248028],
        [55.6717871648, 37.3257949873],
        [55.6728658637, 37.3252000246],
        [55.6737827215, 37.3252887813],
        [55.6744277756, 37.3251200459],
        [55.6747125506, 37.3229381908],
        [55.6746349263, 37.3213142352],
        [55.6749326769, 37.3207699906],
        [55.6756791761, 37.3202823162]
    ];

    let polylineOptions = {
        // The user can add new polylines by clicking anywhere on the map:
        newPolylines: true,
        newPolylineConfirmMessage: 'Add a new polyline here?',
        // Show editable markers only if less than this number are in map bounds:
        maxMarkers: 100
    }

    let polyline = L.Polyline.PolylineEditor(coordinates, polylineOptions).addTo(_osmmap);
    _osmmap.fitBounds(polyline.getBounds());

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