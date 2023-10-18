// let _map = null;
// export let _map;

export let _appState = {
    key_sort : 'tm_modified',
    sort_direction : 1  // default 1 - asc
}

/** 2023-10-17 n-state checkbox*/

export const _stateControl = {
    0: {icon:"", backgroundColor:"", borderColor:"#888"  },
    1: {icon:"&#9658", backgroundColor:'#0075FF', borderColor:'#0075FF', color:'#FFF' },
    2: {icon:"&#9668", backgroundColor:'#0075FF', borderColor:'#0075FF', color:'#FFF' },
};


export let _mapObjects = {
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
            distanceDirection: 1,
            showPolyLine: true,
        },
        geojson: [[55.723, 37.45], [55.73, 37.501], [55.72, 37.51]],
        active: true,
    },
    2: {
        id: 2,
        name: 'n2',
        meta: {
            desc: 'Другой текст 2',
            color: '#ff330099'
        },
        geojson: [[55.73, 37.459], [55.710, 37.544], [55.71, 37.524]]
    }
};