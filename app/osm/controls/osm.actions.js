import {_geos, _mapObjects, _stateControl} from "../../geodata/geo_model.js";
import {osmAllPolylines} from "../mapobjects/osm.polyline.js";
import {updateGeosJQ} from "../api/gpx.geos.api.js";
import {editGeoForm} from "/app/osm/controls/osm.geos.form.js";

export function addAction() {
    // 04. 2023-12-27 select row and set mapGeo active

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
            case "geo_find":  setGeosActive(e);              break;
            case "geo_save":  updateGeosJQ(_geos[_eid]);     break;
            case "geo_edit":  editGeoForm(_eid);     break;
            default: console.log(`@@ "${action}" ACTION UNDEFINED `);
        }

        }
    );

    $('[_bt="geo_edit"]').on('click', (e) => {
            if (e) e.stopPropagation();
            const _eid = $(e.target).closest('[_eid]').attr('_eid');
            updateGeosJQ(_geos[_eid])
        }
    );


    $('[_cn="distance_direction"]').each((k,v) =>{

    const _eid = $(v).closest('[_eid]').attr('_eid');

    // console.log(`@@  k,v`, k,v, _eid);

        // let _state = _geos[_eid]['meta']['distanceDirection'] == undefined ? 0 : (_geos[_eid]['meta']['distanceDirection'] +=1 ) %3;
    let _state = _geos[_eid]['meta']['distanceDirection'] == undefined ? 0 : _geos[_eid]['meta']['distanceDirection'];

    $(v).html( _stateControl[_state].icon);
    $(v).attr("class",`direction${_state}`);

        // distanceMarker();
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
