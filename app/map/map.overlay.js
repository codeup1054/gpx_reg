import {model} from '/app/const.js'
import {_appState} from "../geodata/geo_model.js";
import {MERCATOR} from "/app/lib/geo.js";
import {stravaAuth} from "./controls/layer.control.js";

// let _map = mapObjects._map;

export function mapOverlay(param) {

    // console.log ("@@ param.mapOverlays",Object.keys(param.mapOverlays).join("_"), _map)
    // const layerKeys = Object.keys(param.mapOverlays)

    const layerKeys = ['2021-08'] // '2021-08'

    layerKeys.forEach((k) => {
        _map.overlayMapTypes.insertAt(0, new CoordMapType(k,''));
    })

    let d = new Date()
    const current_map = d.toISOString().substr(0,7)

    // param.map.overlayMapTypes.insertAt(0, new CoordMapType(layerKeys[1]+"_"+layerKeys[0]));
}

/** @constructor Mercator */
function  CoordMapType(overlayName, queryString='') {
    console.log("@@ 27",overlayName, queryString);

    this.tileSize = new google.maps.Size(256, 256);
    this.overlayName = overlayName;
    this.queryString = queryString;
}


CoordMapType.prototype.getTile = function (coord, zoom, ownerDocument) {

    let tile = MERCATOR.normalizeTile({x: coord.x, y: coord.y, z: zoom}),
        tileBounds = MERCATOR.getTileBounds(tile);

    let overlayName = this.overlayName
    let queryString = this.queryString

    let divTile = ownerDocument.createElement('div');
    let  TileHtmlContent
    
    // console.log("@@ this.overLay.tileInfoType",[overlayName, param.mapOverlays[overlayName]])

    const overlayDetailsSwitch = (_param.mapOverlays[overlayName] !== undefined)
        ? _param.mapOverlays[overlayName].overlayDetails
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
    

    divTile.style.opacity = (_param.mapOverlays[overlayName] !== undefined)
        ? _param.mapOverlays[overlayName].opacity
        : 0.5

    // let hm = model.get().heat_map
    if (zoom < 17) {

        let srcImage
        var now = new Date().getTime()
        if (queryString == 'direct' )
        {

            const imgCache = 'https://gpxlab.ru/app/php/app.strava.php?'+
                'z=' + zoom +
                '&x=' + tile.x +
                '&y=' + tile.y
                // + '&heat_activities_type=' + model.param.heat_map.heat_activities_type
                // + '&heat_color=' + model.param.heat_map.heat_color
                + '&' + queryString;

            // $.getJSON(imgCache, function(json) {})

            srcImage = 'https://heatmap-external-a.strava.com/tiles-auth/all/hot/13/4931/2572.png?px=256&Signature=dwfXqxVwmJz66P2AwcUwzJYe7dUfslTGQbz9h-HCYdS15TbZEUswfLS0~S' +
                'WQAnaqFDpVUNO6-IVdNolsReMuS2OeatzbgJwB0LnZJL5GCLBS1WX8-lF3-2TfMLliItLq7bwzr7jOBvrp8lx2zdLJwIaxRg1bXErO0TCUkOX4YdqBPdp9wBbun7GutoeG6mPYfZMOhusQwEd4pgKK1TwhxZ~MKyOLGPXVAXRqwe' +
                'Ggwu1rFhRuQcyW7MS~oVGCUeGrv14yYZJdhhnUgX~SbTuRbcgWeYoIogEeTA-5s6cLBfXNHdmIT4IdPi2DNRTjUihHDMlqQNx3d~JYIcCy7-YCmw__' +
                '&Key-Pair-Id=APKAIDPUN4QMG7VUQPSA' +
                '&Policy=eyJTdGF0ZW1lbnQiOiBbeyJSZXNvdXJjZSI6Imh0dHBzOi8vaGVhdG1hcC1leHRlcm5hbC0qLnN0cmF2YS5jb20vKiIsIkNvbmRpdGlvbiI6eyJEYX' +
                'RlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTY2MTIzODA4MX0sIkRhdGVHcmVhdGVyVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNjYwMDE0MDgxfX19XX0_'

            const cred = _appState['strava_cred'];

            queryString = `&Signature=${cred['CloudFront-Signature']}&Key-Pair-Id=${cred['CloudFront-Key-Pair-Id']}&Policy=${cred['CloudFront-Policy']}`;


            const cred_samp =
            {
                "CloudFront-Key-Pair-Id": "APKAIDPUN4QMG7VUQPSA",
                "CloudFront-Policy": "eyJTdGF0ZW1lbnQiOiBbeyJSZXNvdXJjZSI6Imh0dHBzOi8vaGVhdG1hcC1leHRlcm5hbC0qLnN0cmF2YS5jb20vKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTY5ODQxMzQyNn0sIkRhdGVHcmVhdGVyVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNjk3MTg5NDI2fX19XX0_",
                "CloudFront-Signature": "H87CDHcjO6kEsqANs0uLAjqJYTkKuAPR0KJ7u~WOfoJrq587zYQNq~V7ZQv2VfdGE92~bYYjXsZgQF0MhCtzMe7vk6-LvB705PuGGt2zetDc2cCNk1VZIHIja75mUpxnnuPybWbro~qshPt-aP58Bdnitt2UoV8D9BBAEEDVGLmNm2GEBk-wMFQarkO6JFB1~aPFY7Z4C~0e5lDZlUdBDadrZAbZ~e4YKKvVi8ZuDGGwBGLz5EnWFdFO1SP5I2XQJ9T7lyggseA6jLeaauEbtUvDTwkORHsnc2X0kqjNSIzLiTU6DvewE4gFtX6eXOTQi7cZ4wo8ehPCjUmbt3lx7A__",
                "dt_less": "2023-10-27T13:30:26.000Z"
            }

            srcImage = `https://heatmap-external-a.strava.com/tiles-auth/all/hot/${zoom}/${tile.x}/${tile.y}.png?px=256${queryString}`;
            // console.log("@@ 99 srcImage", srcImage);

        }
        else if(1) {
            // srcImage = strava_url + '?z=' + zoom +
            //     '&x=' + tile.x +
            //     '&y=' + tile.y +
            //     '&px=256'+
            //     '&Signature='+ last_strava_cookie["CloudFront-Signature"] +
            //     '&KeyPairId='+last_strava_cookie["CloudFront-Key-Pair-Id"] +
            //     '&Policy=' + last_strava_cookie["CloudFront-Policy"]
            srcImage = 'https://gpxlab.ru/app/php/app.strava.php?z=' + zoom +
                '&x=' + tile.x +
                '&y=' + tile.y
                // + '&heat_activities_type=' + model.param.heat_map.heat_activities_type
                // + '&heat_color=' + model.param.heat_map.heat_color
                + '&hist=' + this.overlayName;
                }
        else
        {
            const [ms,me] = this.overlayName.split("_")

            srcImage = 'http://gpxlab.ru/php_modules/imgcmpr.php?z=' + zoom +
                '&x=' + tile.x +
                '&y=' + tile.y +
                '&ms=' + ms +
                '&me=' + me
            ;

        }

        divTile.style.backgroundImage = "url('" + srcImage + "')";
        // divTile.innerHTML = overlayName;
    }

    return divTile;
};



export function mapOverlayStravaDirect() {

        stravaAuth();
        _map.overlayMapTypes.insertAt(0, new CoordMapType('strava_direct','direct'));

}

