import {_geos, _mapObjects, _stateControl} from "../../geodata/geo_model.js";
import {osmAllPolyLines, clearMap, osmPolyline} from "../mapobjects/osm.polyline.js";
import {updateGeosJQ} from "../api/gpx.geos.api.js";
import {editGeoForm} from "./osm.geos.form.js";
import {geo_path_distance} from "../../lib/geo.js";
import {geosCrud} from "./osm.geos.crud.js";
import {isJsonString, rgb2hex} from "../../../js/adds.js";



function updateGeosColor(e)
{   
    const _eid = $(e.target).closest('[_eid]').attr('_eid');
    const _e = $(e.target);
    const new_color = this.value == undefined ? rgb2hex(_e.css("backgroundColor")):  this.value
    console.log(`@@ 11  updateGeosColor`, [_eid, _e, rgb2hex(_e.css("backgroundColor")), this.value, new_color]);
    $(`[_eid = "${_eid}"] [_efn="meta.style.color"]`).text(new_color);
    _geos[_eid].meta.style.color = new_color;
    $("#color-picker").val(new_color);

    osmPolyline(_geos[_eid]);

    e.stopPropagation();

}

export function addAction() {


    $("#color-picker").on("input change",   updateGeosColor);
    $("[color_palette]").on('click',        updateGeosColor);

    // 04. 2023-12-27 select row and set mapGeo active


    /**
     * set all  _efn editable
     * */


    $('[_efn]').each((k,v) => setEditable(v));


    /**
     * fire updates on map
     * */


    $(_osmmap).on('updategeos removegeos remove', (e) => {

        // const polyLineData = _mapObjects.polyLines[_eid];


        for (let _eid in _geos)
        {
            if (_geos[_eid].active) {

                // console.log(`@@ 38 edit_stop`, _eid,  _mapObjects.polyLines[_eid]._latlngs);

                let pnts = _mapObjects.polyLines[_eid]._latlngs.map((p)=> [p.lat,p.lng] );

                _geos[_eid].geojson = pnts;

                $(`[_eid = "${_eid}"] polypoints`).text(pnts.length);
                $(`[_eid = "${_eid}"] polylen`).text(geo_path_distance(pnts));

                osmAllPolyLines();

            }
        }

    });



    $('[_bt]').unbind('click').on('click', (e) => {


        if (e) e.stopPropagation();

        const _eid = $(e.target).closest('[_eid]').attr('_eid');
        const action = $(e.target).closest('[_bt]').attr('_bt');

        // console.log(`@@ action "${action}", target`, e );

        switch(action)
        {
            case "geo_add":     addGeos();             break;
            case "set_active":  setGeosActive(e);      break;
            case "geo_find":    geosFind(e);           break;
            case "geo_save":    updateGeosJQ(_eid); osmAllPolyLines();    break;
            case "geo_edit":    editGeoForm(_eid);     break;
            case "geo_console":    console.log(`@@ 11 _geos`, _geos);    break;

            default: console.log(`@@ Action NOT Found" ${action}"`);
        }

        }
    );

/**
 * geos style selector
 * */
const _cns = {
    show_polyline:            {meta:"showPolyLine",           states: [0,1],   state_label: ['','🏞'] },
    show_polyline_elevation:  {meta:"showPolyLineElevation",  states: [0,1],   state_label: ['','📉'] },
    show_polyLine_milestones: {meta:"showPolyLineMilestones", states: [0,1],   state_label: ['','🏳️'] },
    distance_direction:       {meta:"distanceDirection",      states: [0,1,2], state_label: ['','▶','◀'] },
}


    /**
     * geos style set set label
     * */


    $('[_cn]').map((i,e) => {

       const _cn =  $(e).attr("_cn");
       $(e).html(_cns[_cn].state_label[$(e).attr('state')]);
    });


    $('[json]').map((i,e) =>{

        let editor = new JsonEditor('[json_t]',getJson());
        function getJson() {
            try {
                console.log(`@@  $('[json]').val()`, $('[json]').val());
                return JSON.parse($('[json]').val());
            } catch (ex) {
                alert('Wrong JSON Format: ' + ex);
            }
        }

        $('#translate').on('click', function (e) {
            console.log(`@@ 19 translate`, e);
            editor.load(getJson());
            e.stopPropagation();
        });

    })



    /**
     * event fire
     * */


    $('[_cn]').unbind('click').on('click', function (e) {

        let _el =  $(e.target);
        const _cn =  _el.attr("_cn");
        const _eid = _el.closest('[_eid]').attr('_eid');
        

        let _state = _el.attr('state') in [0,1,2] ?
             (Number(_el.attr('state')) + 1) % _cns[_cn].states.length
             : 0;


        _geos[_eid].meta[_cns[_cn].meta]  = _state;


        _el.attr("state", _state);
        _el.text(_cns[_cn].state_label[_state]);

        // console.log(`@@ 24 '[_cn]').unbind('click').on('click'`, [
        //     _cn,
        //     _state,
        //     (_state + 1 ) % _cns[_cn].states.length,
        //     _cns[_cn].states.length,
        //     _cns[_cn].meta,
        //     _geos[_eid].meta
        // ]);

        osmAllPolyLines();

        if (e) e.stopPropagation();

    });


    // $('[_cn="distance_direction"]').unbind('click').on('click', function (e) {
    //     const _eid = $(e.target).closest('[_eid]').attr('_eid');
    //     let dir = _geos[_eid].meta.distanceDirection | 0;
    //     dir = (dir + 1) % 3;
    //     _geos[_eid].meta.distanceDirection = dir;
    //     $(`[_eid="${_eid}"] [_cn="distance_direction"]`).removeClass().addClass(`direction${dir}` );
    //     if (e) e.stopPropagation();
    //
    //     // 2024-01-02 TODO update only one _eid polyline
    //
    //     osmAllPolyLines();
    //
    // });

}

export function setEditable(v)
{

    $(v).prop('contenteditable',true);

    $(v).on('click', (e) => {
        console.log(`@@  ee`, e);
        e.stopPropagation();
    });


        $(v).on('input', (e) => {

        e.stopPropagation();

        const t = $(e.target)

        const _eid = t.closest(`[_eid]`).attr('_eid');
        const _efn = t.attr('_efn');
        let _val  = t.prop('nodeName') == 'TEXTAREA' ? t.val(): $.trim(t.text()); // val for textarea

        $(`[_eid='${_eid}'] [_efn = '${_efn}']`).each((k,vv ) => { if (vv !== v) $(vv).text(_val); });
        

        if (t.attr('json') == undefined)
        {
            const _eval = `_geos['${_eid}'].${_efn}="${_val}"`;
            eval(_eval);
        }
        else if (isJsonString(_val)) {
            // let _b={};
            // let _start_val = JSON.parse(_val);
            //
            // for (let key of _efn.split(".").reverse()) {
            //
            //     _b[key] = _start_val;
            //     _start_val = JSON.parse(JSON.stringify(_b));
            //
            //     console.log(`@@ 12 ***`, _b);
            //
            // }

            /**
             * TODO remove eval
             * */


            const _eval = `_geos['${_eid}'].${_efn}=${_val}`;

            console.log(`@@  isJsonString `, _eval);

            eval(_eval);
        }


        console.log(`@@ 13 setEditable`, [ t, _val, t.val(), _geos[_eid].meta] );


    });
}

//
// // get JSON
// function getJson(t) {
//     try {
//         console.log(`@@  JSON.parse(t.val() `, JSON.parse(t.val() );
//         return JSON.parse(t.val());
//     } catch (ex) {
//         alert('Wrong JSON Format: ' + ex);
//     }
// }
//
// let editor = new JsonEditor('#json-display', getJson());
//




export function addGeos(){
    let _eid;
    console.log(`@@  addGeos()`, Object.keys(_geos).length);

    for (_eid = 0 ;  _eid  <   Object.keys(_geos).length; _eid++)
    {
        if (_eid in _geos === false) break;
    };

    console.log(`@@  333`, _eid);

    const p1 = Object.values(_osmmap.getCenter());
    const p2 = [p1[0]+0.01,p1[1]+0.01];

    _geos[_eid] = {
        id: _eid,
        name: 'New Name',
        meta: {
            color: '#7700aa99',
            desc: 'Новое Описание',
            distanceDirection: 1,
            showPolyLine: true,
            showPolyLineElevation:true,
        },
        geojson: [p1,p2],
        path_elevation: [],
        active: true,
    }

    geosCrud();
    setGeosActive(_eid);

}

export function setGeosActive(_eid = false){


    _eid = getEidByEvent(_eid);


    Object.keys(_geos).map((k, i) => {
        if (k == _eid) {
            _geos[k].active = !_geos[k].active;
            _geos[k].meta.showPolyLine = 1;
        } else
            _geos[k].active = false;
    });

    $('[_eid]').removeClass('selected');

    if(_geos[_eid].active) {
        $(`[_eid=${_eid}]`).addClass('selected');
        $(`[_eid=${_eid}] td [_cn="show_polyline"]`).prop('state', 1);
    }

    // console.log(`@@  setGeosActive`, _eid, _geos );

    osmAllPolyLines();

    // if (e) e.stopPropagation();

    // _osmmap.fitBounds(_mapObjects.polyLines[_eid].getBounds());

}


export function geosFind(_eid = false){
    _osmmap.fitBounds(_mapObjects.polyLines[getEidByEvent(_eid)].getBounds());
}

function getEidByEvent(_eid)
{
    if  ($.isNumeric(_eid)) {     _eid = _eid;    }
    else {
        const e = _eid;
        if (e.target.closest('[_eid]')) {
            if (e.target.closest('[_eid]').getAttribute('_eid'))
                _eid = e.target.closest('[_eid]').getAttribute('_eid');
        }
    }

    return _eid;
}
