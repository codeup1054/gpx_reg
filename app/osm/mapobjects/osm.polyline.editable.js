// 2023-12-28 https://github.com/FacilMap/Leaflet.DraggableLines

import {_geos, _mapObjects} from "../../geodata/geo_model.js";
import {geo_path_distance} from "../../lib/geo.js";
import {clearMap} from "./osm.polyline.js";


function getTickDistance(v)
{
    v = 10**Math.floor(Math.log10(v*10))/20;

    return v;
}

export class gpxPolylineEditable {
    constructor(latlngs, options) {
        let result = new L.Polyline(latlngs, options);

        this._e = _geos[options.meta._eid];
        this._options = options;
        this._eid = options.meta._eid;
        this._markers = [];
        this._points = latlngs;
        this._poliline = result;


        const geo_pd = geo_path_distance(latlngs);
        const md = Number(_geos[this._eid].meta.mileage_distance) || 1;

        this._geo_path_distance = geo_pd;
        this._mileage_distance = (geo_pd/md > 200) ?  getTickDistance(geo_pd) : md;  // 2024-01-06 todo check ticks limit in path  < 100

        this._prev_milstone = this._mileage_distance;

        console.log(`@@  this._mileage_distance`,
            [
                this._mileage_distance,
                this._geo_path_distance,
                _geos[this._eid].meta.mileage_distance,
                getTickDistance(this._geo_path_distance),
                geo_pd/md
            ]);

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

        pp[0] = Number( pp[0]);
        pp[1] = Number( pp[1]);

        const distDir = _geos[this._eid].meta.distanceDirection;
        const pointCount = _geos[this._eid].length;

        ppp = this._points;






        /** 01.
         *  draw point addLayer
         */

        ll =  (distDir > 1)?  ppp.slice(pointNo, pointCount) : ppp.slice(0, pointNo + 1);
        dist = geo_path_distance(ll,2);

        svg_text = distDir ? `<text x="10" y="7" class="svg_small" fill="${this._options.color}"> ${dist}</text>` : '';


        const svgIcon = L.divIcon({
            html: `<svg title="${this._options.color} "  width="38" height="8" >
                             <title>${pointNo} | ${dist} | ${pp[0].toFixed(4)},${pp[1].toFixed(4)}</title>
                             <circle cx="4"  cy="4" r="3" stroke="${this._options.color}" stroke-width="1" fill="${this._options.color}" fill-opacity=".3" stroke-opacity=".5"/>
                             ${svg_text}
                        </svg>`,
            className: "",
            iconAnchor: [4, 4],
        });

        const svgIconNew = L.divIcon({
            html: `<svg title="${this._options.color} "  width="8" height="8" >
                        <title>New after ${pointNo} | ${dist}</title>
                        <circle cx="4"  cy="4" r="3" stroke="${this._options.color}" stroke-width="1" fill="${this._options.color}" fill-opacity=".1" stroke-opacity=".3"/>
                       </svg>`,
            className: "",
            iconAnchor: [4, 4],
        });

        // console.log(`@@ 77  this._addMarker`,pointNo, _geos[_eid].meta.distanceDirection);



        const pop = `<div _bt="delete_polyline_point" pointno="${pointNo} ">delete</div>`;


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


        /** 02.
         *  add milestones point
         *  add LayerGroup
         */



        if (pointNo>1) {

            const l_1 = ppp.slice(0, pointNo-1);
            const l_2 = ppp.slice(0, pointNo);

            const dist1 = geo_path_distance(l_1,2);
            const dist2 = geo_path_distance(l_2,2);

            while (this._prev_milstone >= dist1 && this._prev_milstone < dist2 ) {

                const a = ppp[pointNo-2];
                const b = ppp[pointNo-1];

                const dist_part = (this._prev_milstone - dist1) / (dist2-dist1);

                let ppn = [a[0] + (b[0] - a[0]) * dist_part, a[1] + (b[1] - a[1]) * dist_part];


                function angle(a, b) {
                    const  dx = b[0] - a[0];
                    const  dy = b[1] - a[1];
                    let theta = Math.atan2(dy *(1.1 - 1.06*(a[0]/90) ), dx); // range (-PI, PI]
                    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
                    return theta;
                }

                function angle360(a, b) {
                    var theta = angle(a, b); // range (-180, 180]
                    // if (theta < 0) theta = 360 + theta; // range [0, 360)
                    return theta;
                }



                let  theta = angle360(a, b);

                const accuracy = Math.log10(this._mileage_distance) < 0 ? 2:0;

                let tickDist = this._prev_milstone.toFixed(accuracy);

                svg_text = `<text x="11" y="8" class="svg_small" stroke=#fff stroke-width=2 fill=${this._options.color} >${tickDist}</text>`;

                // console.log(`@@  theta`, accuracy, tickDist);


                this._prev_milstone = this._prev_milstone + this._mileage_distance;


                // theta = 45;

                const svgIconMileStone = L.divIcon({
                    html: `<svg title="${this._options.color} " class="svg_tick" width="36" height="10" style="border: ${this._options.color} solid 0px;" transform="rotate(${theta}) translate(14,0)   ">
                        <title>Tick ${tickDist} ${a[0].toFixed(2)} ${a[1].toFixed(2)}</title>
<!--                        <circle cx="0"  cy="0" r="2" stroke=#fff stroke-width=2 fill=#f00 fill-opacity=".7" stroke-opacity=".3"/>-->
<!--                        <circle cx="6"  cy="6" r="2" stroke=#fff stroke-width=2 fill=#0a0 fill-opacity=".7" stroke-opacity=".3"/>-->
                        <rect x="0" y="5"  width="8" height="1" fill=${this._options.color} fill-opacity=".7" />
                        
                        ${svg_text}
                       </svg>`,
                    className: "",
                    iconAnchor: [18, 5],
                });

                let mileage_marker = L.marker(ppn, {
                    icon: svgIconMileStone,
                    meta: {pointNo: pointNo, type: 'new_marker'}
                });


                _osmmap.addLayer(mileage_marker);
            }
        }





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
