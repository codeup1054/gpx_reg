/**
 *
 * https://habr.com/ru/post/131249/  Примеры работы с разными map API
 *
 */

export let map;
export const map2 = 1123;

var startTimeInMS = Date.now()

let mapSetings =
    {
        drawingManager: false,
        polyVertix: true,
        laps: 0,
    }

let polySettingsDefault =
    {
        strokeColor: "#ee88bb",
        strokeOpacity: 1,
        strokeWeight: 1,
        fillColor: "#888888",
        fillOpacity: 0,
        editable: true
    }

let drawingManager;

const def_poly = [[55.74304776159889, 37.621644603062585],
    [55.73898912895983, 37.621129618931725],
    [55.73869921047625, 37.632115947056725],
    [55.74353090403494, 37.63228760843368]];

// import {polyLoader} from "./polyloader.js";
let globalPoly = {}
let globalMarkers = {}

function initialize() {

    // var myLatlng = new google.maps.LatLng(55.69, 37.37); // Skolkovo
    // var myLatlng = new google.maps.LatLng(55.74687136571561, 37.625673576960935); // Kremlin
    var myLatlng = new google.maps.LatLng(55.73, 37.508528); // Kremlin

    var myOptions = {
        zoom: 11,
        scaleControl: true,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
    const Polygons = []

    if (mapSetings.drawingManager) {
        drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [google.maps.drawing.OverlayType.POLYGON]
            },
            polygonOptions: {

                editable: true
            }
        });
        drawingManager.setMap(map);

        google.maps.event.addListener(drawingManager, "overlaycomplete", function (event) {
            overlayClickListener(event.overlay);

            const text = $('textarea').text()

            const PolyPoints = []

            event.overlay.getPath().forEach((k) => (PolyPoints.push([k.lat(), k.lng()])))

            Polygons.push(PolyPoints)


            $('textarea').text('[' +
                Polygons.map(e => '[' + (e).join('],[') + ']').join('],\n[') +
                ']');

        });

    } // if mapSetings.drawingManager


    controlPanel();

    google.maps.event.addListenerOnce(map, 'idle', function(){
        console.log("@@ poly",(Date.now() - startTimeInMS)/1000)
    });

}

function overlayClickListener(overlay) {
    google.maps.event.addListener(overlay, "mouseup", function (event) {
        // $('#vertices').val(overlay.getPath().getArray());
        const text = $('textarea').value
        $('textarea').innerText(text + '\n' + event.overlay.getPath().getArray());
    });
}

google.maps.event.addDomListener(window, 'load', initialize);

function copyTextToClipBoard(text) {

    console.log("@@ text", text)
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(text).select();
    document.execCommand("copy");
    $temp.remove();
}


function CopyToClipBoard() {

    var copyTextarea = document.querySelector('textarea');
    console.log("@@ copyTextarea", copyTextarea);
    copyTextarea.focus();
    copyTextarea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
    } catch (err) {
        console.log('Oops, unable to copy');
    }

}

var globalPolygonPath = [];

function addGeozone(lat, lng) {

    console.log("@@ lat,lng", lat, lng)

    const lat_s = 0.001
    const lng_s = 0.002

    let mapPolygonPath = []

    const polyCoords =
        [
            [lat + lat_s, lng - lng_s],
            [lat + lat_s, lng + lng_s],
            [lat - lat_s, lng + lng_s],
            [lat - lat_s, lng - lng_s]
        ]
    globalPolygonPath.push(polyCoords)

    polyCoords.forEach((v) => {

            mapPolygonPath.push(new google.maps.LatLng(v[0], v[1]))
        }
    )

    // console.log("@@ geoZoneCoords",globalPolygonPath)

    const geoZone = new google.maps.Polygon({
        paths: mapPolygonPath,
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
        editable: true
    });
    geoZone.setMap(map);
}


function createSubPoly(polygons = def_poly) {

    console.log("@@ polygons", polygons)
    polygons.forEach((v) => {
        let polygon_path = []
        v.forEach((vv) => {
                polygon_path.push(new google.maps.LatLng(vv[0], vv[1]))
                addGeozone(vv[0], vv[1]);
            }
        )

        const mapPoly = polySettingsDefault
        mapPoly.path = polygon_path
        
        // console.log ("@@ mapPoly",mapPoly)

        var polygon_map = new google.maps.Polygon(mapPoly);
        polygon_map.setMap(map);
    })
}


function drawPoly(polygons = def_poly) {

    const polygon_path = []

    const latShift = 0.000001 * polyDataLaps
    const lonShift = 0.000001 * polyDataLaps


    polygons.forEach((v) => {
        // console.log("@@ polygons", latShift)
        polygon_path.push(new google.maps.LatLng(v[0] + latShift, v[1] + lonShift))
    })

    const polygonLength = Object.keys(globalPoly).length

    const secPoly = {
        path: polygon_path,
        editable: false,
        title: '1',
        id: polygonLength
    }

    const mapPoly = { ...polySettingsDefault, ...secPoly };

    var polygon_map = new google.maps.Polygon(mapPoly);

    globalPoly[polygonLength] = polygon_map

    // console.log("@@ globalPoly2",globalPoly, polygonLength  )

    polygon_map.setMap(map);

    polyDataLaps++;

    if (mapSetings.polyVertix) {
        addVertix(polygon_path, polygonLength)
    }
    let pLen = Object.keys(globalPoly).length
    if( pLen % 1000 == 1)
        console.log("@@ poly",pLen, (Date.now() - startTimeInMS)/1000)


}


function addVertix(polygon_path,globalPolyId)
{
    var icon = {
        //path: google.maps.SymbolPath.CIRCLE,
        path1: "M -1 -1 L 1 -1 L 1 1 L -1 1 z",
        path: "M -1 -1 L 1 -1 L 1 1 L -1 1 z",
        strokeColor: "#440000",
        strokeOpacity: 0,
        fillColor: "#888888",
        fillOpacity: 1,
        scale: 2
    };

    var marker_options = {
        map: map,
        icon: icon,
        flat: true,
        draggable: true,
        raiseOnDrag: false
    };
    

    for (var i = 0; i < polygon_path.length; i++) {
        marker_options.position = polygon_path[i];

        let point = new google.maps.Marker(marker_options);

        const globalMarkersCnt = Object.keys(globalMarkers).length

        globalMarkers[globalMarkersCnt] = point

        google.maps.event.addListener(point, "drag", vertix_update(globalPolyId, i));
        google.maps.event.addListener(point,'idle', function(){
            console.log("@@ point",(Date.now() - startTimeInMS)/1000)
        });

    }

    function vertix_update(globalPolyId, i) {
        return function (event) {
            polygon_path = globalPoly[globalPolyId]
            polygon_path.getPath().setAt(i, event.latLng);
            globalPoly[globalPolyId] = polygon_path

            // console.log("@@ globalPoly 1", globalPoly[globalPolyId].getPath().getAt(i).lat());
        }
    }
}

function controlPanel() {

    /** 2021-11-18 чтение полигонов из файла*/

    const polyLoaderBtn = '<input type="button" value="polyloader" id="polyloader" />';
    $("#control_panel").append(polyLoaderBtn)

    $('#polyloader').on('click', (e) => {
        polyLoaderFile()
    })


    /** 2021-11-18 копирование в буфер обмена*/

    const textresTxt = `<div><button textresBtnCopy>CopyToClbrd</button></br>
                        <textarea id="textres"></textarea></div>`;

    $("#control_panel").append(textresTxt)


    $('[textresBtnCopy]').on('click', () => {
        copyTextToClipBoard($("#textres").val())
    })

    /** 2021-11-18 массив кнопок*/

    const CtrlEls =
        {
            deletePolygons: {btnName: "deletePolygons"},
            polyTest100: {btnName: "polyTest100"},
            polyToTextarea: {btnName: "polyToTextarea"},
            drawTextarea: {btnName: "drawTextarea"},
            drawMskHighway: {btnName: "drawMskHighway"}
        }

    for (let btn in CtrlEls) {
        // console.log("@@ k,v",btn)
        $("#control_panel").append(`<button ${btn}>${btn}</button></br>`)
        $(`[${btn}]`).on('click', () => {
            eval(btn + '( )')
        })
    }

}


function deletePolygons()
{
    for (let i in globalPoly)
        globalPoly[i].setMap(null);
    for (let i in globalMarkers)
        globalMarkers[i].setMap(null);

    globalPoly = {}
    globalMarkers = {}

}


const polygonsText = []

function polyToTextarea() {
    // console.log("@@ globalPoly", globalPoly)


    for (const [k, v] of Object.entries(globalPoly)) {
        const polygonText = []
        // console.log("@@ v", v,k)
        for (const [kk, vv] of Object.entries(v.getPath().td))
            // console.log("@@ kk,vv",kk,vv.lat())
            polygonText.push([vv.lat(), vv.lng()])

        polygonsText.push(polygonText)
    }


    console.log("@@ p0=", JSON.stringify(polygonsText), globalPoly.length)

    $("#textres").text(JSON.stringify(polygonsText))

}

function createCircle() {
    console.log("@@ createCircle", createCircle)
}


function polyTest100() {

    const dataFnames = [
        "app/geodata/msk-ring-polygons.csv",
        "app/geodata/geozones_mta.csv",
        "app/geodata/gz_msk_highway_0.json",
        "app/geodata/msk-ring-polygons.csv"];

    const fname = dataFnames[2];


    $.get(fname, function (data) {

        const polyArray = eval(data)
        polyArray.forEach((v) => drawPoly(v))
        $("#vertices").val(JSON.stringify(globalPolygonPath).replaceAll("]],[[", "]]\n[["))

    });
}

let polyDataLaps = 0

for (let i = 0; i < mapSetings.laps; i++) {
    drawMskHighway(i)
}


function drawMskHighway() {

    const dataFnames = ["app/geodata/gz_msk_highway_0.json?1"];

    $.get(dataFnames[0], function (data) {

        const polyArray = eval(data)
        polyArray.forEach((v) => drawPoly(v))

    });

}


function drawTextarea() {

    const polyText = $("#textres").val()

    console.log("@@ polyText=", polyText)

    // const polygons = eval(polyText)
    const polygons = JSON.parse(polyText)

    console.log("@@ drawTextarea 1", polyText, polygons)

    for (const i in polygons)
    {   
        console.log ("@@ p",polygons[i])
        drawPoly(polygons[i]);
    }



}

/**
 "* * * * * *"
 | | | | | |
 | | | | | |
 | | | | | day of week
 | | | | month
 | | | day of month
 | | hour
 | minute
 second(optional)
 */


// const masks = {
//     "* 00 9 * 1-5 *": {commands: {start_engine: [device_id]}}, // по рабочим дням в 9:00
//     "* 15 8 * 7 *": {commands: {start_engine: [device_id]}},   // по выходным в 8:15
//
// }

// masks.each((mask) =>
// const job = nodeCron.schedule(mask, () => {
//     masks.commands.each((command) => command.exec())
// })
// job.stop()
// )
