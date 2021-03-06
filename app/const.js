window.overlayDetails = {}
window.overlayDetails.TILEINFO_NO = 0;
window.overlayDetails.TILEINFO_XY = 1;
window.window.overlayDetails.TILEINFO_VERB = 2;


export let model
model = {

    param: {
        homeGeo: {lat: "55.644", lng: "37.497"},
        zoom: 14,
        controls: {zoom_depth:2}  ,
        mapLightess: 50,
        mapOverlays:
            {
                '2021-08': {opacity: 0.3, overlayDetails: overlayDetails.TILEINFO_XY}, // SIMPLE_TILEINFO,
                '2021-11': {opacity: 0.3, overlayDetails: overlayDetails.TILEINFO_VERBOSE} // 'TILEINFO_VERBOSE'
            },
        heat_map: {heat_activities_type: 'all', heat_color: 'hot'},
    },
    get: function () {

        let location_param = document.location.hash.substr(1)
            || $.cookie('location-settings' + window.location.pathname)
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

// console.log ("@@ const",param)


