// 2023-10-07 start
import { _geos}  from "/app/geodata/geo_model.js";
import {addAction}  from "/app/map/controls/gpx.geos.edit/gpx.geos.list.edit.js";
import {geo_distance} from '/app/lib/geo.js';


const tpl = `<div class="flex">
        <div><b>Маршрут</b></div>
        <div class="_sm _g _i">{{tm_modified}}</div>
        <!--    <div style="width: calc(100% - 190px); cursor: pointer ; border: 0px; display: inline-block; text-align: right;" onclick='this.parentNode.remove()'>&#10006;</div>-->
        <div style="cursor: pointer ; border: 0px; text-align: right;" onclick='this.closest(".popup-form").remove()'>&#10006;</div>
    </div>
<table width="100%" style="border:0px white; ">
    <tr><td>Название</td><td>{{name|editable}}</td></tr>
    <tr><td>Описание </td><td>{{meta.desc|editable}}</td></tr>
    <tr><td>Цвет</td><td><div>{{meta.color|color_picker}}</div></td></tr>
    <tr><td>Путь</td><td><textarea cols="50" rows="7">{{geojson|polyline}}</textarea></td></tr>
    </tr>
    <tr><td colspan="2" align="right">
        <span>{{geojson|polyline_info}}</span>
        <button _bt="find">&#128269;</button>
        <button _bt="cancel">&#10060;</button>
        <button _bt="save">&#9989;</button>
    </td></tr>
</table>        
`;


export function editGeoForm(_geoId)
{
    let editForm = document.createElement("div");
    editForm.classList.add('popup-form');
    editForm._geoid = _geoId;

    let o =_geos[_geoId]
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


    // console.log("@@ 75 geoForm", _geos[_geoId]);

    let fieldInputs = Object.entries(o).map(([v,k],i) =>
        `<div>${v}</div><div>${k}</div>`).join("</br>")

    editForm.innerHTML = fieldInputsRe

    let popups = document.querySelectorAll(`.popup-form`);

    [...popups].map(e => e.remove())

    const popupIssuePoint = document.querySelector(`[_eid="${_geoId}"]`);
    popupIssuePoint.appendChild(editForm);

    let pickColorEls = document.querySelectorAll(`[pickcolor]`);

    console.log("@@ 40 pickColorEls",pickColorEls[0]);

    [...pickColorEls].map((el,i) => {

        const newColor = document.createElement('div');
        newColor.innerHTML =el.innerHTML;
        newColor.style.backgroundColor = el.innerHTML;

        console.log("@@ 41 pickcolor set click",el, el.innerHTML);

        el.parentElement.appendChild(newColor);

        // el.parentElement.outerHTML = el.parentElement.outerHTML; /** remove all listner */

        el.addEventListener('click', (e) => {
            console.log("@@ 19 addEventListener",e);
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
            let segs = [];
            for (let i = 0; i < v.length - 1; i++) {
                segs.push(geo_distance(v[i][0], v[i][1],
                    v[i + 1][0], v[i + 1][1]));
            }
            const totalDistance =  segs.reduce((a, b) => a + b, 0).toFixed(3);
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