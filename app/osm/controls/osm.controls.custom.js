
import {geosCrud} from "./osm.geos.crud.js";
import {getGeosJQ} from "../api/gpx.geos.api.js";
import {addAction} from "./osm.actions.js";
import {osmMarkers} from "../mapobjects/osm.marker.js";
import {osmAllPolylines} from "../mapobjects/osm.polyline.js";


export function addControl()
{

    // $("#control_panel").html("<div>test</div>");

    getGeosJQ(()=>{
        osmDisplayMapParams();
        geosCrud(addAction);
        console.log(`@@  46 callback`);
        // osmMarkers();
        osmAllPolylines();
    });


}


function osmDisplayMapParams()
{

    $("#control_panel").append(`<div id="control_map_params" class="custom-map-control-div"><zoom/><lat/><lng/></div>`);

    _osmmap.on('load zoomend move', showZoomCenter  );

    showZoomCenter();

}

function showZoomCenter()
{
    const c = _osmmap.getCenter();
    const zoom = _osmmap.getZoom();
    $("zoom").text(zoom);
    $("lat").text(c.lat.toFixed(4));
    $("lng").text(c.lng.toFixed(4));
}