<html>
<!-- 2019.08.29 сделать сегменты для маршрута.
2021.09.05 - module refactor
-->
<head>
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon"/>
    <link rel="icon" href="/favicon.ico" type="image/x-icon"/>
    <link href="gpx.css" rel="stylesheet" type="text/css" />
    <!--    <script type="text/javascript" src="js/jquery.js"></script> -->
</head>
<body>



<div id="container" >
        <div id="map" class="map"></div>
</div>

<script type="module">
</script>
<script async defer
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCqtLzdiGvGIu85wF1C7w4UKdUncnwgF0M">
</script>

<script type="module"  src="/app/app.js?3"></script>


<div id="debug" class="hide"><button onclick='$("#debug").addClass("hide");'>Закрыть</button></div>
</body>
</html>
