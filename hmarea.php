<html>
<!-- 2019.08.29 сделать сегменты для маршрута. -->
<head>
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon"/>
    <link rel="icon" href="/favicon.ico" type="image/x-icon"/>
    <link href="gpx.css" rel="stylesheet" type="text/css" />

<!--    <script type="text/javascript" src="js/jquery.js"></script> -->
    <link rel="stylesheet" href="/js/jquery/jquery-ui.min.css">

    <script src="/js/jquery/jquery.js"></script>
    <script src="/js/jquery/jquery-ui.js"></script>

    <script type="text/javascript" src="/js/cookie/jquery.cookie.js"></script>
    <script src="/js/hmArea.js"></script>
<!--    <script type="text/javascript" src="/gpx/js/google_sheets_api.js"></script> -->

<!--   bootstrap  -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>


    <script type="text/javascript" src="https://www.google.com/jsapi"></script>


</head>
<body>
</body>

<div id="container-fluid" >
    <div id="right_panel" class="container-fluid">
        <div id="slider-panel" style="height: 30px; font-size: 8px">
            <div id ="id_2021-07" class="slider_transparency" target="2021-07"></div>2021-07<br/>
            <div id ="id_2021-08" class="slider_transparency" target="2021-08"></div>2021-08<br/>
            <div id ="id_2021-07_2021-08" class="slider_transparency" target="2021-07_2021-08"></div>2021-06_2021-08<br/>
            <div id ="slider_map" class="slider_transparency" target="map"></div>map
        </div>
        <div id="map" class="map"></div>
    </div>
</div>

</script>

    <script async defer
    src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCqtLzdiGvGIu85wF1C7w4UKdUncnwgF0M">
    </script>
<div id="debug" class="hide"><button onclick='$("#debug").addClass("hide");'>Закрыть</button></div>

</body>
</html>
<script>
    $(document).ready(function () {

        function HMArea(){
            const  bounds = map.getBounds();
            console.log("@@ bounds =",bounds);
        }

    });

</script>
