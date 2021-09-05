/*** 2021-08-15 Global param */
// console.log ("@@ param cookie",param)

let default_params

default_params = {
    homeGeo: ['55.7','37.32'],
    zoom: 11,
    controls: {
        tileDetails: 1,
        zoom_depth: 14,
        slider_values: {
            'map': 0.2,
            '2021-08': 0.5,
            '2021-06': 0.7
        }
    }
}



param = document.location.hash.substr(1)
    || $.cookie('location-settings'+window.location.pathname)
    || default_params

console.log("@@ init param ", [param,default_params, window.location, $.cookie('location-settings'+window.location.pathname)])


export function ifMapChanged() {
    let c = map.getCenter();

    const location_par =
        {
            homeGeo:[c.lat().toFixed(5),c.lng().toFixed(5)],
            zoom:map.getZoom(),
            opacity: arrOpacity,
            controls: {
                tileDetails: tile_info,
                zoom_depth: $("#zoom_depth").val()*1,
                slider_values:$('.slider').map((k,v)=>{return {k:v}})
            }
        }

    const location_search = encodeURIComponent(JSON.stringify(location_par));

    let href
    href = window.location.origin + window.location.pathname + "#" + location_search;
    window.location.href = href;

    console.log("@@ cookie ", [param,location_par, window.location, location_search])

    $.cookie('location-settings'+window.location.pathname, location_search);

} //*** ifMapChanged()
