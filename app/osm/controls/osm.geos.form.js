// 2023-10-07 start
import { _geos}  from "/app/geodata/geo_model.js";
import {addAction, setEditable, setGeosActive} from "./osm.actions.js";
import {geo_path_distance} from '/app/lib/geo.js';


const tpl = `<div class="flex geosform">
        <div><b>Маршрут</b></div>
        <div class="_sm _g _i">{{tm_modified}}</div>
        <!--    <div style="width: calc(100% - 190px); cursor: pointer ; border: 0px; display: inline-block; text-align: right;" onclick='this.parentNode.remove()'>&#10006;</div>-->
        <div style="cursor: pointer ; border: 0px; text-align: right; position: absolute; top:0px; right: 0px;" onclick='this.closest(".popup-form").remove()'>&#10006;</div>
    </div>
<table width="100%" style="border:0px white; ">
    <tr><td>Название</td><td _efn="name" >{{name|editable}}</td></tr>
    <tr><td>Описание </td><td _efn="meta.desc" >{{meta.desc|editable}}</td></tr>
    <tr><td>Метки, км</td><td _efn="meta.mileage_distance" >{{meta.mileage_distance|editable}}</td></tr>
    <tr><td>Цвет</td><td><div>{{meta.color|color_picker}}</div></td></tr>
    <tr><td>Путь</td><td><textarea cols="50" rows="7">{{geojson|polyline}}</textarea></td></tr>
    </tr>
    <tr><td colspan="2" align="right">
        <span>{{geojson|polyline_info}}</span>
        <button _bt="geo_find">&#128269;</button>
        <button _bt="geo_cancel">&#10060;</button>
        <button _bt="geo_save" onclick='this.closest(".popup-form").remove()'>&#9989;</button>
    </td></tr>
</table>        
`;


export function editGeoForm(_geoId)
{

    let o =_geos[_geoId]

    setGeosActive(_geoId);

    let fieldInputsRe = tpl;

    let re = /\{{([^}]*)\}/g;
    let m;

    do {
        m = re.exec(tpl);
        if (m) {
            let fld_pipe_re = m[1];
            const fld_name = fld_pipe_re.split("|")[0];
            const fld_pipe = fld_pipe_re.split("|")[1];


            const v = eval(`o['${fld_name.replace(".","']['")}']`);


            /** !!!  if use function may be better apply  switch */

            let pipes = {
                "editable"     : `contenteditable=True  >${v}`,
                "color_picker" : `pickcolor contenteditable=True style = 'background-color:${v};' >${v}`,
                "polyline":      `polyline style = 'background-color:#FF9;' >${JSON.stringify(v)}`,
                "polyline_info": `polylineinfo1 style = 'background-color:#FFE;'>${ polylineInfo(v)}`,
            }

            const pipe =  (fld_pipe in pipes)  ? pipes[fld_pipe] : `>${v}`;

            // console.log("@@@@@ reg:",[fld_name, fld_pipe, fld_pipe_re,  pipe, (fld_pipe in pipes)] );

            fieldInputsRe = fieldInputsRe.replaceAll(`>{{${fld_pipe_re}}}`,` ${pipe}`)
        }
    } while (m);


    $(`.popup-form`).each((k,v) =>  v.remove() );

    $(`[_eid="${_geoId}"]`)
        .append(`<div class="popup-form" _eid = ${_geoId}>${fieldInputsRe}</div>`)
        .ready(() => {
            console.log(`@@  ready` );
            $('.popup-form [_efn]').each((k,v) => {
                console.log(`@@  v`, v);
                setEditable(v)
            });
        });

    let pickColorEls = $(`[pickcolor]`);

    // console.log("@@ 40 pickColorEls",pickColorEls[0]);

    [...pickColorEls].map((el,i) => {

        const newColor = document.createElement('div');
        newColor.innerHTML =el.innerHTML;
        newColor.style.backgroundColor = el.innerHTML;

        // console.log("@@ 41 pickcolor set click",el, el.innerHTML);

        el.parentElement.appendChild(newColor);

        // el.parentElement.outerHTML = el.parentElement.outerHTML; /** remove all listner */

        el.addEventListener('click', (e) => {
            // console.log("@@ 19 addEventListener",e);
            pickColor(e);
            e.stopPropagation();
        });

        // const evList = el.getAttribute('listener');
        // if (evList !== 'true') {
        // }

    });

    function polylineInfo(v){

        if (v !== undefined)
        {
            const pointCount =  v.length;
            console.log(`@@  pointCount`, pointCount);
            const totalDistance =  geo_path_distance(v); // .toFixed(3)
            return `Точек: ${pointCount} | ${totalDistance}км`;
        }

    }

    addAction();

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

function polylineInfo(e)
{
    console.log("@@ 43 polylineInfo",e.target.innerHTML);  // e.target.parentNode.innerHTML
    if (e) {
        console.log("@@ 23 polylineInfo",e);
        e.stopPropagation();
    }

}