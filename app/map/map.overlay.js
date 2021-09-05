
function addOverlays() {
    map.overlayMapTypes.insertAt(0, new CoordMapType(new google.maps.Size(256, 256), '2021-07'));
    map.overlayMapTypes.insertAt(0, new CoordMapType(new google.maps.Size(256, 256), '2021-08'));
    map.overlayMapTypes.insertAt(0, new CoordMapType(new google.maps.Size(256, 256), '2021-07_2021-08'));

    setMapStyler(param.slider_values['map'] * 100 || 100);
}