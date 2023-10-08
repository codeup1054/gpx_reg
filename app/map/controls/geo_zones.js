let geoZones = [
    'z12_Mosobl.kml',
    'z14_Tver_Dubna_Zavidovo.kml',
    'z15_Moscow.kml',
    'z16_sk_suburbs_5km.kml',
    'z16_MKAD_5km.kml',
    'z16_Odintsovo_r.Moscow.kml'];

let ctaLayer = {};


let _map;

export function geoZoneTools() {

    // console.log("@@  routeTools 01", param);
    // _map = param.map;
    let mapCtrl = document.createElement("div");
    mapCtrl.classList.add("custom-map-control");
    // param.map.controls[google.maps.ControlPosition.TOP_LEFT].push(mapCtrl);

    console.log("@@ 08. geoZoneTools");

    let htmL = "";

    htmL += `<div id=control_panel class="custom-map-control">Routes, Zones</div>`;
    htmL += ['Добавить', 'Изменить', 'Скачать'].map( b => `<button>${b}</button>`).join("");
    mapCtrl.innerHTML = htmL;

    geoZones.map((b, i) => {
        const row = document.createElement("div");
        row.innerHTML = `<div id="${i}" class="gpx-tb-row">${b}</div>`;
        row.onclick = geoZonesShowHide;
        row.id = i;
        mapCtrl.appendChild(row);
    });

    // .on('click',geoZonesShowHide);

    return mapCtrl;
}


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



