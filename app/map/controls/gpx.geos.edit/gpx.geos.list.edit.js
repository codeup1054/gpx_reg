// 2023-10-07 add Geos form
// 2023-09-28 https://github.com/zhenyanghua/MeasureTool-GoogleMaps-V3
// 2023-09-27  https://www.youtube.com/watch?v=nUdt9aMcg0M

import {mapObjects, _geos}  from "/app/geodata/geo_model.js";
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
    getGeos();
    drawPolyLineTable();
    addMapListener();
    showPolyLineOnMap();
    showMileageMarkers();

    // waitElement("#polyLineTable", 1, addAction, 0)
}

function drawPolyLineTable(callback = addAction) {

    let rows = `<tr>
        <td>ID</td>
        <td>M</td>
        <td>Name</td>
        <td>Описание</td>
        <td>Настр</td>
        <td>Точек</td>
        <td>Длина</td>
        <td>Действие</td>
        </tr>`;

    Object.keys(_geos).map((k, i) => {
        const e = _geos[k];
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
                                        <input _cn = "show_on_map"  
                                               type="checkbox" 
                                               ${_geos[k].showOnMap ? 'checked' : ''} >
                                     </td>
                                     <td><div _efn="name">${e.name}</div></td>
                                     <td><div _efn="desc">${e.desc}</div></td>
                                     <td><div style="background-color: ${e.meta.color}">&nbsp;</div></td>
                                     <td>${e.geojson.length}</td>
                                     <td _cn = "polyLen" >${polyLen}</td>
                                     <td>
                                         <button _bt="cancel">&#10060;</button>
                                         <button _bt="find">&#128269;</button>
                                         <button _bt="save">&#9989;</button>
                                         <button _bt="edit">&#9998;</button>
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
            _geos[k].showOnMap = true;
        } else
            _geos[k].active = false;
    });

    $('[_eid]').removeClass('selected');

    if(_geos[_eid].active) {
        $(`[_eid=${_eid}]`).addClass('selected');
        $(`[_eid=${_eid}] td [_cn="show_on_map"]`).prop('checked', true);
        showPolyLineOnMap();
        showMileageMarkers();
    }

    if (e) e.stopPropagation();

    console.log("@@ Set Active",_geos[_eid]);
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
            showPolyLineOnMap();
            drawPolyLineTable();
            showMileageMarkers();
        }
    });

}

export function addAction() {

    // 04. 2023-10-05 select row and set mapGeo active

    $('[_eid]').on('click', function (e) {
        const _eid = $(this).closest('[_eid]').attr('_eid');
        setActive(_eid,e);
    });

    // 03. 2023-10-05 show on map check box

    $('[_cn="show_on_map"]').on('click', function (e) {
        const _eid = $(this).closest('[_eid]').attr('_eid');

        Object.keys(_geos).map((k, i) => {
            if(k == _eid) _geos[k].showOnMap = $(this).prop('checked');
        });

        e.stopPropagation();
        showPolyLineOnMap();
        // mapObjects.polyLines[_eid].setMap(_geos[_eid].showOnMap? map : null);
    });


    // 02. editable fields

    let _efield = document.querySelectorAll('[_efn]');

    [..._efield].map((e, i) => {

        const _eid = e.closest('[_eid]').getAttribute('_eid');

        e.addEventListener('click', function (e) {
            this.contentEditable = true;
            this.focus();
            e.stopPropagation();
        });

        e.addEventListener('blur', function () {
            _geos[_eid].desc = e.innerText;
            console.log("@@ blur", _eid, e.closest('[_eid]'), _geos);

        });

        e.addEventListener('keyup', function () {
            console.log("@@ keyup");
        });
        // e.addEventListener('paste',function() {console.log("@@ paste"); });
        // e.addEventListener('input',function() {console.log("@@ input"); });

        // console.log("@@ _efn", e, _eid, e.innerText);
    })


// 01. 2023-10-05 actions


    let _btn = document.querySelectorAll('[_bt]');
    [..._btn].map((e, i) => {

        const _eid = e.closest('[_eid]').getAttribute('_eid');
        const _bt = e.getAttribute('_bt');

        e.addEventListener('click', function (event) {
            console.log("@@ action_click", _eid);
            action[_bt](_eid);
            event.stopPropagation();
        });

    })

}

let action = {
    save: function (_eid) {
        console.log("@@ _action save", _eid)
        updateGeos(_geos[_eid]);
    },
    cancel: function (_eid) {
        console.log("@@ _action cancel", _eid)
    },
    find: function (_eid) {
        console.log("@@ _action find",_eid);
        zoom_polyline(_eid);
    },

    edit: function (_eid) {
        console.log("@@ _action ",_eid);
        editGeoForm(_eid);
    },


}


function showPolyLineOnMap() {

    Object.keys(_geos).map((id) => {
        // console.log("@@ 01. showPolyLineOnMap", id, _geos, mapObjects.polyLines[id]);

        if (_geos[id].showOnMap) {
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
                            showMileageMarkers();
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

    drawPolyLineTable();
    setActive(id);

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

function showMileageMarkers()
{
    let po;
    let dist = 0;
    let total_dist = 0;

    Object.keys(mapObjects.markers).map(id => {
        mapObjects.markers[id].map(m=>m.setMap(null));
        mapObjects.markers[id] = [];
    });

    let id = Object.entries(_geos).find(item => item[1].active == true)[0];


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


        // console.log("@@ mileage_markers() markerOption=",id, markerOption, new_marker);

    })


}

function getGeos() {
    let xhr = new XMLHttpRequest();

    let body = {
        action: 'getgeos',
        verbose: true,
        whe: ""
    };

    xhr.open("POST", '/api/geos.php', true);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

    const res = xhr.send(JSON.stringify(body));

    xhr.onreadystatechange = function () {
        if (this.readyState != 4) return;

        const resp =  JSON.parse(this.responseText);

        // let _geosОbj = {...resp.result.data}.map((v,k) => v.id:v )

        let _geosОbj =  [...resp.result.data].map((o, v) => _geos[o.id] = o );

        console.log("@@ 33 ***  get Geos", _geosОbj, resp.result.data); //resp.result.data );

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
        console.log("@@ POST Update Geos", this.responseText );
    }

}


