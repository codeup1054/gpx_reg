import {addSlider} from '/app/map/map.controls.js'
import {_appState} from "/app/geodata/geo_model.js";

// export function layerStravaHistory () {
//
//     let mapCtrl = document.createElement("div");
//     mapCtrl.classList.add("custom-map-control");
//
//     const monthOptions = []
//     const currMonth = new Date('2021-12-31');
//     const now = new Date();
//
//     now.setMonth(now.getMonth(), 2)
//
//     while (currMonth.setMonth(currMonth.getMonth() + 1, 1) < now) {
//         monthOptions.push(currMonth.toISOString().substr(0, 7))
//     }
//
//     let mapLayerSelectorHTML = ""
//     let defaultMonth = ['2021-08'] //['2021-08','2021-11']
//
//     // console.log ("@@ defaultMonth",defaultMonth)
//     const overlaysDetails = Object.keys(overlayDetails)
//
//     const tileOptsSelect = overlaysDetails.map((v, k) => {
//         return k + "<option value='" + v + "' " + ((_param.controls.overlayDetails == k) ? 'selected >' : '>') + v.substr(9) + "</option>"
//     })
//
//
//     $.each(defaultMonth, function (k, v)
//     {
//         // console.log ("@@ k,v",k,v)
//         const monthOptsSelect = monthOptions.map((vv, kk) => {
//             return "<option value='" + v + "' " + ((v === vv) ? 'selected' : '') + ">" + vv + "</option>"
//         }).join("")
//
//         mapLayerSelectorHTML =
//             // "<div target='"+v+"' class='slider' slider ></div>" +
//             "<select class='selector' map_overlay='" + k + "'>"+ monthOptsSelect + "</select>" +
//             "<select class='selector gpx-controls' id='mapOverlays' title='tile_info' " +
//             "onchange='_param.mapOverlays[k]'>" + tileOptsSelect + "</select>";
//
//         $(".selector_" +k).val(v).change();
//
//         let mapLayerSettings = document.createElement("span");
//         mapLayerSettings.innerHTML = mapLayerSelectorHTML + "<div><select class='selector' target2 = strava_direct><option>NO MAP</option><option>NOW</option></select></div>";
//         mapCtrl.appendChild(mapLayerSettings);
//
//         let mapLayerSlider = document.createElement("div");
//         // mapLayerSlider.innerHTML = "<div><select><option>NO MAP</option><option>NOW</option></select></div>";
//         mapLayerSlider.setAttribute("target", v);
//         mapLayerSlider.setAttribute("target2", 'strava_direct');
//         mapLayerSlider.setAttribute("slider", null);
//
//
//         addSlider(mapLayerSlider); // select Month in layerStravaHistory
//         // console.log("@@ mapLayerSlider",mapLayerSlider);
//         mapCtrl.insertBefore(mapLayerSlider,mapCtrl.firstChild);
//
//     })
//     return mapCtrl;
// }



export function layerStravaDirect () {

    let mapCtrl = document.createElement("div");
    mapCtrl.classList.add("custom-map-control");

    let mapLayerSlider = document.createElement("div");
        mapLayerSlider.setAttribute("target", 'strava_direct');
        mapLayerSlider.setAttribute("slider", null);
        addSlider(mapLayerSlider); // strava direct
        // console.log("@@ mapLayerSlider",mapLayerSlider);
        mapCtrl.insertBefore(mapLayerSlider,mapCtrl.firstChild);

    return mapCtrl;
}


export function stravaAuth()
{
    const dt_now = new Date();



    if (_appState['strava_cred'] === undefined  ||  _appState['strava_cred']['dt_less']  > dt_now)
    {
        $.getJSON("/data/apify.dat?t="+Date.now(), function(json) {
            const strava_cred = json[Object.keys(json)[0]]

            console.log(`@@ layer.control json`, Date.now());
            _appState['strava_cred']  = strava_cred;

            // const  queryString = '&Signature='+strava_cred['CloudFront-Signature'] +
            //     '&Policy='+strava_cred['CloudFront-Policy'] +
            //     '&Key-Pair-Id='+strava_cred['CloudFront-Key-Pair-Id'] ;
            //
            // const strava_url = 'https://heatmap-external-a.strava.com/tiles-auth/all/hot'
            // const strava_php_direct ='http://gpxlab.ru/app/php/app.strava.direct.php'

            const token = strava_cred['CloudFront-Policy']

            let base64Url = token.split('.')[0];
            let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '=');

            let jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const Policy = "eyJTdGF0ZW1lbnQiOiBbeyJSZXNvdXJjZSI6Imh0dHBzOi8vaGVhdG1hcC1leHRlcm5hbC0qLnN0cmF2YS5jb20vKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTY5ODQxMzQyNn0sIkRhdGVHcmVhdGVyVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNjk3MTg5NDI2fX19XX0_";

            // console.log("@@ auth 1",strava_cred, jsonPayload,'\n' ,base64); //

            let parsedPolicy = JSON.parse(jsonPayload);
            // {AWS:EpochTime: 1698413426}
            const dateLess = parsedPolicy["Statement"][0]["Condition"]["DateLessThan"]["AWS:EpochTime"];

            // let t = 1698413426
            //  t = 1549312452

            const dt_less = new Date(dateLess * 1000);
            _appState['strava_cred']['dt_less'] = dt_less;

            console.log(`@@ 21.01 layer.control strava_cred`, strava_cred, _appState['strava_cred']);


            // console.log("@@ auth 2",dt_less, dt_less < dt_now); //
        });

    }
    else
    {
        console.log("@@ 71 dt_signature",dt_signature);
    }

    // _map.overlayMapTypes.insertAt(0, new CoordMapType(current_map, queryString));
}



export function mapStyleTool()
{
    let mapCtrl = document.createElement("div");
    mapCtrl.classList.add("custom-map-control");
    mapCtrl.innerHTML = '<span><b>darkness</b></span>';

    // let d = new Date()
    // const left_layer = d.toISOString().substr(0,7) // current month
    // const right_layer = d.toISOString().substr(0,7) // current month
    //

    let mapStyleSlider = document.createElement("div");
    mapStyleSlider.classList.add('slider');
    mapStyleSlider.setAttribute("target", 'map');
    mapStyleSlider.setAttribute("slider", null);
    addSlider(mapStyleSlider); // style map darkness

    mapCtrl.insertBefore(mapStyleSlider,mapCtrl.firstChild);


    return mapCtrl ;
}