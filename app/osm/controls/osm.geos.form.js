// 2023-10-07 start
import { _geos}  from "/app/geodata/geo_model.js";
import {addAction, setEditable, setGeosActive} from "./osm.actions.js";
import {geo_path_distance} from '/app/lib/geo.js';
import {isJsonString} from "/js/adds.js";


/**
 * 2024-01-11 JSON Editor https://www.jeremydorn.com/json-editor
 * 2024-01-09 TODO
 * 1. add polyline style edit,
 * 2. remove addAction() just copy field adn button with actionosm.geos.form.js
 *
 */



export function editGeoForm(_gid)
{

    setGeosActive(_gid);

const pathOptions =[
    'color',
    'stroke',
    'weight',
    'opacity',
    'lineCap',
    'lineJoin',
    'dashArray',
    'dashOffset',
    'fill',
    'fillColor',
    'fillOpacity',
    'fillRule',
    'bubblingMouseEvents',
    'renderer',
    'className'
    ]




    $.map(polylineStyles, (pls, k) => {

        try {
            _geos[_gid].meta.style[k] = _geos[_gid].meta.style[k] == undefined ? pls: _geos[_gid].meta.style[k];
        }
        catch {
            _geos[_gid].meta.style = _geos[_gid].meta.style == undefined ? {}: _geos[_gid].meta.style;
            _geos[_gid].meta.style[k] =  pls;
        }

    });

    // const styleGeo = _geos[_gid].meta.style != undefined ? JSON.stringify(_geos[_gid].meta.style): '{}';

    $(`.popup-form`).each((k,v) =>  v.remove() );



    // <textarea json  style="height: 50px" _efn="meta.style">${styleGeo}</textarea>
    // <button id="translate">Translate</button>
    // <div json_t style="height: 50px"></div>
    // <span title="${pathOptions.join('\n')}">💬</span>
    //
    // <div _efn="meta.style.color">${_geos[_gid].meta.style.color}</div>
    // <div _efn="meta.style.weight">${_geos[_gid].meta.style.weight}</div>
    // <tr><td>Цвет</td><td><div style="display:inline-block; width:40px; background-color: ${_geos[_gid].meta.color}">&nbsp;</div> <div style="display:inline-block;">${_geos[_gid].meta.color}</div></td></tr>


    const pickerPaletteHtml = pickerColors.map((e,i) => {

        let res = `<div title=${e} style="background-color:${e}">&nbsp;</div>`;

        if (i % 5 == 4) return  res+"</br>";

        return res;

    }).join('');

    let div = '', block = '';


    for (let i in pickerColors) {


        div += `<div picker title= ${pickerColors[i]} style="background-color:${pickerColors[i]}">&nbsp</div>`

        if (i % 5 == 4) div += '</br>'

        if (i % 35 == 34) {
            block += `<span style="display:inline-block; border: 0px solid gray;">${div}</span>`
            div = ''
        }
    }

    block += `<span style="display:inline-block;">${div}</span>`

const form = `
<div class="flex geosform">
    <div>
        <div><b>Маршрут</b></div>
        <div class="_sm _g _i">${_geos[_gid].tm_modified}</div>
        <div style="cursor: pointer ; border: 0px; text-align: right; position: absolute; top:3px; right: 5px;" onclick='this.closest(".popup-form").remove()'>&#10006;</div>
    </div>
    <table width="100%" style="border:0px white; ">
        <tr>
            <td>Название</td><td _efn="name" >${_geos[_gid].name}</td>
        </tr>
        <tr><td>Описание</td><td _efn="meta.desc" >${_geos[_gid].meta.desc}</td></tr>
        <tr title="${pathOptions.join('\n')}">
            <td>Стиль</td>
            <td>
            <table class="stab" width="370px">
                <tr>
                    <td>Цвет:</td>
                    <td><img width="50px"></br><span _efn="meta.style.color">${_geos[_gid].meta.style.color}</span></td>
                    <td color_palette rowspan="5" style="vertical-align:top;">
                        <table width="250px" class="stab no_border">
                        <tr>
                            <td>${block}</td>
                            <td><input id="color-picker" style="height: 78px; width: 50px; margin: 5px 0px;" type="color" value="${_geos[_gid].meta.style.color}"></td>
                        </tr>
                        </table>
                     </td>
                </tr>
                
                <tr><td>Толщина</td><td _efn="meta.style.weight">${_geos[_gid].meta.style.weight}</td></tr>
                <tr><td>Размер метки</td><td _efn="meta.style.mileage_marker_size">${_geos[_gid].meta.style.mileage_marker_size}</td></tr>
                <tr><td>Прозрачность</td><td _efn="meta.style.opacity">${_geos[_gid].meta.style.opacity}</td></tr>
            </table>
            </td>
        </tr>
        <tr>
         <td>Настройки</td> 
          <td >
             <nobr>
                 <div _cn = "show_polyline"         state=${_geos[_gid].meta.showPolyLine} ></div>
                 <div _cn = "show_polyline_elevation" state=${_geos[_gid].meta.showPolyLineElevation} ></div>
                 <div _cn = "show_polyLine_milestones" state=${_geos[_gid].meta.showPolyLineMilestones} ></div>
                 <div _cn = "distance_direction" state=${_geos[_gid].meta.distanceDirection}></div>
             </nobr>
         </td>       
        <tr><td colspan="2" align="right">
            <span>${polylineInfo(_geos[_gid].geojson)}</span>
            <button _bt="geo_find">&#128269;</button>
            <button _bt="geo_cancel">&#10060;</button>
            <button _bt="geo_save" onclick='this.closest(".popup-form").remove()'>&#9989;</button>
        </td></tr>
        <tr><td height="10px;"></td></tr>
        <tr><td valign="top">Путь</td><td><textarea cols="50" text_point_list rows="17" style = "resize: both;">${_geos[_gid].geojson.join('\n')}</textarea></td></tr>
    </table>
</div>`

    $(`[_eid="${_gid}"]`).append(`<div class="popup-form" _eid = ${_gid}>${form}</div>`)
        .ready((e) => {
            addAction();

            const colorPicker =  $('#color-picker');


            // colorPicker.on("change", watchColorPicker, false);

            // colorPicker.colorPicker({
            //     opacity: false, // disables opacity slider
            //     renderCallback: function($elm, toggled) {
            //         $elm.val('#' + this.color.colors.HEX);
            //     }
            // });
            // const form_fields = {"name":"Название", "meta.desc":"Описание"};

        // for ( const k in form_fields) {
        //     console.log(`@@  33`, `#control_geos_table [_eid=${_geoId}] [_efn=${k}]`, $(`#control_geos_table [_eid=${_geoId}] [_efn="${k}"]`));
        //
        //     const tr = $(".geosform table").append($(`#control_geos_table [_eid=${_geoId}] [_efn="${k}"]`)
        //         .clone(true)
        //         .attr("clone", 1));
        //     }
        //
        //     for ( let n of ["show_polyline", "show_polyline_elevation", "show_polyLine_milestones", "distance_direction"] )            {
        //         console.log(`@@  34`, `#control_geos_table [_eid=${_geoId}] [_cn=${n}]`, $(`#control_geos_table [_eid=${_geoId}] [_cn="${n}"]`) );
        //         $(`#control_geos_table [_eid=${_geoId}] [_cn="${n}"]`)
        //             .clone(true)
        //             .attr("clone", 1)
        //             .appendTo(".geosform");
        //     }

    });
}


// function watchColorPicker(event) {
//     console.log(`@@  watchColorPicker`, event.target.value);
//     }

function polylineInfo(_geojson){

    if (_geojson !== undefined)
    {
        const pointCount =  _geojson.length;
        const totalDistance =  geo_path_distance(_geojson); // .toFixed(3)
        return `Точек: ${pointCount} | ${totalDistance}км`;
    }

}


// https://habr.com/ru/articles/147032/  colorPicker
function pickColor(ev)
{
    const el = ev.target;
    console.log("@@ 43 pickColor",el.innerHTML);  // e.target.parentNode.innerHTML

    if (el) {
        const _eid = el.closest('[_eid]').getAttribute('_eid');
        _geos[_eid].meta.color = el.innerText;
        el.style.backgroundColor =  el.innerText;
        ev.stopPropagation();
    }
}

