import {ifMapChanged} from '/app/map/map.location.cookie.js'
import {_mapObjects}  from "/app/geodata/geo_model.js";

export function initMap(param) {


    const mapOptions = {
        zoom: param.zoom || 11,
        center: new google.maps.LatLng(param.homeGeo.lat, param.homeGeo.lng),
        scaleControl: true,

        streetViewControl: true,
        streetViewControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.RIGHT_BOTTOM,
        },

        mapTypeControlOptions: {
            // style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.RIGHT_TOP,
            mapTypeIds: ["roadmap", "terrain", "satellite", "hybrid"],
        },

        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM,
        },

        fullscreenControl: false,
        fullscreenControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM,
        },

    };


    _map = new google.maps.Map(document.getElementById('map'), mapOptions);
    // _elevator = new google.maps.ElevationService();



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

        /*** The onRemove() method will be called automatically from the API if  we ever set the overlay's map property to 'null'. */
        onRemove() {   if (this.div) { this.div.parentNode.removeChild(this.div); delete this.div; }}
        hide() {if (this.div) {this.div.style.visibility = "hidden";}}  /***  Set the visibility to 'hidden' or 'visible'. */
        show() {if (this.div) {this.div.style.visibility = "visible";}}

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

    addMapListener();
    // return _map;
}


export function setMapStyler(param) {

    const lightness = param.mapLightess
    const mapStyles = [{
        "stylers": [{
            "lightness": 2 * lightness - 90
        }]
    }];
    _map.setOptions({styles: mapStyles});
}


function addMapListener() {

    google.maps.event.addListener(_map, 'zoom_changed', function () {
        const z = _map.getZoom()
        $('zoom').html(z);
        _param.zoom = z
        ifMapChanged();
    });


    google.maps.event.addListener(_map, 'center_changed', function () {
        ifMapChanged();
        const lat = this.getCenter().lat().toFixed(5);
        const lng = this.getCenter().lng().toFixed(5);

        _param.homeGeo.lat= lat
        _param.homeGeo.lng= lng

        $('lat').html(lat);
        $('lng').html(lng);
    });


    // define getBounds

    if (!google.maps.Polyline.prototype.getBounds)
        google.maps.Polyline.prototype.getBounds = function() {

            var bounds = new google.maps.LatLngBounds();

            this.getPath().forEach( function(latlng) { bounds.extend(latlng); } );

            return bounds;
        }

    google.maps.Polyline.prototype.inKm = function(n) {
        var a = this.getPath(n),
            len = a.getLength(),
            dist = 0;
        for (var i = 0; i < len - 1; i++) {
            dist += google.maps.geometry.spherical.computeDistanceBetween(a.getAt(i), a.getAt(i + 1));
        }
        return dist / 1000;
    }

}


