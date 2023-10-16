// 2023-10-07 add Geos form
// 2023-09-28 https://github.com/zhenyanghua/MeasureTool-GoogleMaps-V3
// 2023-09-27  https://www.youtube.com/watch?v=nUdt9aMcg0M

import {mapObjects, _geos, appState}  from "/app/geodata/geo_model.js";
import {editGeoForm} from '/app/map/controls/gpx.geos.edit/gpx.geos.form.js';
import {geo_distance} from '/app/lib/geo.js';

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
        console.log("@@ 65 button", _geos)
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
    console.log("@@ polyBound 1 =", _map, _param);
    mapObjects.polyLines[_eid].setMap(_map);
    const polyBound = mapObjects.polyLines[_eid].getBounds();
    console.log("@@ polyBound 2 =", polyBound, this);
    // center = bounds.getCenter();
    _map.fitBounds(polyBound);
}


function initGeoEdit()
{
    drawPolyLineTable();
    addMapListener();
    showPolyLineOnMap();
    showDistance();
    // waitElement("#polyLineTable", 1, addAction, 0)
}

function drawPolyLineTable(callback = addAction) {

    let rows = `<tr>
        <td>ID</td>
        <td>P</td>
        <td>D</td>
        <td>Name</td>
        <td>Описание</td>
        <td>Настр</td>
        <td>Точек</td>
        <td>Длина</td>
        <td>Действие</td>
        </tr>`;


    let no_sorted_by_key = [];
    for (let el in _geos) {
        no_sorted_by_key.push([_geos[el][appState.key_sort], el]);
    }

    const sorted_by_key = no_sorted_by_key.sort((a, b) =>
        a<b ? appState.sort_direction : -appState.sort_direction );

    console.log("@@ 22 sortable  ",no_sorted_by_key, sorted_by_key);

    // Object.keys(_geos).map((k, i) => {
    sorted_by_key.map((sorted, i) => {
            const k = sorted[1];
            const e = _geos[k];
            // console.log("@@ _geos[k]",k,e);
            let segs = [];
            for (let i = 0; i < e.geojson.length - 1; i++) {
                segs.push(geo_distance(e.geojson[i][0], e.geojson[i][1],
                    e.geojson[i + 1][0], e.geojson[i + 1][1]));
            }

            const polyLen = segs.reduce((a, b) => a + b, 0).toFixed(3);

            rows += `<tr _eid="${e.id}" 
                                     _et="polyline"
                                     class = ${_geos[k].active ? 'selected' : ''} 
                                     >
                                     <td>${e.id}</td>
                                     <td>
                                        <input _cn = "show_polyline"  
                                               type="checkbox" 
                                               ${_geos[k].showPolyline ? 'checked' : ''} >
                                     </td>
                                     <td>
                                        <input _cn = "show_distance"  
                                               type="checkbox" 
                                               ${_geos[k].showDistance ? 'checked' : ''} >
                                     </td>                                     <td><div _efn="name">${e.name}</div></td>
                                     <td><div _efn="meta.desc">${e.meta.desc}</div></td>
                                     <td><div style="background-color: ${e.meta.color}">&nbsp;</div></td>
                                     <td>${e.geojson.length}</td>
                                     <td _cn = "polyLen" >${polyLen}</td>
                                     <td>
                                        <button _bt="cancel">&#10060;</button>
                                        <button _bt="find">&#128269;</button>
                                        <button _bt="edit">&#9998;</button>
                                        <button _bt="save">&#9989;</button>

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
            _geos[k].showPolyLine = true;
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
    save:   function (_eid) {        updateGeos(_geos[_eid]);    },
    cancel: function (_eid) {        console.log("@@ _action cancel", _eid)    },
    find:   function (_eid) {        zoom_polyline(_eid);    },
    edit:   function (_eid) {        editGeoForm(_eid);    },
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
                if (k == _eid) _geos[k].showPolyLine = $(this).prop('checked');
            });

            e.stopPropagation();
            showPolyLineOnMap();
            // mapObjects.polyLines[_eid].setMap(_geos[_eid].showOnMap? map : null);
        });

    $('[_cn="show_distance"]').on('click', function (e) {
        const _eid = $(this).closest('[_eid]').attr('_eid');

        Object.keys(_geos).map((k, i) => {
            if (k == _eid) _geos[k].showDistance = $(this).prop('checked');
        });

        e.stopPropagation();
        showDistance();
        // mapObjects.polyLines[_eid].setMap(_geos[_eid].showOnMap? map : null);
    });

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

        if (evList !== 'true') {
            e.addEventListener('click', function (event) {
                console.log("@@ 77 click to _eid", _eid,  evList);
                action[_bt](_eid);
                event.stopPropagation();
            });
        }
    })

}




function showPolyLineOnMap() {

    Object.keys(_geos).map((id) => {
        // console.log("@@ 01. showPolyLineOnMap", id, _geos, mapObjects.polyLines[id]);

        if (_geos[id].showPolyLine) {
            if (mapObjects.polyLines[id] !== undefined)
                mapObjects.polyLines[id].setMap(null);

            if (mapObjects.polyLines[id] === undefined || 1) {
                let polyOption = {
                    geodesic: true,
                    strokeColor: _geos[id].meta.color,
                    strokeWeight: 3,
                    map:_map,
                    path: _geos[id].geojson.map(p => {
                        return {lat: p[0], lng: p[1]}
                    })
                };

                mapObjects.polyLines[id] = new google.maps.Polyline(polyOption);
                mapObjects.polyLines[id].setEditable(_geos[id].active);

                mapObjects.polyLines[id].addListener("click", (e) => {
                    console.log("@@ polyLines click");
                    setActive(id,false);
                });


                ['remove_at', 'set_at', 'dragend',"insert_at"].map((event) => {
                        mapObjects.polyLines[id].getPath().addListener(event, e => {
                            _geos[id].geojson = mapObjects.polyLines[id].getPath().getArray().map(p => [p.lat(), p.lng()]);
                            console.log("@@ event",event);
                            drawPolyLineTable();
                            showDistance();
                        })
                    }
                );

            }

            else
            {console.log("@@ else ",id, mapObjects.polyLines[id].getPath().length);}

            // console.log("@@ 11 geoLayers.mapPolylines[id]", id, newPoly);

        } else {
            if (mapObjects.polyLines[id] !== undefined)
                mapObjects.polyLines[id].setMap(null);
        }


    });    // >>> Object.keys()


} //>>> showPolyLineOnMap

function createPolyLine() {

    const id = Math.max(...Object.keys(_geos).map(k => _geos[k].id))+1

    _geos[id] = {
        id: id,
        name: `new ${id}`,
        desc: `Описание ${id}`,
        meta: {color: '#ff22bbaa'},
        geojson: [],
        showOnMap: true,
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

    console.log("@@ 02 polyOption, newGeosPoly", _geos, polyOption);


    // showPolyLineOnMap();

}

function showDistance()
{
    let po;
    let dist = 0;
    let total_dist = 0;

    // console.log("@@ 75 showDistance");

    Object.keys(mapObjects.markers).map(id => {
            if(mapObjects.markers[id] !== undefined) {
                mapObjects.markers[id].map(i => i.setMap(null));  // remove all marker
                mapObjects.markers[id] = [];
            }
        });

    Object.keys(_geos).map(id => {
        if (_geos[id].showDistance) {

            mapObjects.markers[id] = [];
            _geos[id].geojson.map((p,i) => {

                if (i > 0) total_dist += geo_distance(po[0],po[1],p[0],p[1]);
                po = p;

                // console.log("@@ >>> mileage_markers()",id, _geos[id], mapObjects.markers[id]);

                const svg_width = total_dist.toFixed(2).length*8;

                const svg = `<?xml version="1.0"?>
                <svg width="${svg_width}px" height="15px" version="1.1" xmlns="http://www.w3.org/2000/svg">

                <text x="5" y="14" 
                font-size="13" 
                font-family="Helvetica, sans-serif"
                
                style="
                font-weight:bold;
                paint-order: stroke;
                fill:${_geos[id].meta.color};
                stroke:rgb(255,255,255);
                stroke-width:3;">${total_dist.toFixed(2)}</text>
                </svg>`;

                const svg_icon = {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
                    anchor: new google.maps.Point(7, 22),
                }


                let markerOption = {
                    position: {lat: p[0], lng: p[1]},
                    map: _map,
                    title: `${p[0].toFixed(3)}, ${p[1].toFixed(3)}`, // {total_dist.toFixed(2)},
                    icon: svg_icon
                }

                const marker = new google.maps.Marker(markerOption);

                mapObjects.markers[id].push( marker);

                google.maps.event.addListener(marker, 'click', function (event) {
                    console.log("@@ delete marker",id,i);
                    mapObjects.markers[id][i].setMap(null);
                    mapObjects.markers[id].splice(i, 1);
                    _geos[id].geojson.splice(i, 1);
                    mapObjects.polyLines[id].getPath().removeAt(i);
                });


            })
        }

    });

    // let id = Object.entries(_geos).find(item => item[1].showDistance == true);
    //
    // id = id !== undefined? id[0]:1;





}

function getGeos() {
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

        // console.log("@@ 33 ***  get Geos", _geosОbj, resp.result.data); //resp.result.data );

        // _geos[10] = _geosОbj;

        // return _geos;
    }
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
        console.log("@@ 01 POST Update Geos\n", this.responseText );
        console.log("@@ 02 POST Update Geos\n", JSON.parse(this.responseText) );
    }

}


