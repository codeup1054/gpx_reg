import {_geos, _mapObjects, _stateControl} from "../../geodata/geo_model.js";
import {osmAllPolylines} from "../mapobjects/osm.polyline.js";
import {updateGeosJQ} from "../api/gpx.geos.api.js";
import {editGeoForm} from "/app/osm/controls/osm.geos.form.js";
import {geo_path_distance} from "../../lib/geo.js";

export function addAction() {
    // 04. 2023-12-27 select row and set mapGeo active

    $(_osmmap).on('updategeos removegeos remove', (e) => {

        // const polyLineData = _mapObjects.polyLines[_eid];
        for (let _eid in _geos)
        {
            if (_geos[_eid].active) {
                let pnts = _mapObjects.polyLines[_eid].getPoints().map((p)=> [p._latlng.lat,p._latlng.lng] );
                console.log(`@@  edit_stop`, e, _eid,  pnts);
                _geos[_eid].geojson = pnts;
                $(`[_eid = "${_eid}"] polypoints`).text(pnts.length);
                $(`[_eid = "${_eid}"] polylen`).text(geo_path_distance(pnts));

            }
        }
        // if (_geos[_eid].active) {
        //     const points = polyLineData.getPoints();
    });

    $('[_eid]').on('click', (e) => {
        setGeosActive(e)
    });

    $('[_cn="show_polyline"]').on('click', function (e) {

        const _eid = $(this).closest('[_eid]').attr('_eid');

        $.each(_geos,(k, i) => { if (k == _eid) _geos[k].meta.showPolyLine = $(this).prop('checked'); });

        // console.log(`@@  show_polyline`, _eid, _geos);

        osmAllPolylines();

        if (e) e.stopPropagation();

    })


    $('[_bt]').on('click', (e) => {

        if (e) e.stopPropagation();


        const _eid = $(e.target).closest('[_eid]').attr('_eid');
        const action = $(e.target).attr("_bt");

        switch(action)
        {
            case "geo_find":  setGeosActive(e);      break;
            case "geo_save":  updateGeosJQ(_eid);    break;
            case "geo_edit":  editGeoForm(_eid);     break;
            default: console.log(`@@ "${action}" ACTION UNDEFINED `);
        }

        }
    );


    $('[_cn="distance_direction"]').on('click', function (e) {

        const _eid = $(e.target).closest('[_eid]').attr('_eid');

        let dir = _geos[_eid].meta.distanceDirection | 0;

        dir = (dir + 1) % 3;

        _geos[_eid].meta.distanceDirection = dir;

        $(`[_eid="${_eid}"] [_cn="distance_direction"]`).removeClass().addClass(`direction${dir}` );

        if (e) e.stopPropagation();

    });


    $('[_efn]').each((k,v) => setEditable(v));



}

export function setEditable(v)
{

    $(v).prop('contenteditable',true);
    $(v).on('input', (e) => {

        const _eid = $(e.target).closest(`[_eid]`).attr('_eid');
        const _efn = $(e.target).attr('_efn');
        const _val  = $(e.target).text();
        const ev_str = `_geos['${_eid}'].${_efn} = '${_val}'`;

        $(`[_eid='${_eid}'] [_efn = '${_efn}']`).each((k,vv ) => {
            if (v != vv) $(vv).text(_val)
        });

        console.log(`@@  change setEditable()`, ev_str, _geos[_eid]);

        eval(ev_str);

    });

}


export function setGeosActive(_eid = false){


    if  ($.isNumeric(_eid)) {
        _eid = _eid;
    }
    else {
        // console.log(`@@  , e,_eid `, e.target, _eid, e.target.closest('[_eid]'));
        const e = _eid;
        if (e.target.closest('[_eid]')) {
            if (e.target.closest('[_eid]').getAttribute('_eid'))
                _eid = e.target.closest('[_eid]').getAttribute('_eid');
        }
        if (e) e.stopPropagation();
    }

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
    }

    osmAllPolylines();

    _osmmap.fitBounds(_mapObjects.polyLines[_eid].getBounds());

}
