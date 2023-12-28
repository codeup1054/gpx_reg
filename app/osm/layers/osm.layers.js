//2023-12-19  https://github.com/dayjournal/Leaflet.Control.Opacity?tab=readme-ov-file

import {addSlider} from '/app/map/controls/slider.control.js'

let mapMarkers = [];
let Map_AddLayer = {};

let osmTile  = [];

export function addLayer() {

    // https://wiki.openstreetmap.org/wiki/Raster_tile_providers
    // http://leaflet-extras.github.io/leaflet-providers/preview/index.html
    // f571e898-a632-4070-ac6b-23742f42f936

    osmTile['hm'] =  L.tileLayer('https://gpxlab.ru/app/php/app.strava.php?z={z}&x={x}&y={y}.png&hist=2023-12', {attribution:"Strava HM attr",});
    osmTile['osm'] = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: 'OSM',    });
    osmTile['Stadia'] = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png'
    });
    osmTile['OpenTopoMap'] = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    osmTile['Esri_WorldImagery'] = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });


//BaseLayer
    const Map_BaseLayer = {
        'Stadia': osmTile['Stadia'],
    };

//AddLayer
    const Map_AddLayer = {
        'Stadia':osmTile['Stadia'],
        'OSM': osmTile['osm'],
        'OpenTopoMap': osmTile['OpenTopoMap'],
        'Esri_WorldImagery': osmTile['Esri_WorldImagery'],
        'Strava HM': osmTile['hm'],
    };

//LayerControl
    L.control.layers(Map_BaseLayer, Map_AddLayer, {
            collapsed: false,
        })
        .addTo(_osmmap);

//OpacityControl
    L.control.opacity(Map_AddLayer, {
            label: 'Layers1 Opacity',
        })
        .addTo(_osmmap);


    osmTile['Stadia'].addTo(_osmmap);

}

