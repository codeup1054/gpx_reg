// 2023-10-07 add Geos form
// 2023-09-28 https://github.com/zhenyanghua/MeasureTool-GoogleMaps-V3
// 2023-09-27  https://www.youtube.com/watch?v=nUdt9aMcg0M

import {geoZoneTools} from "./controls/geo_zones.js";


let mapObjects = {
    polyLines: {},
    markers: {},
    polyPoints:{}
};

function distance(lat1, lon1, lat2, lon2, precision = 3, unit = "K") {
    var radlat1 = Math.PI * lat1 / 180
    var radlat2 = Math.PI * lat2 / 180
    var theta = lon1 - lon2
    var radtheta = Math.PI * theta / 180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    if (unit == "K") {
        dist = dist * 1.609344
    }
    if (unit == "M") {
        dist = dist * 0.8684
    }
    return dist;
}

const _geos = {
    1: {
        id: 1,
        name: 'name1',
        desc: 'Описание 1',
        meta: {color: '#7700aa99'},
        geojson: [[55.723, 37.45], [55.73, 37.501], [55.72, 37.51]],
        active: true,
        showDistance: true,
        showOnMap: true
    },
    2: {
        id: 2,
        name: 'n2',
        desc: 'Другой текст 2',
        meta: {color: '#ff330099'},
        geojson: [[55.73, 37.459], [55.710, 37.544], [55.71, 37.524]]
    },
    3: {
        id: 3,
        name: 'Путь 3',
        desc: 'Описание 3',
        meta: {color: '#00449999'},
        geojson: [[55.67, 37.35], [55.70, 37.50], [55.72, 37.52]]
    },
}

export async function polylineTools() {

    let mapCtrl = document.createElement("div");
    mapCtrl.setAttribute("id", "polylineTools");
    mapCtrl.classList.add("custom-map-control-div");
    mapCtrl.classList.add("hflex");
    mapCtrl.classList.add("vflex");

    let addPolyLineButton = document.createElement("button");
    addPolyLineButton.addEventListener("click", createPolyLine);
    addPolyLineButton.innerHTML = '+';
    mapCtrl.appendChild(addPolyLineButton);

    let polyLineTable = document.createElement("table");
    polyLineTable.setAttribute("id", "polyLineTable");
    polyLineTable.classList.add("stab");

    mapCtrl.appendChild(polyLineTable);

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(mapCtrl)

    // google.maps.event.clearListeners(map, 'click');

    waitElement("#polylineTools", 1, drawPolyLineTable, 0)

}

function waitElement(selector, time, callback = drawPolyLineTable, lap = 0) {
    if (document.querySelector(selector) != null) {
        console.log("@@ lap", lap);
        callback();
        return;
    } else {
        setTimeout(function () {
            waitElement(selector, time, callback, lap + 1);
        }, time);
    }
}

// function fieldEdit(){
//     this.contentEditable = true;
//     console.log("@@ this.innerText",this.innerText);
// }


// // define getBounds
//
// if (!google.maps.Polyline.prototype.getBounds)
//     google.maps.Polyline.prototype.getBounds = function() {
//
//         var bounds = new google.maps.LatLngBounds();
//
//         this.getPath().forEach( function(latlng) { bounds.extend(latlng); } );
//
//         return bounds;
//     }


function zoom_polyline(_eid) {
    console.log("@@ polyBound 1 =", map, param, map);
    mapObjects.polyLines[_eid].setMap(map);
    const polyBound = mapObjects.polyLines[_eid].getBounds();
    console.log("@@ polyBound 2 =", polyBound, this);
    // center = bounds.getCenter();
    map.fitBounds(polyBound);
}


function drawPolyLineTable() {

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
            segs.push(distance(e.geojson[i][0], e.geojson[i][1],
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
                                     <td>${e.name}</td>
                                     <td><div _efn="desc" >${e.desc}</div></td>
                                     <td><div style="background-color: ${e.meta.color}">&nbsp;</div></td>
                                     <td>${e.geojson.length}</td>
                                     <td _cn = "polyLen" >${polyLen}</td>
                                     <td>
                                         <button _bt="save">&#9989;</button>
                                         <button _bt="cancel">&#10060;</button>
                                         <button _bt="find">&#128269;</button>
                                     </td>
                                 </tr>
                                `;

//https://htmlweb.ru/html/symbols.php  special symbols

    });

    $("#polyLineTable").html(rows);

    showPolyLineOnMap();
    addAction();
    // console.log("@@ polylineList _geos e =", _geos);
}


function setActive(_eid,e = null){

    Object.keys(_geos).map((k, i) => {
        if (k == _eid) {
            _geos[k].active = true;
            _geos[k].showOnMap = true;
        } else
            _geos[k].active = false;
    });

    $('[_eid]').removeClass('selected');
    $(`[_eid=${_eid}]`).addClass('selected');

    $(`[_eid=${_eid}] td [_cn="show_on_map"]`).prop('checked',true);

    if (e) e.stopPropagation();

    console.log("@@ ",_geos);

    showPolyLineOnMap();
    mileage_markers();
}

function addAction() {

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
}

// function rowSelect() {
//     $(this).toggleClass("selected");
//     _geos[this.id].showOnMap = !_geos[this.id].showOnMap;
//     showPolyLineOnMap();
// }

function showPolyLineOnMap() {

    Object.keys(_geos).map((id) => {
        console.log("@@ 01. showPolyLineOnMap", id, _geos, mapObjects.polyLines[id]);

        if (_geos[id].showOnMap) {
            if (mapObjects.polyLines[id] !== undefined)
                mapObjects.polyLines[id].setMap(null);

            if (mapObjects.polyLines[id] === undefined || 1) {
                let polyOption = {
                    geodesic: true,
                    strokeColor: _geos[id].meta.color,
                    strokeWeight: 3,
                    map:map,
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
                            mileage_markers();
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
        name: 'new',
        desc: 'new 2',
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
        map:map,
        editable: true
    }

    console.log("@@ 02 polyOption, newGeosPoly", _geos, polyOption);

    google.maps.event.addListener(map, "click", (e) => {
        console.log("@@ 07 click",e.latLng);
        const id = Object.entries(_geos).find(item => item[1].active == true)[0];

        _geos[id].geojson.push([e.latLng.lat(), e.latLng.lng()]);
        showPolyLineOnMap();
        drawPolyLineTable();
        mileage_markers();
    });
    // showPolyLineOnMap();

}

function mileage_markers()
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

        if (i > 0) total_dist += distance(po[0],po[1],p[0],p[1]);
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
            map: map,
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

function getGeos(geo_type = 'polyline') {
    let req = {
        method: 'POST',
        body: {
            whe: "",
            geo_type: geo_type
        }
    }

    console.log("@@ 04  getPath = ", req);
    // return  apiRequest(req);
    return _geos;

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
    let xhr = new XMLHttpRequest()+;

    console.log("@@ update Geos");

    let body = {
        id: 1,
        desc: 'текст описания',
        geotype: 'polyline',
        geodata: geodata
    };

    xhr.open("POST", '/api/geos.php', true);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

    const res = xhr.send(JSON.stringify(body));

    xhr.onreadystatechange = function () {
        if (this.readyState != 4) return;
        // console.log("@@ POST Geos res", this.responseText );
    }

}


// function polyDistance(gsArray)
// {
//     console.log("@@ polySementDistance poly= ",gsArray);
//
//     const segments = [];
//
//     for (let i = 0; i < gsArray.length-1; i++ )
//     {
//         const s = gsArray[i];
//         const e = gsArray[i+1];
//
//         let _first = { lat:s[0], lng:s[1] };
//         let _last =  { lat:e[0], lng:e[1] };
//         let segLenMeter = Math.floor(google.maps.geometry.spherical.computeDistanceBetween(_first,_last));
//         segments.push(segLenMeter);
//     }
//
//     return segments;
// }