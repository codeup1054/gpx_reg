// 2023-12-27 add Geos form
// 2023-09-28 https://github.com/zhenyanghua/MeasureTool-GoogleMaps-V3
// 2023-09-27  https://www.youtube.com/watch?v=nUdt9aMcg0M

import {_mapObjects, _geos, _appState, _stateControl} from "/app/geodata/geo_model.js";
// import {editGeoForm} from '/app/map/controls/gpx.geos.edit/gpx.geos.form.js';
// import {altitudeColor, geo_distance} from '/app/lib/geo.js';

export function getGeosJQ(callback=false) {

    let body = {
        action: 'getgeos',
        verbose: true,
        whe: "",
        sort: " order by tm_modified desc"
    };

    body = JSON.stringify(body);


    $.post('/api/geos.php', body, (resp)=>{

        let _geosОbj =  [...resp.result.data].map((o, v) => _geos[o.id] = o );

        // console.log("@@ 33 ***  get Geos", _geosОbj, resp.result.data, _geos); //resp.result.data );

        if(callback) callback();

    })
        .done( ()=> console.log(`@@ geos.list done `))
        .fail(() => console.log(`@@  fail`))

}


export function updateGeosJQ(_eid, callback=false) {

    // console.log("@@ update Geos");



    const geodata = _geos[_eid];

    let body ={
        action: 'geos_create_update',
        verbose: true,
        data: {
            id: 1,
            desc: 'текст описания',
            geotype: 'polyline',
            geodata: geodata
        }
    };

    body = JSON.stringify(body);

    // console.log("@@ 35 ***  updateGeosJQ body", body);

    $.post('/api/geos.php', body, (resp)=>{

        // console.log("@@ 35 ***  updateGeosJQ", resp, body);
        if(callback) callback();

    })
        .done( ()=> console.log(`@@ updateGeosJQ done `, body))
        .fail(() => console.log(`@@  fail`))

}


