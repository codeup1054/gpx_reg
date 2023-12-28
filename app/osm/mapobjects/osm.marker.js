// https://stackforgeeks.com/blog/geojson-or-polyline-element-move-refresh-posisition-on-zoom-or-drag-map
// https://github.com/tkrajina/leaflet-editable-polyline?tab=readme-ov-file

import {_geos, _mapObjects} from "../../geodata/geo_model.js";

export function osmMarkers()
{

    console.log(`@@  _osmmap 1`, _osmmap);

    const mark = [[55.696,37.353]];

    $.each(mark, (k, v) => {

        console.log(`@@  osmMarkers`, v);


        let path = L.polyline([
            [55.69,37.353],
            [55.696,37.35],
            [55.696,37.33],
            [55.66,37.353],
            [55.66,37.33]
        ], {
            color: 'red',
            opacity: 1.0
        }).addTo(_osmmap);


        let myIcon = L.divIcon({
            html: v,
            iconSize: [85, 17],
            iconAnchor: [0,17],
        });

        let  myMarker = L.marker(path.getLatLngs()[1], {
            icon: myIcon
        }).addTo(_osmmap);

        myMarker.on({
            mousedown: function() {
                _osmmap.on('mousemove', function(e) {
                    _osmmap.dragging.disable();
                    let point = path.closestLayerPoint(_osmmap.latLngToLayerPoint(e.latlng));
                    myMarker.setLatLng(_osmmap.layerPointToLatLng(point));
                });
            }
        });

        _osmmap.on('mouseup', function(e) {
            _osmmap.removeEventListener('mousemove');
            _osmmap.dragging.enable();
        });


    });

}
