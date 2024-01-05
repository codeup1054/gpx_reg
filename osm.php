<html>
<!--
2023.12.19 - https://leafletjs.com/examples/quick-start/
-->
<head>
    <link rel="stylesheet" href="/js/jquery/jquery-ui.css">
    <script type="text/javascript" src="/js/jquery/jquery.js"></script>
    <script type="text/javascript" src="/js/jquery/jquery-ui.js"></script> <!-- slider -->
    <link href="/app/osm/lib/L.Control.Opacity.css" rel="stylesheet" />

    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossorigin=""/>
    <!-- Make sure you put this AFTER Leaflet's CSS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
            crossorigin=""></script>
    <link href="app/app.css" rel="stylesheet" type="text/css" />
    <link href="app/osm/osm.css" rel="stylesheet" type="text/css" />


</head>
<body>

<div id="map" class="map"></div>
<div id="control_panel" ></div>

<script id="app" type="module"  src="app/osm/osm.map.init.js?3"></script>

<script src="https://unpkg.com/leaflet@latest/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet-providers@latest/leaflet-providers.js"></script>

<script src="/app/osm/lib/L.Control.Opacity.js"></script>
<script type="module"  src="/app/osm/lib/leaflet-editable-polyline.js"></script>



</body>
</html>
