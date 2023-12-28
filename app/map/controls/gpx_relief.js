
import {_mapObjects, _geos, _appState, _stateControl} from "/app/geodata/geo_model.js";
import {altitudeColor, geo_distance} from '/app/lib/geo.js';

let ctaLayer = {};

export function gpxReliefTool() {
    let mapCtrl = document.createElement("div");
    mapCtrl.classList.add("custom-map-control");
    // param.map.controls[google.maps.ControlPosition.TOP_LEFT].push(mapCtrl);

    // console.log("@@ 08. geoZoneTools");

    let htmL = "";

    htmL += `<div id=control_panel class="custom-map-control">Рельеф</div>`;
    htmL += `<div id=info_panel class="custom-map-control"></div>`;

    mapCtrl.innerHTML = htmL;

    [0,1,2].map((b, i) => {
        const row = document.createElement("div");
        row.innerHTML = `<div id="${i}" class="gpx-tb-row">${b}</div>`;
        row.onclick = reliefShowHide;
        row.id = i;
        mapCtrl.appendChild(row);
    });


    // .on('click',geoZonesShowHide);

    return mapCtrl;
}

//
let reliefShowHide = function ()
{
    const zoneId = this.id;
    this.classList.toggle("selected");

    const bounds = _map.getBounds();

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const s = sw.lat();
    const w = sw.lng();
    const n = ne.lat();
    const e = ne.lng();

    const info_panel = document.getElementById('info_panel');

    console.log("@@ gpx_relief", [zoneId, ctaLayer, bounds, s,w,n,e]);


    const latDist = geo_distance([w,s],[w,n]);
    const lngDist = geo_distance([w,s],[e,s]);

    info_panel.innerHTML = bounds;

    // console.log("@@ gpx_relief", [latDist, lngDist]);

    const tileFreq = 70;
    const dLat = (n-s)/tileFreq;
    const dLng = (e-w)/tileFreq;

    let polyOption = {
        geodesic: true,
        strokeColor : '#992200',
        strokeWeight: 1,
        fillOpacity : 0.5,
        map: _map
    }

    Object.keys(_mapObjects._elevationTile).map( k => _mapObjects._elevationTile[k].setMap(null));

/** 2023.12.08  get elevation by path
    elevator.getElevationAlongPath({
        path: polyPath,
        samples: 512,
    })
*/
    const altThresholds = [
        0, 100, 150, 200,
        250, 300, 350, 400,
        450, 500];

    for (let llat = s; llat < n;  llat += dLat)
    {
        for (let llng = w; llng < e;  llng += dLng) {
            const location = {lat: llat, lng: llng};

            const pathTile = [
                {lat: llat, lng: llng},
                {lat: llat, lng: llng + dLng},
                {lat: llat + dLat, lng: llng + dLng},
                {lat: llat + dLat, lng: llng},
                {lat: llat, lng: llng},
            ]

            _elevator.getElevationForLocations({
                locations: [location],
            })
                .then(({results}) => {
                    const color = altitudeColor(results[0].elevation, altThresholds);
                    polyOption.strokeColor = color + '00';
                    polyOption.fillColor = color;
                    polyOption.path = pathTile;
                    // console.log(`@@ reliefShowHide pathTile, results, polyOption`, [pathTile, results, polyOption]);
                    _mapObjects._elevationTile[`${llat}_${llng}`] = new  google.maps.Polygon(polyOption);

                })
        }

    }


}



