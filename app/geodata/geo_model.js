// let _map = null;
// export let _map;

export let mapObjects = {
    polyLines: {},
    markers: {},
    polyPoints: {},
    _map: "_mapObjects_map_",
};

export let geoZonesFiles = [
    'z12_Mosobl.kml',
    'z14_Tver_Dubna_Zavidovo.kml',
    'z15_Moscow.kml',
    'z16_sk_suburbs_5km.kml',
    'z16_MKAD_5km.kml',
    'z16_Odintsovo_r.Moscow.kml'];


export let _geos = {
    1: {
        id: 1,
        name: 'name1',
        meta: {
            color: '#7700aa99',
            desc: 'Описание 1',
        },
        geojson: [[55.723, 37.45], [55.73, 37.501], [55.72, 37.51]],
        active: true,
        showDistance: true,
        showOnMap: true
    },
    2: {
        id: 2,
        name: 'n2',
        meta: {
            desc: 'Другой текст 2',
            color: '#ff330099'
        },
        geojson: [[55.73, 37.459], [55.710, 37.544], [55.71, 37.524]]
    },
    3: {
        id: 3,
        name: 'Путь 3',
        meta: {
            desc: 'Описание 3',
            color: '#00449999'
        },
        geojson: [[55.67, 37.35], [55.70, 37.50], [55.72, 37.52]]
    },
};