import {model} from '/app/const.js'

export function mapOverlay(param) {


    console.log ("@@ param.mapOverlays",Object.keys(param.mapOverlays).join("_"))

    // const layerKeys = Object.keys(param.mapOverlays)
    const layerKeys = ['2021-08','2022-02']

    layerKeys.forEach((k) => {
        param.map.overlayMapTypes.insertAt(0, new CoordMapType(k));
    })

    param.map.overlayMapTypes.insertAt(0, new CoordMapType('2022-02'));
    // param.map.overlayMapTypes.insertAt(0, new CoordMapType(layerKeys[1]+"_"+layerKeys[0]));
}

/** @constructor Mercator */
function CoordMapType(overlayName) {
    this.tileSize = new google.maps.Size(256, 256);
    this.overlayName = overlayName;
}


CoordMapType.prototype.getTile = function (coord, zoom, ownerDocument) {

    let tile = MERCATOR.normalizeTile({x: coord.x, y: coord.y, z: zoom}),
        tileBounds = MERCATOR.getTileBounds(tile);

    let overlayName = this.overlayName

    let divTile = ownerDocument.createElement('div');

    let  TileHtmlContent
    
    // console.log("@@ this.overLay.tileInfoType",[overlayName, param.mapOverlays[overlayName]])

    const overlayDetailsSwitch = (param.mapOverlays[overlayName] !== undefined)
        ? param.mapOverlays[overlayName].overlayDetails
        : overlayDetails.TILEINFO_NO

    switch (overlayDetailsSwitch) {
        case overlayDetails.TILEINFO_XY :
            TileHtmlContent = `<span class="tile_info " style='font-size:13px;'>`
                + zoom + '<br>' + tile.x + '<br>' + tile.y
                + "</span>";
            break;
        case overlayDetails.TILEINFO_VERB :
            TileHtmlContent =
                `<div class="tile_info " style="font-size:15px; " >`
                + '<div class="hm t">' + tileBounds.ne.lat.toFixed(7) + '</div>'
                + '<div class="hm t">' + tileBounds.ne.lat.toFixed(7) + '</div>'
                + '<div class="l vm">' + tileBounds.sw.lng.toFixed(7) + '</div>'
                + '<div class="l t">' + zoom + '<br>' + tile.x + '<br>' + tile.y + '</div>'
                + '<div class="l t">' + zoom + '<br>' + tile.x + '<br>' + tile.y + '</div>'
                + "</div>";
            break;
        default:
            TileHtmlContent = "";
    }

    const tileHtml = "<div class='map-tile'>"+TileHtmlContent+"</div>"

    divTile.innerHTML = tileHtml;
    divTile.classList.add(overlayName);

    // console.log ("@@ param.mapOverlays,overlayName",[tileHtml,param.mapOverlays])
    

    divTile.style.opacity = (param.mapOverlays[overlayName] !== undefined)
        ? param.mapOverlays[overlayName].opacity
        : 0.5


    // let hm = model.get().heat_map

    if (zoom < 17) {
        // ODH strava

        let srcImage

        if(this.overlayName.length < 8) {
            srcImage = 'http://gpxlab.ru/app/php/app.strava.php?z=' + zoom +
                '&x=' + tile.x +
                '&y=' + tile.y
                // + '&heat_activities_type=' + model.param.heat_map.heat_activities_type
                // + '&heat_color=' + model.param.heat_map.heat_color
                + '&hist=' + this.overlayName;
        }
        else
        {
            const [ms,me] = this.overlayName.split("_")
            console.log ("@@ model.get()",this.overlayName)

            srcImage = 'http://gpxlab.ru/php_modules/imgcmpr.php?z=' + zoom +
                '&x=' + tile.x +
                '&y=' + tile.y +
                '&ms=' + ms +
                '&me=' + me
            ;

        }

        divTile.style.backgroundImage = "url('" + srcImage + "')";
    }

    return divTile;
};


export const MERCATOR = {

    fromLatLngToPoint: function (latLng) {
        var siny = Math.min(Math.max(Math.sin(latLng.lat * (Math.PI / 180)),
            -.9999),
            .9999);
        return {
            x: 128 + latLng.lng * (256 / 360),
            y: 128 + 0.5 * Math.log((1 + siny) / (1 - siny)) * -(256 / (2 * Math.PI))
        };
    },

    fromPointToLatLng: function (point) {     return {
            lat: (2 * Math.atan(Math.exp((point.y - 128) / -(256 / (2 * Math.PI)))) -
                Math.PI / 2) / (Math.PI / 180),
            lng: (point.x - 128) / (256 / 360)
        };
    },

    getTileAtLatLng: function (latLng, zoom) {
        let t = Math.pow(2, zoom), p = this.fromLatLngToPoint(latLng);
        return {x: Math.floor(p.x * t / 256 ), y: Math.floor(p.y * t / 256), z: zoom};
    },

    getTileBounds: function (tile) {
        tile = this.normalizeTile(tile);
        var t = Math.pow(2, tile.z),
            s = 256 / t,
            sw = {
                x: tile.x * s,
                y: (tile.y * s) + s
            },
            ne = {
                x: tile.x * s + s,
                y: (tile.y * s)
            };
        return {
            sw: this.fromPointToLatLng(sw),
            ne: this.fromPointToLatLng(ne)
        }
    },
    normalizeTile: function (tile) {
        var t = Math.pow(2, tile.z);
        tile.x = ((tile.x % t) + t) % t;
        tile.y = ((tile.y % t) + t) % t;
        return tile;
    }

}
