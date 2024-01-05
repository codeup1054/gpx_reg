// 2023-12-28 https://github.com/FacilMap/Leaflet.DraggableLines

import {_geos, _mapObjects} from "../../geodata/geo_model.js";
import {geo_path_distance} from "../../lib/geo.js";
import {clearMap} from "./osm.polyline.js";

export class gpxPolylineEditable {
    constructor(latlngs, options) {
        let result = new L.Polyline(latlngs, options);

        this._e = _geos[options.meta._eid];
        this._options = options;
        this._eid = options.meta._eid;
        this._markers = [];
        this._points = latlngs;
        this._poliline = result;


        if (this._e.active) this.showMarkers();

        return result;
    }

    _reloadPolyline(pointNo) {
        this._poliline.setLatLngs(this._points);

    }

    showMarkers() {

        this._markers.map((p, i) => { _osmmap.removeLayer(p); });

        for (let i in _osmmap._layers) {
            try {
                if (_osmmap._layers[i].options.meta.type == 'new_marker') _osmmap.removeLayer(_osmmap._layers[i]);
            } catch (e) {
                console.log("Can not remove with " + e + _osmmap._layers[i]);
            }
        }

        this._points.map((p, i) => { this.showMarker(p, i); });


    }



    deleteMarker(pointIdx) {
        console.log(`@@  deleteMarker1`, pointIdx, this._points);

        this._points.splice(pointIdx, 1);
        console.log(`@@  deleteMarker2`, pointIdx, this._points);

        this._reloadPolyline();
        this.showMarkers();

        _osmmap.fire('updategeos');


    }

    showMarker(pp, pointNo) {
        let dist, svg_text, ll, ppp;

        let that = this;


        const distDir = _geos[this._eid].meta.distanceDirection;
        const pointCount = _geos[this._eid].length;

        ppp = this._points;

        if (distDir == 0) svg_text = '';
        else {
            if (distDir == 1) ll = ppp.slice(0, pointNo + 1);
            if (distDir == 2) ll = ppp.slice(pointNo, pointCount);

            dist = geo_path_distance(ll);
            svg_text = `<text x="10" y="7" class="svg_small" fill="${this._options.color}"> ${dist}</text>`;
        }

        const svgIcon = L.divIcon({
            html: `<svg title="${this._options.color} "  width="38" height="8" >
                             <title>${pointNo} | ${dist} \n ${pp[0].toFixed(4)},${pp[1].toFixed(4)}</title>
                             <circle cx="4"  cy="4" r="3" stroke="${this._options.color}" stroke-width="1" fill="${this._options.color}" fill-opacity=".3" stroke-opacity=".5"/>
                             ${svg_text}
                        </svg>`,
            className: "",
            iconAnchor: [4, 4],
        });

        const svgIconNew = L.divIcon({
            html: `<svg title="${this._options.color} "  width="8" height="8" >
                        <title>${pointNo}</title>
                        <circle cx="4"  cy="4" r="3" stroke="${this._options.color}" stroke-width="1" fill="${this._options.color}" fill-opacity=".1" stroke-opacity=".3"/>
                       </svg>`,
            className: "",
            iconAnchor: [4, 4],
        });

        // console.log(`@@ 77  this._addMarker`,pointNo, _geos[_eid].meta.distanceDirection);


        /**
         *  draw point addLayer
         */

        const pop = `<div _bt="delete_polyline_point" pointno="${pointNo} ">delete</div>`;

        let delItem = $(pop);

        delItem.on("click", () => {
            console.log(`@@  clixk`);
        });

        $('body').append(delItem);



        this._markers[pointNo] = L.marker(pp,
            {
                draggable: true,
                icon: svgIcon,
                meta: {pointNo: pointNo},
                contextmenu: true,
            }
        ).bindPopup(`N: ${pointNo} ${pop}`).on("popupopen", (ep) => {

            $(`[_bt="delete_polyline_point"]`).on("click", e => {
                // e.preventDefault();
                that.deleteMarker(pointNo);
            });

            console.log(`@@  ep.target()`, ep ) ;

            // ep.remove();

        });

        _osmmap.addLayer(this._markers[pointNo]);



        $(`[_bt="delete_polyline_point"]`).on('click', (event) => {
            const pointIdx = $(event.target).attr("pointIdx");
            console.log(`@@  11`, pointIdx);
            that._points.splice(pointIdx, 1);
        });

        /**
         *  move point
         */

        this._markers[pointNo].on('dragend contextmenu1', function (event) {
            // var marker = event.target;
            // setTimeout(function() {
            // }, 25);


            const marker = event.target;
            const n = marker.options.meta.pointNo;

            // console.log(`@@  event 1`, [n, marker, event, that._points]);

            if (event.type == 'dragend') that._points[n] = [marker._latlng.lat, marker._latlng.lng];

            if (event.type == 'contextmenu') {
                console.log(`@@  event  "${event.type}"`, marker);
                //
                // const popup = `${n}:<div _bt="delete_polyline_point" pointIdx="${n}">delete</div>`;
                //
                // const pop = marker.bindPopup(popup); // .openPopup();
                //
                // _osmmap.addLayer(pop);

                $(`[_bt="delete_polyline_point"]`).on('click', (event) => {
                        const pointIdx = $(event.target).attr("pointIdx");
                        console.log(`@@  11`, pointIdx);
                        that._points.splice(pointIdx, 1);
                    }
                )


            }

            that._reloadPolyline();
            that.showMarkers();
            _osmmap.fire('updategeos');


        });


        /**
         *  add new point
         */

        if (pointNo > 0) {
            let ppn = [(pp[0] + ppp[pointNo - 1][0]) / 2, (pp[1] + ppp[pointNo - 1][1]) / 2]
            let new_marker = L.marker(ppn, {draggable: true, icon: svgIconNew, meta: {pointNo: pointNo, type: 'new_marker'}});
            _osmmap.addLayer(new_marker);

            new_marker.on('dragend', function (event) {
                const marker = event.target;

                console.log(`@@  event N`, [marker, event]);

                that._points.splice(pointNo, 0, [marker._latlng.lat, marker._latlng.lng])
                that._reloadPolyline();
                _osmmap.fire('updategeos');
            });

        }

    }


}
