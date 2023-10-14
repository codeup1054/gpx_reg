import {geoZonesFiles}  from "/app/geodata/geo_model.js";

let ctaLayer = {};

export function geoZoneTools() {
    let mapCtrl = document.createElement("div");
    mapCtrl.classList.add("custom-map-control");
    // param.map.controls[google.maps.ControlPosition.TOP_LEFT].push(mapCtrl);

    // console.log("@@ 08. geoZoneTools");

    let htmL = "";

    htmL += `<div id=control_panel class="custom-map-control">Routes, Zones</div>`;
    htmL += ['Добавить', 'Изменить', 'Скачать'].map( b => `<button>${b}</button>`).join("");
    mapCtrl.innerHTML = htmL;

    geoZonesFiles.map((b, i) => {
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
    console.log("@@ 0", [zoneId, ctaLayer, _param, _map]);

    if (typeof ctaLayer[zoneId] === 'undefined')
    {
        const geoZoneUrl = `https://gpxlab.ru/app/geodata/kml/${encodeURIComponent(geoZonesFiles[zoneId])}?${Math.random()}`;
        ctaLayer[zoneId] = new google.maps.KmlLayer({
            url: geoZoneUrl,
            map: _map,
        });

        this.classList.remove("row-gray");
        this.classList.add("row-black");
    }
    else if (ctaLayer[zoneId].map == null) {
        ctaLayer[zoneId].setMap(_map);
        this.classList.remove("row-gray");
        this.classList.add("row-black");
    }
    else {
            this.classList.remove("row-black");
            this.classList.add("row-gray");
            ctaLayer[zoneId].setMap(null);

            // ctaLayer[zoneId].setMap(ctaLayer[zoneId].map_);
        // console.log("@@ MAP geoZonesShowHide = ", [this.id, ctaLayer[this.id], p.map]);
    }

}



