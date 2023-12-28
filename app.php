<html>
<!-- 2019.08.29 сделать сегменты для маршрута.
2021.09.05 - module refactor
-->
<head>
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon"/>
    <link rel="stylesheet" href="/js/jquery/jquery-ui.css">
    <link rel="icon" href="/favicon.ico" type="image/x-icon"/>
    <link href="gpx.css" rel="stylesheet" type="text/css" />
    <link href="app/app.css" rel="stylesheet" type="text/css" />
    <!--    <script type="text/javascript" src="js/jquery.js"></script> -->
</head>
<body>



<div id="container" >
        <div id="map" class="map"></div>
</div>

<!--<script type="module">-->
<!---->
<!--    // API_KEY 20231211 == AIzaSyBgxpjYDBZGEX0jRrsx2aKuaKrOYWfBVgM-->
<!---->
<!---->
<!--    const API_KEY = 'AIzaSyCqtLzdiGvGIu85wF1C7w4UKdUncnwgF0M'-->
<!--                     -->
<!--    const script = document.body.appendChild(document.createElement('script'));-->
<!--    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=drawing`;-->
<!--    // script.addEventListener('load', initialize);-->
<!---->
<!--</script>-->

<script async defer type = "text/javascript"
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCqtLzdiGvGIu85wF1C7w4UKdUncnwgF0M&libraries=drawing">
</script>


<!--<script async defer type = "text/javascript"-->
<!--        src=`https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=drawing`>-->
<!--</script>-->


<script id="app" type="module"  src="app/app.js?2"></script>


<div id="debug" class="hide" style="position:fixed; height:150px; top:80%;"><div slider1>w</div><button onclick='$("#debug").addClass("hide");'>Закрыть</button></div>


</body>
</html>
