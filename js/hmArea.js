document.write('<script type="text/javascript" src="js/cookie/jquery.cookie.js"></script>');
//2019-11-15 global var init

var map;
var homeGeo = ["55.6442983", "37.4959946"] // base
const hm_tiles={"v":1}

var globalSettings = { // 2020-02-25 добавить обновление из cookies
    distOnOff: {on: true, name: 'Дистанция', exec: ["updateMarkersOnMap"]},
    markerLableOnOff: {on: false, name: 'Метка точки', exec: ["updateMarkersOnMap"]},
    cacheOnOff: {on: false, name: 'Cache', exec: ["cacheOnOff"]},
    latlngOnOff: {on: true, name: 'LatLng', exec: ["updateMarkersOnMap"]},
    pathOnOff: {on: true, name: 'Путь', exec: ["updateMarkersOnMap"]},
    elevOnOff: {on: true, name: 'Высоты', exec: ["updateMarkersOnMap"]},
    overlay: {options: ["нет", "микро", "средние"], name: 'Покрытие', exec: ["updateOverlay"]}
};

var heat_map = {heat_activities_type: "all", heat_color: "hot"};


var context;

context = {
    activePointId: "",
    set_id: 0
}; // текущий контекст строка набора

var elevator;
var chart;
var isKeyControll = false;
var homeGeo
var zoom
var p

let hmOpacity
let dinfo
let param


//$( "#elevation-chart-div" ).resize( function(){ console.log("@@@ resize"); } );

$(document).ready(function () {
    document.onkeydown = function (e) {
        isKeyControll = ((e.ctrlKey == true));
    }
    document.onkeyup = function (e) {
        isKeyControll = false;
    }

    $(function () {
        $.getScript('js/gpx.adds.js');
        $.getScript('js/gpx.slider.js');
        $.getScript('js/gpx.location.cookie.js',function() {

            p = param.split(',');

            homeGeo = (isNaN(parseFloat(p[0])) || isNaN(parseFloat(p[1])))
                ? ["55.7", "37.32"] : [p[0].substr(0), p[1]];

            zoom = p[2] * 1 || 11;

            hmOpacity = p[3].split("|") || [0.9,0];
            dinfo = p[4] || 0;

            initMap();

        });

    });
});


window.tm = function (s = "") {
    var output = "";

// Remember when we started
    if (s == "") {
        lap = start = new Date().getTime();

        var date = new Date();
        var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

        console.log("Старт: %s", str);
    } else {
        var end = new Date().getTime();
        console.log("%s %s %s", end - start, end - lap, s);
        lap = end;
    }
};


MERCATOR = {

    fromLatLngToPoint: function (latLng) {
        var siny = Math.min(Math.max(Math.sin(latLng.lat * (Math.PI / 180)),
            -.9999),
            .9999);
        return {
            x: 128 + latLng.lng * (256 / 360),
            y: 128 + 0.5 * Math.log((1 + siny) / (1 - siny)) * -(256 / (2 * Math.PI))
        };
    },

    fromPointToLatLng: function (point) {

        return {
            lat: (2 * Math.atan(Math.exp((point.y - 128) / -(256 / (2 * Math.PI)))) -
                Math.PI / 2) / (Math.PI / 180),
            lng: (point.x - 128) / (256 / 360)
        };

    },

    getTileAtLatLng: function (latLng, zoom) {
        var t = Math.pow(2, zoom),
            s = 256 / t,
            p = this.fromLatLngToPoint(latLng);
        return {x: Math.floor(p.x / s), y: Math.floor(p.y / s), z: zoom};
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

/** @constructor Mercator */
function CoordMapType(tileSize, hist) {
    this.tileSize = tileSize;
    this.hist = hist;
}


function initMap(listener) {

    var mapOptions = {
        zoom: zoom,
//    mapTypeId: 'satellite',
        center: new google.maps.LatLng(homeGeo[0], homeGeo[1])
    };

    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    google.load("visualization", "1", {packages: ["chart"]});
    // Create an ElevationService.
    elevator = new google.maps.ElevationService();

    // map.overlayMapTypes.insertAt(0, new CoordMapType(new google.maps.Size(256, 256), '2021-06'));
    map.overlayMapTypes.insertAt(0, new CoordMapType(new google.maps.Size(256, 255), '2021-08'));

    google.maps.event.addListener(map, 'zoom_changed', function () {
        $('#zoom_info').html(this.getZoom());
        $('zoom').html(this.getZoom());

        ifMapChanged();

//         rect.setMap(null);

    });

    google.maps.event.addListener(map, 'center_changed', function () {
        ifMapChanged();

        lat = this.getCenter().lat().toFixed(5);
        lng = this.getCenter().lng().toFixed(5);

        $('latlng').html(lng + " " + lat);
        // console.log("@@ lng ",lng,lat);
    });


    google.maps.event.addListener(map, 'click', function (e) { // select div rectangle on map

        if (!isKeyControll) return;

        console.log("@@ addListener", context);

        set_id = context.activePointId.split("|")[3];

        console.log("@@ click addPoint", set_id, e.latLng.lat());

        i = {
            name: "Новая точка " + glob_gpx[set_id].points.length,
            description: "Описание",
            lat: e.latLng.lat().toFixed(5) || "55.4",
            lng: e.latLng.lng().toFixed(5) || "37.45"
        }


    });

    let controlDiv = $("#floating-panel");
    controlDiv.index = 1;

    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv[0]);

//   console.log ("@@ map.controls=", map.controls[google.maps.ControlPosition.TOP_RIGHT]);


    /**
     * The custom USGSOverlay object contains the USGS image,
     * the bounds of the image, and a reference to the map.
     */

        //     1232 645 11
// Eb: rg {g: 36.56279423131479, i: 36.73798701868521}
// mc: wg {g: 55.1790354627009, i: 55.27894749259669}

    const test_bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(55.1790354627009, 36.56279423131479),
        new google.maps.LatLng(55.27894749259669, 36.73798701868521)
    );

    const  x = 1232
    const  y = 645
    let  z = 11

    const testImage = 'http://gpxlab.ru/strava.php?z=' + z +
        '&x=' + x +
        '&y=' + y
    ;

    class USGSOverlay extends google.maps.OverlayView {
        bounds;
        image;
        div;
        constructor(bounds, image) {
            super();
            this.bounds = bounds;
            this.image = image;

        }
        /**
         * onAdd is called when the map's panes are ready and the overlay has been
         * added to the map.
         */
        onAdd() {
            this.div = document.createElement("div");
            this.div.style.borderStyle = "none";
            this.div.style.borderWidth = "0px";
            this.div.style.position = "absolute";
            // Create the img element and attach it to the div.
            const img = document.createElement("img");
            img.src = this.image;
            img.style.width = "100%";
            img.style.height = "100%";
            img.style.position = "absolute";
            this.div.appendChild(img);
            // Add the element to the "overlayLayer" pane.
            const panes = this.getPanes();
            panes.overlayLayer.appendChild(this.div);
        }
        draw() {
            // console.log("@@ USGSOverlay draw", this.bounds, this.image)

            // We use the south-west and north-east
            // coordinates of the overlay to peg it to the correct position and size.
            // To do this, we need to retrieve the projection from the overlay.
            const overlayProjection = this.getProjection();
            // Retrieve the south-west and north-east coordinates of this overlay
            // in LatLngs and convert them to pixel coordinates.
            // We'll use these coordinates to resize the div.
            const sw = overlayProjection.fromLatLngToDivPixel(
                this.bounds.getSouthWest()
            );
            const ne = overlayProjection.fromLatLngToDivPixel(
                this.bounds.getNorthEast()
            );

            // Resize the image's div to fit the indicated dimensions.
            if (this.div) {
                this.div.style.left = sw.x + "px";
                this.div.style.top = ne.y + "px";
                this.div.style.width = ne.x - sw.x + "px";
                this.div.style.height = sw.y - ne.y + "px";
            }
        }
        /**
         * The onRemove() method will be called automatically from the API if
         * we ever set the overlay's map property to 'null'.
         */
        onRemove() {
            if (this.div) {
                this.div.parentNode.removeChild(this.div);
                delete this.div;
            }
        }
        /**
         *  Set the visibility to 'hidden' or 'visible'.
         */
        hide() {
            if (this.div) {
                this.div.style.visibility = "hidden";
            }
        }
        show() {
            if (this.div) {
                this.div.style.visibility = "visible";
            }
        }
        toggle() {
            if (this.div) {
                if (this.div.style.visibility === "hidden") {
                    this.show();
                } else {
                    this.hide();
                }
            }
        }
        toggleDOM(map) {
            if (this.getMap()) {
                this.setMap(null);
            } else {
                this.setMap(map);
            }
        }
    }

    // console.log("@@ overlay",overlay)

    // const toggleButton = document.createElement("button");
    // toggleButton.textContent = "Toggle";
    // toggleButton.classList.add("custom-map-control-button");
    // const toggleDOMButton = document.createElement("button");
    // toggleDOMButton.textContent = "Toggle DOM Attachment";
    // toggleDOMButton.classList.add("custom-map-control-button");
    // toggleDOMButton.addEventListener("click", () => {
    //     overlay.toggleDOM(map);
    // });
    // map.controls[google.maps.ControlPosition.TOP_RIGHT].push(toggleDOMButton);
    // map.controls[google.maps.ControlPosition.TOP_RIGHT].push(toggleButton);

    const hmAreaButton = document.createElement("button");
    hmAreaButton.textContent = "GetHM"; // get hm_tile for cache
    hmAreaButton.classList.add("custom-map-control-button");
    hmAreaButton.addEventListener("click", () => {
        let map_bounds = map.getBounds()
        z = map.getZoom() + 1;
        hm_area(map_bounds,z)
     });
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(hmAreaButton);


    const clearHMButton = document.createElement("button"); // add to map clear HM button
    clearHMButton.textContent = "ClearHM"
    clearHMButton.classList.add("custom-map-control-button")
    clearHMButton.addEventListener("click", () => { clear_hm_tiles()});

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(clearHMButton);

    /**
     2021-08-15 create zoom lat lng
     */


    const zoomLatLngMonitor =  document.createElement("div");
    // $('zoom').html(zoom);
    // $('latlng').html(homeGeo[0] + " " + homeGeo[1]);

    zoomLatLngMonitor.innerHTML = "<zoom>"+zoom+"</zoom>"+" "+"<latlng>"+homeGeo[0] + " " + homeGeo[1]+"</latlng>";

    map.controls[google.maps.ControlPosition.TOP_CENTER].push(zoomLatLngMonitor);


    /**
     2021-08-15 create slider at map

    const mapSlider =  document.createElement("div");
    // $('zoom').html(zoom);
    // $('latlng').html(homeGeo[0] + " " + homeGeo[1]);

    mapSlider.innerHTML = '<div id="slider-panel">' +
        '<div className="slider_transparency" hist="2021-08">2021-08</div>' +
        '</div>';

    map.controls[google.maps.ControlPosition.TOP_CENTER].push(mapSlider);
*/


    function hm_area(map_bounds,z){


        console.log("@@ bounds=",map_bounds, test_bounds);
        let ne = map_bounds.getNorthEast();
        let sw = map_bounds.getSouthWest();

        // const N = map.getBounds().getNorthEast().lat();
        // const E = map.getBounds().getNorthEast().lng();
        // const S = map.getBounds().getSouthWest().lat();
        // const W = map.getBounds().getSouthWest().lng();
        // const N1 = new google.maps.LatLng(S, (W + E) / 2);



        let coord_NE = MERCATOR.getTileAtLatLng({lat:ne.lat(), lng:ne.lng()}, z);
        let coord_SW = MERCATOR.getTileAtLatLng({lat:sw.lat(), lng:sw.lng()}, z);

        let x =  coord_SW.x
        let y = start_y =  coord_SW.y

        let cnt = 0
        let max_cnt = 40000
        let srcImage;

        // console.log("@ NE=", coord_NE,"\nSW=",coord_SW);

        let overlay;

        while (x++ < coord_NE.x )
        {


            let y = start_y

            while (y-- > coord_NE.y && cnt++ < max_cnt)
            {

                let srcImage1 = 'http://gpxlab.ru/strava.php?z=' + z +
                    '&x=' + x +
                    '&y=' + y +
                    '&thumb=1'
                ;

                let tile_bounds = MERCATOR.getTileBounds({x: x, y: y, z: z})

                const img_bounds = new google.maps.LatLngBounds(tile_bounds.sw,tile_bounds.ne);

                 if ( !hm_tiles[x+'_'+y+'_'+z] ) {
                     overlay = new USGSOverlay(img_bounds, srcImage1);
                     hm_tiles[x + '_' + y + '_' + z] = overlay
                     overlay.setMap(map);
                 }

                // drawCacheArea(z, x, y, 0.1,srcImage)
            }
        }
    }


}


function drawCacheArea(z, x, y , opacity=.1, srcImage=false) {

    r_idx = z + "_" + x + "_" + y;

//    console.log("@@@ drawCacheArea z,x,y=",z,x,y, cache_area[r_idx]);


    if (typeof cache_area[r_idx] == 'undefined') {

        hmk = ((z > 8) ? z - 9 : 0) / 7;

        cache_area[r_idx] = new google.maps.Rectangle({
            strokeWeight: 1,
            strokeOpacity: Math.pow(z, 2) / Math.pow(16, 2.5),
            strokeColor: heatMapColorforValue(hmk),
            fillOpacity: opacity
        })


        var b2 = MERCATOR.getTileBounds({x: x, y: y, z: z});

        swlat = b2.sw.lat;
        swlng = b2.sw.lng;
        nelat = b2.ne.lat;
        nelng = b2.ne.lng;
        frame = (z * Math.pow(2.4, z)) / Math.pow(10, 8);

        dlt = (b2.ne.lat - b2.sw.lat) * frame;
        dlg = (b2.ne.lng - b2.sw.lng) * frame;

        swlat = b2.sw.lat + dlt;
        swlng = b2.sw.lng + dlg;
        nelat = b2.ne.lat - dlt;
        nelng = b2.ne.lng - dlg;

        const bounds =  new google.maps.LatLngBounds(
            new google.maps.LatLng(swlat, swlng),
            new google.maps.LatLng(nelat, nelng))

        // console.log("@@ bounds=", x , y , z ,bounds)

        cache_area[r_idx].setOptions({
            bounds: bounds,
//                              new google.maps.LatLng(b2.ne.lat,b2.ne.lng)),
            map: map
        });

        if (srcImage)
        {
            // new_overlay()
            // hmOverlay.draw(bounds, srcImage)
            // hmOverlay.onAdd()
        }

    }
} // end drawCacheArea()


CoordMapType.prototype.getTile = function (coord, zoom, ownerDocument, zoomplus=0) {

    var tile = MERCATOR.normalizeTile({x: coord.x, y: coord.y, z: zoom }),
        tileBounds = MERCATOR.getTileBounds(tile);

    var divTile = ownerDocument.createElement('div');

    dinfo = '2'

    switch (dinfo) {
        case '1' :
            tile_html = "<div style='background-color:rgba(255,255,255,0.75); width:100px;'>" + zoom + ',' + tile.x + ',' + tile.y + "</div>";
            break;
        case '2' :
            tile_html = "<div style='background-color:rgba(255,255,255,0.75); font-size:15px; color:blue; width:100px;'>"
                + zoom + ','
                + tile.x + ','
                + tile.y + '<br />'
                + tileBounds.ne.lat.toFixed(5) + ','
                + tileBounds.ne.lng.toFixed(5) + ',<br />'
                + "|</div>";
            break;
        default:
            tile_html = "-";
    }

    divTile.innerHTML = tile_html;
    divTile.style.width = this.tileSize.width + 'px';
    divTile.style.height = this.tileSize.height + 'px';
    divTile.className = 'heatmapdiv '+this.hist;
    divTile.hist = this.hist;
    divTile.style.fontSize = '10';
    divTile.style.borderStyle = 'solid';
    divTile.style.borderWidth = dinfo + 'px';
    divTile.style.borderColor = '#AAAAAA';
    divTile.style.opacity = hmOpacity;

    if (zoom < 17) {

        // ODH strava
        const srcImage = srcImageStrava = 'http://gpxlab.ru/strava.php?z=' + zoom +
            '&x=' + tile.x +
            '&y=' + tile.y  +
            '&heat_activities_type=' + heat_map.heat_activities_type +
            '&heat_color=' + heat_map.heat_color +
            '&hist=' + this.hist
        ;

        divTile.style.backgroundImage = "url('" + srcImage + "')";

    } else {

    }

    return divTile;
};



function getCacheStat(i) {
    console.log("@@ getCacheStat", i);

    $.ajax
    ({
        type: "POST",
        dataType: 'json',
        async: false,
        url: 'act.php',
        data: {get_cache_stat: i, depth: 10},
        success: function (d) {
            updateIntCols(d);
        },
        failure: function () {
            alert("Error!");
        }
    });

}

function clear_hm_tiles() {

    break_cnt = 0;
    console.log("@@ ", hm_tiles.length)

    if (hm_tiles.length === 0) alert("Nothing to clear")

    $.each(hm_tiles, function (k, v) {

        console.log("@@ clear_hm_tiles", k,v)
        v.onRemove();
        delete hm_tiles[k];
    });
}

// >>>> Секция для обработки кнопок тулбара
// ****************  helpers *******************

function heatMapColorforValue(value) {

    /*
0    : blue   (hsl(240, 100%, 50%))
0.25 : cyan   (hsl(180, 100%, 50%))
0.5  : green  (hsl(120, 100%, 50%))
0.75 : yellow (hsl(60, 100%, 50%))
1    : red    (hsl(0, 100%, 50%))
*/

    let h = (1 - value) * 280 + 5
    return "hsl(" + h + ", 100%, 40%)";
}


function show_cache_legend() {
    dv = "";
    for (i = 0; i <= 16; i++) {
        dv = dv + "<div style='background-color:" + heatMapColorforValue(i / 16) + "'>" + i + "</div>";
    }

    $('#legend').append("<div class=legend>" + dv + "</div>");
};

function gpxexec(proc) {
    $(proc).each(function (k, v) {
//        console.log ("@@ gpxexec", k,v );
        eval("(async () => {" + v + "()})()")
//        eval(v+"()");
    });
}


// google_sheets 2020-10-15

var glob_gpx = {};
var glob_gpx_set = {
    cols: ["set_id",
        "set_name",
        "set_description",
        "set_type",
        "set_prop",
        "user_id",
        "ord"],
    el: []
};
var glob_gpx_points = {};
var glob_gpx_to_save = {};
var gpx_line = [];
var setCounter;
var deferreds = [];

function hm_area(){
    const  bounds = map.getBounds();
    let ne = bounds.getNorthEast();
    let sw = bounds.getSouthWest();

    const N = map.getBounds().getNorthEast().lat();
    const E = map.getBounds().getNorthEast().lng();
    const S = map.getBounds().getSouthWest().lat();
    const W = map.getBounds().getSouthWest().lng();

    const z = map.getZoom() + 1;

    // const N1 = new google.maps.LatLng(S, (W + E) / 2);

    let coord_NE = MERCATOR.getTileAtLatLng({lat:ne.lat(), lng:ne.lng()}, z);
    let coord_SW = MERCATOR.getTileAtLatLng({lat:sw.lat(), lng:sw.lng()}, z);

    let x =  coord_SW.x
    let y = start_y =  coord_SW.y

    let cnt = 0
    let max_cnt = 30
    let srcImage;

    console.log("@ NE=", coord_NE,"\nSW=",coord_SW);

    while (x++ < coord_NE.x )
    {
        let y = start_y

        while (y-- > coord_NE.y && cnt++ < max_cnt)
        {
        // coord = MERCATOR.getTileAtLatLng({lat:llat, lng:W }, z);
        // let nextTile = MERCATOR.getTileBounds({x: coord.x, y: coord.y + cnt, z: z});
        // llat = nextTile.sw.lat

            srcImage = 'http://gpxlab.ru/strava.php?z=' + z +
                '&x=' + x +
                '&y=' + y
            ;

        drawCacheArea(z, x, y, 0.1,srcImage)

        }
        console.log("@@ bounds lat =", x, y, srcImage);
    }

    console.log("@ x,y=", x,coord_SW.x,"|",y,coord_NE.y);

}

