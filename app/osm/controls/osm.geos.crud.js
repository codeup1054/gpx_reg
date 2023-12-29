import {_appState, _geos} from "../../geodata/geo_model.js";
import {geo_points_distance} from "../../lib/geo.js";
import {addAction} from "../../map/controls/gpx.geos.edit/gpx.geos.list.edit.js";

export function geosCrud(callback = addAction) {

    let rows = `<tr>
        <td>ID</td>
        <td>E</td>
        <td>📈</td>
        <td>▶</td>
        <td>Name</td>
        <td>Инфо</td>
        <td>Действие</td>
        </tr>`;

    console.log(`@@ 12 _geos_table =`, _geos);


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

        const polyLen = segs.reduce((a, b) => a + b, 0).toFixed(3);

        rows += `<tr _eid="${e.id}" 
                                     _et="polyline"
                                     class = ${_geos[k].active ? 'selected' : ''} 
                                     >
                                     <td align="right" style="background-color: ${e.meta.color};" >
                                        ${e.id}&nbsp
<!--                                        <div style="background-color: ${e.meta.color}; display: inline-block; width: 7px; height: 10px;">&nbsp</div>-->
                                     </td>
                                     <td>
                                     <input _cn = "show_polyline"  
                                               type="checkbox" 
                                              ${_geos[k].meta.showPolyLine ? 'checked' : ''} >
                                     </td>
                                     <td>
                                        <input _cn = "show_polyline_elevation"  
                                               type="checkbox" 
                                               ${_geos[k].meta.showPolyLineElevation ? 'checked' : '' } >
                                     </td>
                                     <td style="vertical-align: middle; ">
                                        <div _cn="distance_direction" class="direction${ _geos[k].meta.distanceDirection }"></div>
                                     </td>
                                     <td><div _efn="name">${e.name}</div><div _efn="meta.desc">${e.meta.desc}</div></td>
                                     <td>
                                        <polypoints>${e.geojson.length}</polypoints> </br> <polylen _cn = "polyLen" >${polyLen}</polylen>
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

    $("#control_panel").append(`<div id="control_geos_table"><table class="stab" >${rows}</table></div>`);

    $("#polyLineTable").html(rows);

    if(callback) callback();

    // console.log("@@ polylineList _geos e =", _geos);
}