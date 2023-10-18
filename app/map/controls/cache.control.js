import {MERCATOR} from '/app/lib/geo.js?1'

export function cacheTool() {

    let mapCtrl = document.createElement("div");

    const hmAreaButton = document.createElement("button");
    hmAreaButton.textContent = "Get"; // get hm_tile for cache
    hmAreaButton.classList.add("custom-map-control-button");
    hmAreaButton.addEventListener("click", () => {
        let map_bounds = _map.getBounds()
        let z = _map.getZoom() * 1 + $("#zoom_depth").val() * 1 + 1; // addzoom
        // console.log("@@ zoom depth=", map.getZoom(), z, $("#zoom_depth").val())
        hm_area(map_bounds, z)
    });

    mapCtrl.appendChild(hmAreaButton);

    const clearHMButton = document.createElement("button"); // add to map clear HM button
    clearHMButton.textContent = "Clear"
    clearHMButton.classList.add("custom-map-control-button")
    clearHMButton.addEventListener("click", () => {
        clear_hm_tiles()
    });

    mapCtrl.appendChild(clearHMButton);

    // console.log ("@@ add_cache_controls",p)

    let mapContrlsDiv = document.createElement("div");
    mapContrlsDiv.classList.add("custom-map-control-div");

    $("#debug").append(mapContrlsDiv);

    const zoomDepthOptsSelect = ['1', '2', '3', '4','5','6'].map((v, k) => {
        return "<option value='" + k + "' " +
            ((_param.controls.zoom_depth == v) ? 'selected >' : '>') + v + "</option>"
    }).join("")


    const innerHTML = `
        <select id='zoom_depth' class="gpx-controls" title='Zoom depth'>` + zoomDepthOptsSelect + `</select>`;

    mapContrlsDiv.innerHTML = "<div class='custom-map-control-div map-controls'>" + innerHTML + "</div>"

    mapCtrl.appendChild(mapContrlsDiv);

    return mapCtrl;

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
                overlay.setMap(_map);
            }

            // drawCacheArea(z, x, y, 0.1,srcImage)
        }
    }
}

const hm_tiles ={}

function clear_hm_tiles() {

    const break_cnt = 0;
    console.log ("@@ hm_tiles 2", [hm_tiles.length ,hm_tiles])

    if (hm_tiles.length === 0) alert("Nothing to clear")

    $.each(hm_tiles, function (k, v) {

        v.setMap(null);
        delete hm_tiles[k];
    });
}