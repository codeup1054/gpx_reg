import {ifMapChanged} from "/app/map/map.location.cookie.js";
import {MERCATOR} from '/app/map/map.overlay.js?1'
// import {USGSOverlay} from "/app/map/map.usgsoverlay.js";

const hm_tiles ={}


export let mapControls = {
    add_cache_control: function () {

        const hmAreaButton = document.createElement("button");
        hmAreaButton.textContent = "Get"; // get hm_tile for cache
        hmAreaButton.classList.add("custom-map-control-button");
        hmAreaButton.addEventListener("click", () => {
            let map_bounds = map.getBounds()
            let z = map.getZoom() * 1 + $("#zoom_depth").val() * 1 + 1; // addzoom
            // console.log("@@ zoom depth=", map.getZoom(), z, $("#zoom_depth").val())
            hm_area(map_bounds, z)
        });
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(hmAreaButton);


        const clearHMButton = document.createElement("button"); // add to map clear HM button
        clearHMButton.textContent = "Clear"
        clearHMButton.classList.add("custom-map-control-button")
        clearHMButton.addEventListener("click", () => {
            clear_hm_tiles()
        });

        map.controls[google.maps.ControlPosition.TOP_LEFT].push(clearHMButton);

        let p = param

        // console.log ("@@ add_cache_controls",p)

        let mapContrlsDiv = document.createElement("div");
        mapContrlsDiv.classList.add("custom-map-control-div");

        $("#debug").append(mapContrlsDiv);

        const zoomDepthOptsSelect = ['1', '2', '3', '4','5','6'].map((v, k) => {
            return "<option value='" + k + "' " +
                ((p.controls.zoom_depth == v) ? 'selected >' : '>') + v + "</option>"
        }).join("")


        const innerHTML = `
        <select id='zoom_depth' class="gpx-controls" title='Zoom depth'>` + zoomDepthOptsSelect + `</select>`;

        mapContrlsDiv.innerHTML = "<div class='custom-map-control-div map-controls'>" + innerHTML + "</div>"

        p.map.controls[google.maps.ControlPosition.TOP_LEFT].push(mapContrlsDiv);

    },

    add_layers_controls: function () {
        let p = param

        let mapCtrl = document.createElement("div");
        mapCtrl.classList.add("custom-map-control-div");

        $("#debug").append(mapCtrl)

        const monthOptions = []
        const currMonth = new Date('2021-12-31');
        const now = new Date();

        now.setMonth(now.getMonth(), 2)

        while (currMonth.setMonth(currMonth.getMonth() + 1, 1) < now) {
            monthOptions.push(currMonth.toISOString().substr(0, 7))
        }

        let controlHTML = ""

        // let defaultMonth = Object.keys(param.mapOverlays)
        
        
        console.log ("@@ Object.keys(param.mapOverlays)",Object.keys(param.mapOverlays))

        let defaultMonth = ['2021-08'] //['2021-08','2021-11']

        // console.log ("@@ defaultMonth",defaultMonth)
        const overlaysDetails = Object.keys(overlayDetails)

        const tileOptsSelect = overlaysDetails.map((v, k) => {
            return k + "<option value='" + v + "' " + ((p.controls.overlayDetails == k) ? 'selected >' : '>') + v.substr(9) + "</option>"
        })


        $.each(defaultMonth, function (k, v)
            {
                // console.log ("@@ k,v",k,v)
                const monthOptsSelect = monthOptions.map((vv, kk) => {
                    return "<option value='" + v + "' " + ((v === vv) ? 'selected' : '') + ">" + vv + "</option>"
                }).join("")

                controlHTML = controlHTML +
                "<div target='"+v+"' class='slider' slider ></div>" +
                    "<select class='selector' map_overlay='" + k + "'>"+ monthOptsSelect + "</select>" +
                    "<select class='selector gpx-controls' id='mapOverlays' title='tile_info' " +
                    "onchange='param.mapOverlays[k]'>" + tileOptsSelect + "</select>"
                $(".selector_" +k).val(v).change()
    })

        mapCtrl.innerHTML = "<div class='slider_control' style='height:100px;'>" + controlHTML + "</div>"

        p.map.controls[google.maps.ControlPosition.TOP_LEFT].push(mapCtrl);

        this.add_compare_control()

        addSlider()

    },

    add_compare_control: function()
    {
        let p = param

        let mapCtrl = document.createElement("div");
        mapCtrl.classList.add("custom-map-control-div");

        $("#debug").append(mapCtrl)

        // console.log ("@@ defaultMonth",defaultMonth)


        const left_layer = ''

        let d = new Date()
        const right_layer = d.toISOString().substr(0,7) // current month

        const controlHTML =
            left_layer +
            "<div target='"+right_layer+"' class='slider' slider ></div>" +
            right_layer +
            "</br><div target = 'map' slider></div>Map"

        mapCtrl.innerHTML = "<div class='slider_control' style='height:100px;'>" + controlHTML + "</div>"

        p.map.controls[google.maps.ControlPosition.TOP_LEFT].push(mapCtrl);
    }
}



function addSlider() {

    const els = $("[slider]")

    $.each(els, function (k, v) {

        const sliderId = $(v).attr(`target`)
        const target = $(v).attr(`target`)

        // console.log("@@ addSlider k v ",[ k, v, sliderId, els, (param.mapOverlays[sliderId] !== undefined)]);

        let el_opacity = (param.mapOverlays[sliderId] !== undefined ) ? param.mapOverlays[sliderId].opacity : 0.5

        $(v).slider({
            orientation: "horizontal",
            range: "min",
            max: 100,
            value: el_opacity * 100,
            create: function (event, ui) {
                // console.log("@@ slider create",[event, ui, target ] )


                $('[target=' + sliderId + '] span.ui-slider-handle').html("<div>" + Math.floor(el_opacity * 100) + "</div>");
                if (target === 'map')
                    setMapStyler(el_opacity * 100);
                else
                    $('[' + target +']').css({opacity: el_opacity });
            },
            slide: function (event, ui) {
                let tval = ui.value;

                param.mapOverlays[sliderId] = {"opacity" :  tval / 100};

                if (target === 'map') {
                    setMapStyler(tval)
                } else {
                    $('.' + target).css('opacity', tval/100);
                    // $('.map-tile').css('opacity', tval/100);
                    // console.log ("@@ arrOpacity1",[target,tval,$('.map-tile'), $('.' + target).css('opacity')])
                }

                $('[target=' + sliderId + '] span.ui-slider-handle').html("<div>" + tval + "</div>");

                ifMapChanged();
            }
        })
    })
}

function hm_area(map_bounds, z) {

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



    // console.log("@@ bounds=", map_bounds);
    let ne = map_bounds.getNorthEast();
    let sw = map_bounds.getSouthWest();


    let coord_NE = MERCATOR.getTileAtLatLng({lat: ne.lat(), lng: ne.lng()}, z);
    let coord_SW = MERCATOR.getTileAtLatLng({lat: sw.lat(), lng: sw.lng()}, z);

    let x = coord_SW.x
    let start_y = coord_SW.y

    let cnt = 0
    let max_cnt = 40000

    let overlay;

    while (x++ < coord_NE.x) {

        let y = start_y

        while (y-- > coord_NE.y && cnt++ < max_cnt) {

            let srcImage1 = 'http://gpxlab.ru/app/php/app.strava.php?z=' + z +
                '&x=' + x +
                '&y=' + y +
                '&thumb1=1'
            ;

            let tile_bounds = MERCATOR.getTileBounds({x: x, y: y, z: z})

            const img_bounds = new google.maps.LatLngBounds(tile_bounds.sw, tile_bounds.ne);

            if (!hm_tiles[x + '_' + y + '_' + z]) {
                
                // console.log ("@@ hm_tiles",hm_tiles)
                
                overlay = new USGSOverlay(img_bounds, srcImage1);
                hm_tiles[x + '_' + y + '_' + z] = overlay
                overlay.setMap(map);
            }

            // drawCacheArea(z, x, y, 0.1,srcImage)
        }
    }
}

function clear_hm_tiles() {

    const break_cnt = 0;
    console.log ("@@ hm_tiles 2", [hm_tiles.length ,hm_tiles])

    if (hm_tiles.length === 0) alert("Nothing to clear")

    $.each(hm_tiles, function (k, v) {

        v.setMap(null);
        delete hm_tiles[k];
    });
}


function setMapStyler(tval) {
    const mapStyles = [{
        "stylers": [{
            "lightness": 2 * tval - 100
        }]
    }];

    // console.log("@@ mapStyles",mapStyles)

    map.setOptions({styles: mapStyles});

}