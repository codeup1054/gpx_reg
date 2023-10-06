let map;
let mapcanvas;
let coordinates = [];
function InitMap(){
    let location = new google.maps.LatLng(55.47, 37.47);
    let mapOptions = {
        zoom: 12,
        center: location
    }

    console.log("@@ mapOptions = ", mapOptions);

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    let drawingManager = new google.maps.drawing.DrawingManager({
        drawingControllOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER,
            drawingModes:[ google.maps.drawing.OverlayType.POLYGON
            ]
        },

        polygonOptions:{
            clickable:true,
            draggable:false,
            editable:true,
            fillColor:"#FF0055",
            fillOpacity:0.5
        },
        streetViewControlOptions: {
            position: google.maps.ControlPosition.LEFT_TOP,
        },
        fullscreenControl: true,
    })
    drawingManager.setMap(map);
}


$(document).ready ( function(){
    console.log("@@ poly_test", google);
    InitMap();
});

// document.addEventListener('DOMContentLoaded', function() {
// }, false);

