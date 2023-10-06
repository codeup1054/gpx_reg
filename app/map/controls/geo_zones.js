let geoZones = [
    'z12_Mosobl.kml',
    'z14_Tver_Dubna_Zavidovo.kml',
    'z15_Moscow.kml',
    'z16_sk_suburbs_5km.kml',
    'z16_MKAD_5km.kml',
    'z16_Odintsovo_r.Moscow.kml'];

let ctaLayer = {};

let _map;

let geoZonesShowHide = function ()
{
    const zoneId = this.id;

    console.log("@@ 0", [zoneId, ctaLayer, param.map, _map]);

    if (typeof ctaLayer[zoneId] === 'undefined')
    {
        const geoZoneUrl = `https://gpxlab.ru/app/geodata/kml/${encodeURIComponent(geoZones[zoneId])}?${Math.random()}`;
        ctaLayer[zoneId] = new google.maps.KmlLayer({
            url: geoZoneUrl,
            map: _map,
        });

        const poly = ctaLayer[zoneId]; // .polygons
        console.log("@@ 1", [zoneId, ctaLayer, poly, _map, geoZoneUrl]);

        this.classList.remove("row-gray");
        this.classList.add("row-black");
        console.log("@@ 1.5", [zoneId, ctaLayer, param.map, _map]);
    }
    else if (ctaLayer[zoneId].map == null) {
        console.log("@@ 2", [zoneId, ctaLayer, param.map]);
        ctaLayer[zoneId].setMap(_map);
        this.classList.remove("row-gray");
        this.classList.add("row-black");
    }
    else {
            console.log("@@ 3 ", [zoneId, ctaLayer, param.map]);
            this.classList.remove("row-black");
            this.classList.add("row-gray");
            ctaLayer[zoneId].setMap(null);
            console.log("@@ 3.5 ", [zoneId, ctaLayer, param.map, _map]);

            // ctaLayer[zoneId].setMap(ctaLayer[zoneId].map_);
        // console.log("@@ MAP geoZonesShowHide = ", [this.id, ctaLayer[this.id], p.map]);
    }

}


export function geoZoneTools(params, mapCtrl_, map_) {

    console.log("@@  routeTools 01", param);

    _map = param.map;

    let mapCtrl = document.createElement("div");

    mapCtrl.classList.add("custom-map-control-div");

    param.map.controls[google.maps.ControlPosition.TOP_LEFT].push(mapCtrl);

    let buttons = ['Добавить', 'Изменить', 'Скачать']

    const htmButtons  = buttons.map( b => `<button>${b}</button>`).join("");

    mapCtrl.innerHTML = `<div id=control_panel>Routes, Zones</div>${htmButtons}`;

    geoZones.map((b, i) => {
        const geoRow = document.createElement("div")
        geoRow.innerHTML = `${b}`;
        geoRow.onclick = geoZonesShowHide;
        geoRow.id = i;
        geoRow.classList.add("row-gray");
        mapCtrl.appendChild(geoRow);
        }
    );

    mapCtrl.classList.add("hflex");


    // const polyline = new google.maps.Polyline({
    //     map: p.map,
    //     path: [
    //         new google.maps.LatLng(55.77153,37.97722),
    //         new google.maps.LatLng(55.87803,38.86657)
    //     ]
    // });


    // for( let i in geoZones) {
    //
    //     const geoZone = `https://gpxlab.ru/app/geodata/kml/${geoZones[i]}`;
    //     ctaLayer[i] = new google.maps.KmlLayer({
    //         url: geoZone,
    //         map: p.map,
    //     });
    //     console.log(`@@ geodata = `, geoZone, ctaLayer);
    // }

    // controlPanel($(mapCtrl)) ;
}
