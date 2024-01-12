window.overlayDetails = {}
window.overlayDetails.TILEINFO_NO = 0;
window.overlayDetails.TILEINFO_XY = 1;
window.window.overlayDetails.TILEINFO_VERB = 2;
window.polylineStyles = {"mileage_marker_size":3, "color":"#ff22bbaa", "weight":2, "opacity":0.5 }


export let model
model = {

    param: {
        homeGeo: {lat: "55.644", lng: "37.497"},
        zoom: 14,
        controls: {zoom_depth:2}  ,
        mapLightess: 50,
        mapOverlays:
            {
                '2022-08': {opacity: 0.3, overlayDetails: overlayDetails.TILEINFO_NO}, // SIMPLE_TILEINFO,
                '2021-11': {opacity: 0.3, overlayDetails: overlayDetails.TILEINFO_VERBOSE}, // 'TILEINFO_VERBOSE'
                '2021-08': {opacity: 0.3, overlayDetails: overlayDetails.TILEINFO_XY}, // SIMPLE_TILEINFO,
            },
        heat_map: {heat_activities_type: 'all', heat_color: 'hot'},
    },

    get: function () {

        let location_param = document.location.hash.substr(1)
        // || $.cookie('location-settings' + window.location.pathname)
        || getCookie ('location-settings' + window.location.pathname)
        || false


        let p

        if (location_param.length) {
            const data = decodeURIComponent(location_param);

            p = JSON.parse(data);
            // console.log("@@ const param",p)
        }
        else
        {
            p = this.param
        }

        return p
    },
    set: function (param) {
        this.param = param
    }
}


const getCookie = (name) => {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=')
        return parts[0] === name ? decodeURIComponent(parts[1]) : r
    }, '')
}
// console.log ("@@ const",param)


window.pickerColors
= ['#b71c1c','#d32f2f','#f44336','#e57373','#ffcdd2',
    '#880e4f','#c2185b','#e91e63','#f06292','#f8bbd0',
    '#4a148c','#7b1fa2','#9c27b0','#ba68c8','#e1bee7',
    '#311b92','#512da8','#673ab7','#9575cd','#d1c4e9',
    '#1a237e','#303f9f','#3f51b5','#7986cb','#c5cae9',
    '#0d47a1','#1976d2','#2196f3','#64b5f6','#bbdefb',
    '#01579b','#0288d1','#03a9f4','#4fc3f7','#b3e5fc',
    '#006064','#0097a7','#00bcd4','#4dd0e1','#b2ebf2',
    '#004d40','#00796b','#009688','#4db6ac','#b2dfdb',
    '#194D33','#388e3c','#4caf50','#81c784','#c8e6c9',
    '#33691e','#689f38','#8bc34a','#aed581','#dcedc8',
    '#827717','#afb42b','#cddc39','#dce775','#f0f4c3',
    '#f57f17','#fbc02d','#ffeb3b','#fff176','#fff9c4',
    '#ff6f00','#ffa000','#ffc107','#ffd54f','#ffecb3',
    '#e65100','#f57c00','#ff9800','#ffb74d','#ffe0b2',
    '#bf360c','#e64a19','#ff5722','#ff8a65','#ffccbc',
    '#6e2723','#8d4037','#91447f','#a95548','#d7aa55',
    '#3e2723','#5d4037','#795548','#a1887f','#d7ccc8',
    '#263238','#455a64','#607d8b','#90a4ae','#cfd8dc',
    '#000000','#262626','#484848','#757575','#969696',
    '#a3a3a3','#BBBBBB','#CCCCCC','#DDDDDD','#FFFFFF',
    ]