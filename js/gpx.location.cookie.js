/*** 2021-08-15 Global param */

param = document.location.hash.substr(1) || $.cookie('location-settings'+window.location.pathname) || "55.644,37.495,11,0.90"

function ifMapChanged() {
    c = map.getCenter();

    const location_par =
        {
            lat:c.lat().toFixed(5),
            lng:c.lng().toFixed(5),
            zoom:map.getZoom(),
            opacity: arrOpacity,
            controls: { tileDetails: tile_info }
        }

    // let location_search = c.lat().toFixed(5) + ','
    //     + c.lng().toFixed(5)
    //     + ',' + map.getZoom()
    //     + ',' + hmOpacity.join("|")
    //     // + ',' + encodeURIComponent(JSON.stringify(hmOpacity))
    //     + ',' + tile_info
    //     + ',' + $.param( {"2021-06":hmOpacity[0],"2021-08":hmOpacity[1]});


    const location_search = encodeURIComponent(JSON.stringify(location_par));

    href = window.location.origin + window.location.pathname + "#" + location_search;
    window.location.href = href;

    // console.log("@@ cookie ", [window.location, location_search])

    $.cookie('location-settings'+window.location.pathname, location_search);

} //*** ifMapChanged()