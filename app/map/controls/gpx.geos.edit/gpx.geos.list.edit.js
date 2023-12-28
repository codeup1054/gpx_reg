// 2023-10-07 add Geos form
// 2023-09-28 https://github.com/zhenyanghua/MeasureTool-GoogleMaps-V3
// 2023-09-27  https://www.youtube.com/watch?v=nUdt9aMcg0M

import {_mapObjects, _geos, _appState, _stateControl} from "/app/geodata/geo_model.js";
import {editGeoForm} from '/app/map/controls/gpx.geos.edit/gpx.geos.form.js';
import {altitudeColor, geo_distance} from '/app/lib/geo.js';

export function polylineTools() {

    let mapCtrl = document.createElement("div");
    mapCtrl.setAttribute("id", "polylineTools");
    mapCtrl.classList.add("custom-map-control");
    mapCtrl.classList.add("hflex");
    mapCtrl.classList.add("vflex");

    let addPolyLineButton = document.createElement("button");
    addPolyLineButton.addEventListener("click", createPolyLine);
    addPolyLineButton.innerHTML = '+';
    mapCtrl.appendChild(addPolyLineButton);

    addPolyLineButton = document.createElement("button");
    addPolyLineButton.innerHTML = '_geos';
    addPolyLineButton.addEventListener("click", function () {
        console.log("@@ 100 *** GEOS", _geos, _appState)
    });
    mapCtrl.appendChild(addPolyLineButton);


    let polyLineTable = document.createElement("table");
    polyLineTable.setAttribute("id", "polyLineTable");
    polyLineTable.classList.add("stab");

    mapCtrl.appendChild(polyLineTable);

    getGeos();

    waitElement("#polylineTools", 1, initGeoEdit, 0)
    return mapCtrl;

}

function waitElement(selector, time, callback = initGeoEdit, lap = 0) {
    if (document.querySelector(selector) != null) {
        callback();
        return;
    } else {
        setTimeout(function () {
            waitElement(selector, time, callback, lap + 1);
        }, time);
    }
}


function zoom_polyline(_eid) {
    _mapObjects.polyLines[_eid].setMap(_map);
    const polyBound = _mapObjects.polyLines[_eid].getBounds();
    // center = bounds.getCenter();
    _map.fitBounds(polyBound);
}


function initGeoEdit()
{
    drawPolyLineTable();
    addMapListener();
    showPolyLineOnMap();
    distanceMarker();
    // waitElement("#polyLineTable", 1, addAction, 0)
}

function drawPolyLineTable(callback = addAction) {

    let rows = `<tr>
        <td>ID</td>
        <td>E</td>
        <td>📈</td>
        <td>▶</td>
        <td>Name</td>
        <td>Описание</td>
        <td>Инфо</td>
        <td>Действие</td>
        </tr>`;


    let no_sorted_by_key = [];
    for (let el in _geos) {
        no_sorted_by_key.push([_geos[el][_appState.key_sort], el]);
    }

    const sorted_by_key = no_sorted_by_key.sort((a, b) =>
        a<b ? _appState.sort_direction : -_appState.sort_direction );

    // console.log("@@ 22 sortable  ",no_sorted_by_key, sorted_by_key);

    // Object.keys(_geos).map((k, i) => {
    sorted_by_key.map((sorted, i) => {
            const k = sorted[1];
            const e = _geos[k];
            // console.log("@@ _geos[k]",k,e);
            let segs = [];
            for (let i = 0; i < e.geojson.length - 1; i++) {
                segs.push(geo_distance(e.geojson[i], e.geojson[i + 1]));
            }

            const polyLen = segs.reduce((a, b) => a + b, 0).toFixed(3);

            rows += `<tr _eid="${e.id}" 
                                     _et="polyline"
                                     class = ${_geos[k].active ? 'selected' : ''} 
                                     >
                                     <td align="right" >
                                        ${e.id}&nbsp
                                        <div style="background-color: ${e.meta.color}; display: inline-block; width: 7px; height: 10px;">&nbsp</div></td>
                                     <td>
                                        <input _cn = "show_polyline"  
                                               type="checkbox" 
                                               ${_geos[k].meta.showPolyLine ? 'checked' : ''} >
                                     </td>
                                     <td>
                                        <input _cn = "show_polyline_elevation"  
                                               type="checkbox" 
                                               ${_geos[k].meta.showPolyLineElevation ? 'checked' : ''} >
                                     </td>
                                     <td style="vertical-align: middle; ">
                                        <div _bt="distance_direction"></div>
                                     </td>
                                     <td><div _efn="name">${e.name}</div></td>
                                     <td><div _efn="meta.desc">${e.meta.desc}</div></td>
                                     <td>
                                        ${e.geojson.length} | <span _cn = "polyLen" >${polyLen} км</span>
                                     </td>
                                     <td>
                                        <!-- <button _bt="geo_cancel">&#10060;</button> -->
                                        <button _bt="geo_find">&#128269;</button>
                                        <button _bt="geo_edit">&#9998;</button>
                                        <button _bt="geo_save">&#9989;</button>

                                     </td>
                                 </tr>
                                `;

//https://htmlweb.ru/html/symbols.php  special symbols

        });

    $("#polyLineTable").html(rows);

    if(callback) callback();

    // console.log("@@ polylineList _geos e =", _geos);
}




function setActive(_eid,e = null){

    Object.keys(_geos).map((k, i) => {
        if (k == _eid) {
            _geos[k].active = !_geos[k].active;
            _geos[k].meta.showPolyLine = true;
        } else
            _geos[k].active = false;
    });

    $('[_eid]').removeClass('selected');

    if(_geos[_eid].active) {
        $(`[_eid=${_eid}]`).addClass('selected');
        $(`[_eid=${_eid}] td [_cn="show_polyline"]`).prop('checked', true);
        showPolyLineOnMap();
    }

    if (e) e.stopPropagation();

    // console.log("@@ Set Active",_geos[_eid]);
}


function addMapListener()
{
    // 05. 2023-10-07 add point on polyline

    google.maps.event.addListener(_map, "click", (e) => {
        const findActive = Object.entries(_geos).find(item => item[1].active == true)

        console.log("@@ 07. click Map",e.latLng, findActive);

        if (findActive !== undefined)
        {
            const id = findActive[0];
            _geos[id].geojson.push([e.latLng.lat(), e.latLng.lng()]);
            // showPolyLineOnMap();
            // drawPolyLineTable();
            // showDistance();
        }
    });
}


let action = {
    geo_save:   function (_eid) {        updateGeos(_geos[_eid]);    },
    geo_cancel: function (_eid) {        console.log("@@ _action cancel", _eid)    },
    geo_find:   function (_eid) {        zoom_polyline(_eid);    },
    geo_edit:   function (_eid) {        editGeoForm(_eid);    },
    distance_direction: function (_eid) {
        // _geos[_eid]['meta']['distanceDirection'] ??= 0 ;
        let _state = _geos[_eid]['meta']['distanceDirection'] == undefined ? 0 : (_geos[_eid]['meta']['distanceDirection'] +=1 ) %3;

        _geos[_eid]['meta']['distanceDirection'] = _state ;
        let _efield = document.querySelectorAll(`[_eid = "${_eid}"] [_bt = "distance_direction"]`);

        [..._efield].map(el => setStateControl(el, _state ));
        console.log("@@ 99 _state ",_state);
        distanceMarker();
    }
}

function setStateControl(el, _state=0)
{
    el.innerHTML                = _stateControl[_state].icon;
    el.style.backgroundColor    = _stateControl[_state].backgroundColor;
    el.style.borderColor        = _stateControl[_state].borderColor;
    el.style.color              = _stateControl[_state].color;
}


export function addAction() {

    // 04. 2023-10-05 select row and set mapGeo active
        $('[_eid]').on('click', function (e) {
            const _eid = $(this).closest('[_eid]').attr('_eid');
            setActive(_eid, e);
        });

    // 03. 2023-10-05 show on map check box
        $('[_cn="show_polyline"]').on('click', function (e) {
            const _eid = $(this).closest('[_eid]').attr('_eid');

            Object.keys(_geos).map((k, i) => {
                if (k == _eid) _geos[k].meta.showPolyLine = $(this).prop('checked');
            });

            e.stopPropagation();
            showPolyLineOnMap();
            // mapObjects.polyLines[_eid].setMap(_geos[_eid].showOnMap? map : null);
        });

    // 04. 2023-12-04 show elevation on map
    $('[_cn="show_polyline_elevation"]').on('click', function (e) {
        const _eid = $(this).closest('[_eid]').attr('_eid');

        Object.keys(_geos).map((k, i) => {
            if (k == _eid) _geos[k].meta.showPolyLineElevation = $(this).prop('checked');
        });

        e.stopPropagation();
        showPolyLineElevationOnMap();
        // mapObjects.polyLines[_eid].setMap(_geos[_eid].showOnMap? map : null);
    });



    $('[_cn="show_distance"]').on('click', function (e) {
        const _eid = $(this).closest('[_eid]').attr('_eid');

        Object.keys(_geos).map((k, i) => {
            if (k == _eid) _geos[k].showDistance = $(this).prop('checked');
        });

        e.stopPropagation();
        distanceMarker();
        // mapObjects.polyLines[_eid].setMap(_geos[_eid].showOnMap? map : null);
    });


    // $('[_cn="distance_direction"]').on('click', function (e) {
    //     const _eid = $(this).closest('[_eid]').attr('_eid');
    //
    //     Object.keys(_geos).map((k, i) => {
    //         if (k == _eid) _geos[k].distanceDirection = $(this).prop('checked');
    //     });
    //
    //     e.stopPropagation();
    //     distanceMarker();
    //     // mapObjects.polyLines[_eid].setMap(_geos[_eid].showOnMap? map : null);
    // });



    // 02. editable fields

    let _efield = document.querySelectorAll('[_efn]');

    // console.log("@@ 88 _efield", _efield);


    [..._efield].map((e, i) => {

        const _eid = e.closest('[_eid]').getAttribute('_eid');

        if (e.getAttribute('listener') !== 'true') {

            e.addEventListener('click', function (e) {
                this.contentEditable = true;
                this.focus();
                e.stopPropagation();
            });

            e.addEventListener('blur', function () {

                // let _eFields = document.querySelectorAll(`[_eid="${_eid}"] [_efn]`);

                const attr = e.getAttribute('_efn');
                const dataToGeos = {};
                // [..._eFields].map((e) => {
                //     const cols = `["${e.getAttribute('_efn').split('.').join('"]["')}"]`;
                //
                //
                //     const eval_str = `_geos${cols}="${e.innerText}"`
                //     console.log("@@ eval_str",eval_str);
                //
                //
                //     dataToGeos[e.getAttribute('_efn')] = e.innerText + cols;
                // })

                const cols = `["${e.getAttribute('_efn').split('.').join('"]["')}"]`;
                const eval_str = `_geos[${_eid}]${cols}="${e.innerText}"`
                eval (eval_str);

                // _geos[_eid].desc = e.innerText;
                console.log("@@ blur", _eid, eval_str,  attr, dataToGeos, _geos);
            });

            e.addEventListener('keyup', function () {
                console.log("@@ keyup");
            });
        }
        // e.addEventListener('paste',function() {console.log("@@ paste"); });
        // e.addEventListener('input',function() {console.log("@@ input"); });

        // console.log("@@ _efn", e, _eid, e.innerText, e.getAttribute('listener') !== 'true');
    })


// 01. 2023-10-05 actions


    let _btn = document.querySelectorAll('[_bt]');

    // console.log("@@ _btn",_btn, _efield);

    [..._btn].map((e, i) => {

        const _eid = e.closest('[_eid]').getAttribute('_eid');
        const _bt = e.getAttribute('_bt');
        const evList = e.getAttribute('listener');

        /** prepare button */

        if (_bt == "distance_direction") {
            // console.log("@@ 33 ",_bt, _geos[_eid].meta.distanceDirection );
            setStateControl(e, _geos[_eid].meta.distanceDirection);
        }

        /** add action to button */
        
        if (evList !== 'true') {
            e.addEventListener('click', function (event) {
                console.log("@@ 77 click to _eid", _eid,  _bt);
                action[_bt](_eid);
                event.stopPropagation();
            });
        }
    })

}




function showPolyLineOnMap() {

    Object.keys(_geos).map((id) => {
        // console.log("@@ 01. showPolyLineOnMap", id, _geos, mapObjects.polyLines[id]);

        if (_geos[id].meta.showPolyLine) {
            if (_mapObjects.polyLines[id] !== undefined)
                _mapObjects.polyLines[id].setMap(null);

            if (_mapObjects.polyLines[id] === undefined || 1) {
                let polyOption = {
                    geodesic: true,
                    strokeColor: _geos[id].meta.color,
                    strokeWeight: 3,
                    map:_map,
                    title: _geos[id].name,
                    path: _geos[id].geojson.map(p => {
                        return {lat: p[0], lng: p[1]}
                    })
                };

                _mapObjects.polyLines[id] = new google.maps.Polyline(polyOption);
                _mapObjects.polyLines[id].setEditable(_geos[id].active);

                let total_distance = 0;
                let _pts = _geos[id].geojson;

                _pts.map((p,i)=> {
                    if (i>0)  total_distance  +=  geo_distance(_pts[i-1], _pts[i]);
                });


                // const infoText = `${_geos[id].name}</br>
                //                 [${_geos[id].geojson.length}] - ${total_distance.toFixed(3)} km</br>
                //                 <a onclick="removeMarker(${id},0);">Удалить</a>`;
                //
                // let infoWindow = new google.maps.InfoWindow({
                //     pixelOffset: new google.maps.Size(0, -7),
                //     content: infoText
                // });
                //
                // //'mouseover'
                //
                // google.maps.event.addListener(_mapObjects.polyLines[id], 'click', function(e) {
                //     infoWindow.setPosition(e.latLng);
                //     infoWindow.open(_map);
                // });
// // Close the InfoWindow on mouseout:
//                 google.maps.event.addListener(_mapObjects.polyLines[id], 'mouseout', function() {
//                     infoWindow.close();
//                 });


                _mapObjects.polyLines[id].addListener("click", (e) => {
                    // console.log("@@ polyLines click");
                    setActive(id,false);
                });


                const elevator = new google.maps.ElevationService();
                let polyPath;


                ['remove_at', 'set_at', 'dragend',"insert_at"].map((event) => {
                        _mapObjects.polyLines[id].getPath().addListener(event, e => {

                            polyPath = _mapObjects.polyLines[id].getPath().getArray();

                            _geos[id].geojson = polyPath.map((p,i) => {
                                return [p.lat(), p.lng()];
                            });

                            // console.log(`@@ elevator=${elevator}, polyPath = ${polyPath}`);

                            elevator.getElevationAlongPath({
                                    path: polyPath,
                                    samples: 512,
                                })
                                .then(({results}) => {
                                    _geos[id].path_elevation = results.map((r,i) => {
                                        return {elevation:r.elevation, lat:r.location.lat(), lng: r.location.lng()};
                                    });

                                    console.log(`@@ showPolyLineOnMap event "${event}":`, _geos[id]);
                                    drawPolyLineTable();
                                    distanceMarker();
                                    showPolyLineElevationOnMap();
                                })
                                // .catch((e) => {
                                //     // Show the error code inside the chartDiv.
                                //     console.log("@@ ", `Cannot show elevation: request failed because "${e}"`);
                                // });

                        })
                    }
                );

            }

            else
            {console.log("@@ else ",id, _mapObjects.polyLines[id].getPath().length);}

            // console.log("@@ 11 geoLayers.mapPolylines[id]", id, newPoly);

        } else {
            if (_mapObjects.polyLines[id] !== undefined)
                _mapObjects.polyLines[id].setMap(null);
        }


    });    // >>> Object.keys()


} //>>> showPolyLineOnMap


// 2023-12-04 Elevation

function showPolyLineElevationOnMap() {

    Object.keys(_geos).map((id) => {
        // console.log("@@ 01. showPolyLineOnMap", id, _mapObjects.polyElevations);

        let mapElv;

        _mapObjects.polyElevations = _mapObjects.polyElevations !== undefined ? _mapObjects.polyElevations : {};

        if (_mapObjects.polyElevations[id] !== undefined) {
            mapElv = _mapObjects.polyElevations[id];
            // console.log(`@@ _mapObjects.polyElevations[id]=`, mapElv, _mapObjects.polyElevations[id]);
            Object.keys(mapElv).map(k => mapElv[k].setMap(null));
        }


        if (_geos[id].meta.showPolyLineElevation && _geos[id].path_elevation !== undefined) {
                let polyOption = {};
                let elevationPoints = _geos[id].path_elevation

                // console.log(`@@ showPolyLineElevationOnMap _geos[id]=`, _geos[id]);
                // console.log(`@@ showPolyLineElevationOnMap elevationPoints=`, _mapObjects, elevationPoints);

                _mapObjects.polyElevations[id] = {};

                elevationPoints.map((p,i) => {
                    if(i>1) {
                        // console.log("@@ path_elevation.map", p, i);

                        const elevationSegment = [
                            {lat: elevationPoints[i - 1].lat, lng: elevationPoints[i - 1].lng},
                            {lat: elevationPoints[i].lat, lng: elevationPoints[i].lng}
                        ]

                        const colorTreasholds = [
                            120, 130, 140, 160,
                            170, 180, 190, 200,
                            210, 220]

                        const colors = ['#550099', '#0040FF', '#00aaFF', '#00CCB0',
                            '#00C000', '#80FF00', '#FFFF00', '#FFC000',
                            '#FF0000', '#880066', '#411100']

                        const strokeColor = altitudeColor(elevationPoints[i - 1].elevation, colorTreasholds, colors)+'77';

                        // i % 2 ? "#ff0000aa" : "#ffbb00aa"

                        polyOption = {
                            geodesic: true,
                            strokeColor: strokeColor,
                            strokeWeight: 10,
                            map: _map,
                            path: elevationSegment,
                        };

                        _mapObjects.polyElevations[id][i] = new google.maps.Polyline(polyOption);

                        let infoWindow = new google.maps.InfoWindow({
                            pixelOffset: new google.maps.Size(0, -7),
                        });

                        // const cont = `elevation = ${elevationPoints[i - 1].elevation}, ${strokeColor}`;
                        const pointInfo = elevationPoints[i - 1].elevation.toFixed(0) +
                            `, ${elevationPoints[i - 1].lat.toFixed(4)} ${elevationPoints[i - 1].lng.toFixed(4)} `;

                        google.maps.event.addListener(_mapObjects.polyElevations[id][i] , 'mouseover', function(e) {
                            infoWindow.setPosition(e.latLng);
                            infoWindow.setContent(pointInfo);
                            infoWindow.open(_map);
                        });

// Close the InfoWindow on mouseout:
                        google.maps.event.addListener(_mapObjects.polyElevations[id][i] , 'mouseout', function() {
                            infoWindow.close();
                        });

                    }
                })
            }

            else
            {
                // console.log(`@@ showPolyLineElevation for ${id} :` , _geos[id].meta.showPolyLineElevation);
            }

            // console.log("@@ 11 geoLayers.mapPolylines[id]", id, newPoly);

    });    // >>> Object.keys()


} //>>> showPolyLineOnMap


function createPolyLine() {

    const new_id = Math.max(...Object.keys(_geos).map(k => _geos[k].id))+1

    _geos[new_id] = {
        id: new_id,
        name: `new ${new_id}`,
        desc: `Описание ${new_id}`,
        meta: {
            color: '#ff22bbaa',
            distanceDirection: 1,
            showPolyLine: true,
        },
        geojson: [],
        active: true
    }

    // drawPolyLineTable();
    // setActive(id);

    let polyOption = {
        geodesic: true,
        strokeColor: '#ff22bbaa',
        strokeOpacity: 0.9,
        strokeWeight: 3,
        map:_map,
        editable: true
    }

    console.log("@@ 02 polyOption, newGeosPoly", _geos, new_id, polyOption);

    drawPolyLineTable();

    google.maps.event.addListener(_map, "click", (e) => {
        console.log("@@ 07 click",e.latLng);
        // const id = Object.entries(_geos).find(item => item[1].active == true)[0];

        _geos[new_id].geojson.push([e.latLng.lat(), e.latLng.lng()]);
        showPolyLineOnMap();
        drawPolyLineTable();
        distanceMarker();
    });



}


function removeMarker(id,i)
{
    // id = polyline id
    // i = marker id
    console.log("@@ remove marker",id,i);

    _mapObjects.markers[id][i].setMap(null);
    _mapObjects.markers[id].splice(i, 1);
    _geos[id].geojson.splice(i, 1);
    _mapObjects.polyLines[id].getPath().removeAt(i);

}


function distanceMarker()
{
    let po;
    let dist = 0;
    // let total_dist = 0;
    // console.log("@@ 75 distanceMarker");

    Object.keys(_mapObjects.markers).map(id => {
            if(_mapObjects.markers[id] !== undefined) {
                _mapObjects.markers[id].map(i => i.setMap(null));  // remove all marker
                _mapObjects.markers[id] = [];
            }
        });

    Object.keys(_geos).map(id => {

        const distanceDirection = _geos[id].meta.distanceDirection;

        if ( distanceDirection > 0) {
            _mapObjects.markers[id] ??= [];
            const distPnts = distanceDirection == 2 ? _geos[id].geojson.reverse(): _geos[id].geojson;
            // console.log("@@ 75.1 distanceMarker", distPnts, distanceDirection);
            let total_dist = 0;


//  global elevation service

        function getElevation(location, infowindow) {
            // Initiate the location request
            const cont = infowindow.getContent();

            _elevator
                .getElevationForLocations({
                    locations: [location],
                })
                .then(({ results }) => {
                    infowindow.setPosition(location);
                    // Retrieve the first result
                    if (results[0]) {
                        // Open the infowindow indicating the elevation at the clicked position.
                        infowindow.setContent(cont  +  "<br>" + results[0].elevation );
                    } else {
                        infowindow.setContent(cont  +   "No elevation found");
                    }
                })
                .catch((e) =>
                    infowindow.setContent("Elevation service failed due to: " + e)
                );
        }


            distPnts.map((p,i) => {
                    if (i > 0) total_dist += geo_distance(po,p);
                    po = p;
                    // console.log("@@ >>> mileage_markers()",id, _geos[id], mapObjects.markers[id]);

                    const svg_width = total_dist.toFixed(2).length*8;

                    const svg = `<?xml version="1.0"?>
                    <svg width="${svg_width}px" height="15px" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <text x="5" y="14" 
                        font-size="12" 
                        font-family="Helvetica, sans-serif"
                        style="
                        font-weight:bold;
                        paint-order: stroke;
                        fill:${_geos[id].meta.color};
                        stroke:rgb(255,255,255);
                        stroke-width:2;">${total_dist.toFixed(2)}</text>
                    </svg>`;

                    const svg_icon = {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
                        anchor: new google.maps.Point(7, 22),
                    }

                    let markerOption = {
                        position: {lat: p[0], lng: p[1]},
                        map: _map,
                        title: `${p[0].toFixed(3)}, ${p[1].toFixed(3)}`, // {total_dist.toFixed(2)},
                        icon: svg_icon,
                        total_dist: total_dist
                    }

                    const marker = new google.maps.Marker(markerOption);

                    _mapObjects.markers[id].push( marker);

                    google.maps.event.addListener(marker, 'click', function (event) {

                        const infoText = `${marker.total_dist.toFixed(2)}км</br>
                                    ${marker.position.lat().toFixed(4)}, ${marker.position.lng().toFixed(4)}</br>
                                <a id="m${id}_${i}">Удалить</a>`;

                        let infoWindow = new google.maps.InfoWindow({
                            pixelOffset: new google.maps.Size(0, -7),
                            content: infoText
                        });

                        infoWindow.setPosition({lat: p[0], lng: p[1]});
                        infoWindow.open(_map);

                        google.maps.event.addListener(infoWindow, 'domready', function() {
                            document.getElementById(`m${id}_${i}`)
                                    .addEventListener("click", function(e) {
                                removeMarker(id, i);
                                infoWindow.close();
                            });
                        });

                        //'mouseover'

                        // removeMarker(id,i);
                    });
            })
        } // if (_geos[id].distanceDirection > 0)
    });




    // let id = Object.entries(_geos).find(item => item[1].showDistance == true);
    //
    // id = id !== undefined? id[0]:1;

}




export function getGeos() {
    let xhr = new XMLHttpRequest();

    let body = {
        action: 'getgeos',
        verbose: true,
        whe: "",
        sort: " order by tm_modified desc"
    };

    xhr.open("POST", '/api/geos.php', true);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

    const res = xhr.send(JSON.stringify(body));

    xhr.onreadystatechange = function () {
        if (this.readyState != 4) return;

        const resp =  JSON.parse(this.responseText);

        // let _geosОbj = {...resp.result.data}.map((v,k) => v.id:v )

        let _geosОbj =  [...resp.result.data].map((o, v) => _geos[o.id] = o );

        console.log("@@ 33 ***  get Geos", _geosОbj, resp.result.data, _geos); //resp.result.data );

        // _geos[10] = _geosОbj;

        // return _geos;
    }
}


export function getGeosJQ(callback=false) {

    let body = {
        action: 'getgeos',
        verbose: true,
        whe: "",
        sort: " order by tm_modified desc"
    };

    $.post('/api/geos.php', body, (res)=>{
        console.log(`@@  res=`, res);

        // const resp =  JSON.parse(res);
        const resp =  res;

        let _geosОbj =  [...resp.result.data].map((o, v) => _geos[o.id] = o );
        console.log("@@ 33 ***  get Geos", _geosОbj, resp.result.data, _geos); //resp.result.data );
        if(callback) callback();

    })
        .done( ()=> console.log(`@@ geos.list done `))
        .fail(() => console.log(`@@  fail`))

}



function apiRequest(req) {
    let xhr = new XMLHttpRequest();

    xhr.open(req.method, '/api/geos.php', true);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

    const res = xhr.send(JSON.stringify(body));

    xhr.onreadystatechange = function () {
        if (this.readyState != 4) return;
        console.log("@@ POST Geos res", this.responseText);
    }

}




function updateGeos(geodata) {
    let xhr = new XMLHttpRequest();

    console.log("@@ update Geos");

    let body = {
        action: 'geos_create_update',
        verbose: true,
        data: {
            id: 1,
            desc: 'текст описания',
            geotype: 'polyline',
            geodata: geodata
        }
    };

    xhr.open("POST", '/api/geos.php', true);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

    const res = xhr.send(JSON.stringify(body));

    xhr.onreadystatechange = function () {
        if (this.readyState != 4) return;
        // console.log("@@ 01 POST Update Geos\n", this.responseText );
        console.log("@@ 02 POST Update Geos\n", JSON.parse(this.responseText) );
    }

}


