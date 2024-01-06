import {_geos, _mapObjects, _stateControl} from "../../geodata/geo_model.js";
import {osmAllPolyLines, clearMap} from "../mapobjects/osm.polyline.js";
import {updateGeosJQ} from "../api/gpx.geos.api.js";
import {editGeoForm} from "./osm.geos.form.js";
import {geo_path_distance} from "../../lib/geo.js";
import {geosCrud} from "./osm.geos.crud.js";


export function addAction() {
    // 04. 2023-12-27 select row and set mapGeo active

    console.log(`@@  _osmmap`, _osmmap);

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



    $('[_bt]').on('click', (e) => {


        if (e) e.stopPropagation();

        const _eid = $(e.target).closest('[_eid]').attr('_eid');
        const action = $(e.target).closest('[_bt]').attr('_bt');

        console.log(`@@ action "${action}", target`, e );

        switch(action)
        {
            case "geo_add":     addGeos();             break;
            case "set_active":  setGeosActive(e);      break;
            case "geo_find":    geosFind(e);           break;
            case "geo_save":    updateGeosJQ(_eid);    break;
            case "geo_edit":    editGeoForm(_eid);     break;
            case "geo_console":    console.log(`@@ 11 _geos`, _geos);    break;

            default: console.log(`@@ Action NOT Found" ${action}"`);
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

        // 2024-01-02 TODO update only one _eid polyline

        osmAllPolyLines();

    });

    $('[_efn]').each((k,v) => setEditable(v));


    $('[_cn]').on('click', function (e) {
        

        let _el =  $(e.target);
        const _cn =  _el.attr("_cn");
        const _eid = _el.closest('[_eid]').attr('_eid');
        
        console.log(`@@ 22 $('[_cn]').on('click' `, [_el, _eid, _el.attr("state")]);

        _el.attr("state", !(_el.attr("state") == 'true'));

        const _cns = {
            show_polyline: "showPolyLine",
            show_polyline_elevation: "showPolyLineElevation",
            show_polyLine_milestones: "showPolyLineMilestones"
        }

        _geos[_eid].meta[_cns[_cn]]  = (_el.attr('state') == "true");

        console.log(`@@  _geos[_eid]`, _geos[_eid].meta);

        osmAllPolyLines();

        if (e) e.stopPropagation();

    });


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

        // console.log(`@@  change setEditable()`, ev_str, _geos[_eid]);

        eval(ev_str);

    });

}


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
            _geos[k].meta.showPolyLine = true;
        } else
            _geos[k].active = false;
    });

    $('[_eid]').removeClass('selected');

    if(_geos[_eid].active) {
        $(`[_eid=${_eid}]`).addClass('selected');
        $(`[_eid=${_eid}] td [_cn="show_polyline"]`).prop('checked', true);
    }

    console.log(`@@  setGeosActive`, _eid, _geos );

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
