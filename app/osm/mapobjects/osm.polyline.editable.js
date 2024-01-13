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


        if (this._e.active) this.showMarkers();

        return result;
    }

    _reloadPolyline(pointNo) {
        this._poliline.setLatLngs(this._points);

    }

    /**
     * 2024-01-06 Remove only polyline and marker,leave mileage marker
     * */

    showMarkers() {

        // this._markers.map((p, i) => { _osmmap.removeLayer(p); });

        for (let i in _osmmap._layers) {
            try {
                if (_osmmap._layers[i].options.meta.type == 'new_marker') _osmmap.removeLayer(_osmmap._layers[i]);
            } catch (e) {
                // console.log("Can not remove with " + e + _osmmap._layers[i]);
            }
        }

        this._points.map((p, i) => {
            this.showMarker(p, i);
        });


    }



    deleteMarker(pointIdx) {
        console.log(`@@  deleteMarker1`, pointIdx, this._points);

        this._points.splice(pointIdx, 1);
        console.log(`@@  deleteMarker2`, pointIdx, this._points);

        this._reloadPolyline();
        this.showMarkers();

        _osmmap.fire('updategeos');


    }


    /** 01.
     *  draw point addLayer
     */


    showMarker(pp, pointNo) {
        let dist, svg_text, ll, ppp;

        let that = this;

        pp[0] = Number( pp[0]);
        pp[1] = Number( pp[1]);

        const distDir = _geos[this._eid].meta.distanceDirection;
        const pointCount = _geos[this._eid].length;

        ppp = this._points;




        ll =  (distDir > 1)?  ppp.slice(pointNo, pointCount) : ppp.slice(0, pointNo + 1);
        dist = geo_path_distance(ll,2);

        svg_text = distDir ? `<text x="10" y="7" class="svg_small" fill="${this._options.color}"> ${dist}</text>` : '';


        const svgIcon = L.divIcon({
            html: `<svg title="${this._options.color} "  width="38" height="8" >
                             <title>(${pointNo}) ${dist}км | ${pp[0].toFixed(4)},${pp[1].toFixed(4)}</title>
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



        const pop_delete_menu_item = `<div _bt="delete_polyline_point" pointno="${pointNo} ">delete</div>`;

        const pop_title = `(${pointNo}) ${dist}км <br> ${pp[0].toFixed(4)},${pp[1].toFixed(4)}`;

        this._markers[pointNo] = L.marker(pp,
            {
                draggable: true,
                icon: svgIcon,
                meta: {pointNo: pointNo},
                contextmenu: true,
            }
        ).bindPopup(`<div class=marker_popup><pop_h1>${pop_title}</pop_h1> ${pop_delete_menu_item}</div>`).on("popupopen", (ep) => {

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


export function showPathMilestones( points, param)
{
    /** 02.
     *  add milestones point
     *  add LayerGroup
     */

    const _eid = param.meta._eid;
    
    // console.log(`@@  333`, _eid, param, _geos[_eid]);
    
    const _geo_path_distance = geo_path_distance(points);
    let  _mileage_distance = Number(_geos[_eid].meta.mileage_distance) || 1;

    _mileage_distance = (_geo_path_distance/_mileage_distance > 200) ?  getTickDistance(_geo_path_distance) : _mileage_distance;  // 2024-01-06 todo check ticks limit in path  < 100

    let _prev_milestone = _mileage_distance;

    // console.log(`@@  this._mileage_distance`,
    //     [   param,
    //         _mileage_distance,
    //         _geo_path_distance,
    //         _geos[_eid].meta.mileage_distance
    //     ]);


    let svg_text, ppp;


    ppp = points;


    points.map((pp,pointNo) => {

        pp[0] = Number( pp[0]);
        pp[1] = Number( pp[1]);

    if (pointNo>1) {

        const l_1 = ppp.slice(0, pointNo-1);
        const l_2 = ppp.slice(0, pointNo);

        const dist1 = geo_path_distance(l_1,2);
        const dist2 = geo_path_distance(l_2,2);

        while (_prev_milestone >= dist1 && _prev_milestone < dist2 ) {

            const a = ppp[pointNo-2];
            const b = ppp[pointNo-1];

            const dist_part = (_prev_milestone - dist1) / (dist2-dist1);

            let ppn = [a[0] + (b[0] - a[0]) * dist_part, a[1] + (b[1] - a[1]) * dist_part];


            let  theta = angle360(a, b);

            const accuracy = Math.log10(_mileage_distance) < 0 ? 2:0;

            let tickDist = _prev_milestone.toFixed(accuracy);


            _prev_milestone += _mileage_distance;

            svg_text = `<text x="11" y="8" class="svg_small" stroke=#fff stroke-width=2 fill=${param.color} >${tickDist}</text>`;


            const svgIconMileStone = L.divIcon({
                html: `<svg title="${param.color} " class="svg_tick" width="36" height="10" style="border: ${param.color} solid 0px;" transform="rotate(${theta}) translate(14,0)   ">
                        <title>Tick ${tickDist} ${a[0].toFixed(2)} ${a[1].toFixed(2)}</title>
                        <rect x="0" y="5"  width="8" height="1" fill=${param.color} fill-opacity=".7" />
                        
                        ${svg_text}
                       </svg>`,
                className: "",
                iconAnchor: [18, 5],
            });

            let mileage_marker = L.marker(ppn, {
                icon: svgIconMileStone,
                meta: {pointNo: pointNo, type: 'mileage_marker'}
            });

            _osmmap.addLayer(mileage_marker);
        }


/**
 * Last mileage marker
 * */


        const tickDist = geo_path_distance(points,2)
        const penultimatePoint = points[points.length-2];
        const lastPoint = points[points.length-1];


        svg_text = `<text x="11" y="8" class="svg_small" stroke=#fff stroke-width=2 fill=${param.color} >${tickDist}</text>`;

        const theta = angle360(penultimatePoint, lastPoint);


        const svgIconMileStone = L.divIcon({
            html: `<svg title="${param.color} " class="svg_tick" width="36" height="10" style="border: ${param.color} solid 0px;" transform="rotate(${theta}) translate(14,0)   ">
                        <title>Tick ${tickDist} ${lastPoint[0].toFixed(2)} ${lastPoint[1].toFixed(2)}</title>
<!--                        <polygon  y="5" points="0,5 5,2 5,8" class="triangle" fill=${param.color} fill-opacity=".3" />-->
                        <rect x="0" y="3"  width="8" height="3" fill="${param.color}" fill-opacity=".01" />
                        ${svg_text}
                       </svg>`,
            className: "",
            iconAnchor: [18, 5],
        });


        let mileage_marker = L.marker(lastPoint, { icon: svgIconMileStone });

        _osmmap.addLayer(mileage_marker);

        }
    });
}


function angle(a, b) {
    const  dx = b[0] - a[0];
    const  dy = b[1] - a[1];
    let theta = Math.atan2(dy *(1.1 - 1.06*(Math.abs(a[0]/90) )), dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    return theta;
}

function angle360(a, b) {
    let theta = angle(a, b); // range (-180, 180]
    // if (theta < 0) theta = 360 + theta; // range [0, 360)
    return theta;
}
