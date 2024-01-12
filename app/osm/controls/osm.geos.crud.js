import {_appState, _geos} from "../../geodata/geo_model.js";
import {geo_points_distance} from "../../lib/geo.js";
import {addAction} from "./osm.actions.js";

export function geosCrud(callback = addAction) {

    let rows = `<tr>
        <td>ID</td>
        <td>E 📈 T ▶ </td>
        <td>Name</td>
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
            segs.push(geo_points_distance(e.geojson[i], e.geojson[i + 1]));
        }

        const polyLen = segs.reduce((a, b) => a + b, 0).toFixed(1);


        const _geo_color = e.meta.style == undefined ? e.meta.color: e.meta.style.color;
        const _geo_weight = e.meta.style == undefined ? 1: e.meta.style.weight;

        rows += `<tr _eid="${e.id}" 
                                     _et="polyline"
                                     _bt="set_active"
                                     class = ${_geos[k].active ? 'selected' : ''} 
                                     >
                                     <td align="left" >
                                     <nobr>
                                        <div style="display: inline-block; width: 16px; height:25px; padding: 0 0 0 0px">${e.id}</div>
                                        <div style="background-color: ${_geo_color}; display: inline-block; width: ${_geo_weight}; height:25px; padding: 0 0 0 0px">&nbsp;</div>
                                     </nobr>   
<!--                                        <div style="background-color: ${e.meta.style }; display: inline-block; width: 7px; height: 10px;">&nbsp</div>-->
                                     </td>
                                     <td >
                                         <nobr>
                                             <div _cn = "show_polyline"         state=${_geos[k].meta.showPolyLine} ></div>
                                             <div _cn="show_polyline_elevation" state=${_geos[k].meta.showPolyLineElevation} ></div>
                                             <div _cn="show_polyLine_milestones" state=${_geos[k].meta.showPolyLineMilestones} ></div>
                                             <div _cn="distance_direction" state=${_geos[k].meta.distanceDirection}></div>
                                         </nobr>
                                     </td>
                                     <td><div _efn="name">${e.name}</div><div _efn="meta.desc">${e.meta.desc}</div></td>
                                     <td _bt="set_active">
                                        <nobr><polypoints>${e.geojson.length}</polypoints> </br> <polylen>${polyLen}</polylen> км</nobr>
                                     </td>
                                     <td><nobr>
                                        <!-- <button _bt="geo_cancel">&#10060;</button> -->
                                            <button _bt="geo_find">&#128269;</button>
                                            <button _bt="geo_edit">&#9998;</button>
                                            <button _bt="geo_save">&#9989;</button>
                                        </nobr>
                                     </td>
                                 </tr>
                                `;

//https://htmlweb.ru/html/symbols.php  special symbols

    });

    $('#control_geos_table').remove();

    $("#control_panel").append(`<div id="control_geos_table">
                         <button _bt="geo_add">+</button>
                         <button _bt="geo_console">?</button>
                         
                         <table class="stab" >${rows}</table>
                     </div>`);

    $("#polyLineTable").html(rows);



    if(callback) callback();

    // console.log("@@ polylineList _geos e =", _geos);
}