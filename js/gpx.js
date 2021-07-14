document.write('<script type="text/javascript" src="js/cookie/jquery.cookie.js"></script>');
//2019-11-15 global var init

var map;
var homeGeo = ["55.6442983","37.4959946"] // base
var cache_area = {};

var globalSettings = { // 2020-02-25 добавить обновление из cookies
               distOnOff:{on:true,  name:'Дистанция', exec:["updateMarkersOnMap"]},
               markerLableOnOff:{on:false,  name:'Метка точки', exec:["updateMarkersOnMap"]},
               cacheOnOff:{on:false, name:'Cache', exec:["cacheOnOff"]},
               latlngOnOff:{on:true,name:'LatLng', exec:["updateMarkersOnMap"]},
               pathOnOff:{on:true,  name:'Путь', exec:["updateMarkersOnMap"]},
               elevOnOff:{on:true,  name:'Высоты', exec:["updateMarkersOnMap"]},
               overlay:{ options:["нет","микро","средние"],  name:'Покрытие', exec:["updateOverlay"]}
               };

var  heat_map = {heat_activities_type: "all", heat_color: "hot"};


var context;
  
 context = {activePointId:"",
            set_id:0}; // текущий контекст строка набора

var elevator;
var chart;
//var infowindow = new google.maps.InfoWindow();
var polyline;
// Load the Visualization API and the columnchart package.
var isKeyControll = false;


//$( "#elevation-chart-div" ).resize( function(){ console.log("@@@ resize"); } );

$(document).ready(function()
{   
    document.onkeydown = function(e) {  isKeyControll = ((e.ctrlKey == true)); }
    document.onkeyup = function(e)   {   isKeyControll = false; }
    
    
    $("input:radio").change(function(e){
        heat_map.heat_activities_type =  $(this).attr('heat_activities_type');
        heat_map.heat_color =  $(this).attr('heat_color');
        console.log("",heat_map);
    });
    
    
    // 2020-06-29  events   
    
    $('input[set_id]').on('change',function (event, target) {
      console.log("@@ select_all_checkboxes",event, target);
    });
    
    
    
    // 2019-08-20 изменяемые панели.
    
    $( "#debug" ).resizable();
    $( "#debug" ).draggable();
    
    var resize= $("#left_panel");
    var right_p = $("#right_panel")  
    var containerWidth = $("#container").width();  
    
    
        show_cache_legend();
    //    console.log( "@@ ready!" );
        
    $('#buttons_panel').html("***");    
    
    $(Object.keys(globalSettings)).each(function(k,v)
            { 
            el = globalSettings[v];
            
                            
//            console.log("@@ gl",v,el,el.on,el.name, $('#right_panel'));
            chk = (el.on)?"checked":"";
            
            if (typeof el.on !== 'undefined')
                {    
                $('#onmapOnOff').append(`<input type=checkbox  ${chk}
                id= ${v} onchange='globalSettings.${v}.on=this.checked; gpxexec(["${el.exec}"]);'/>
                <label for='on_of_distance'>${el.name}</label> | ` );
                }
            else 
                {   
                    sel = el.options.map(function(e){ return "<option>"+e+"</option>"; });
                    $('#onmapOnOff').append(`${el.name} <select 
                    id= ${v} onchange='globalSettings.${v}.on=this.checked; gpxexec(["${el.exec}"]);'>
                    ${sel}</select>` );
                }    
            
            });

      
$(resize).resizable({
      handles: 'e',
      maxWidth: '100%',
      minWidth: 120,
      resize: function(event, ui){

//        console.log("@@ containerWidth ", containerWidth , resize);

          var currentWidth = ui.size.width;
          
          // this accounts for padding in the panels + 
          // borders, you could calculate this using jQuery
          var padding = 30;
          
          // this accounts for some lag in the ui.size value, if you take this away 
          // you'll get some instable behaviour
          $(this).width(currentWidth);
          
          // set the content panel width
          $(right_p).width(containerWidth - currentWidth - padding);            
      }
});
     
  //alert(1);
   $(".tab td:nth-child(4)").attr("contenteditable",true);
   $(".tab td").on('click1', function() {
        idx = $(this).closest('tr').attr('idx');
//        console.log("@@ row", idx, $('.idx'+idx));
        console.log("@@ss ", idx, );
        $('.bselect').toggleClass('bselect');
        $('.idx'+idx).toggleClass('bselect');
        
        var latLng = new google.maps.LatLng(markers[idx][0].position.lat(), markers[idx][0].position.lng()); 
        
//        map.panTo(latLng);
        
   } );


   
   
   $(".save_to_csv").click(function(){
    
       var ms = [];
       console.log(".save_to_csv", markers);

       for (var i = 0; i < markers.length; i++) {
           mm = {}; 
           mm.idx = i;
           ms.push(mm);
       }
       
//      console.log("@@ ms", ms);  
    
      $.post("a.php",
      {
        name: "Donald Duck",
        city: "Duckburg",
        markers: JSON.stringify(ms) 
      },
      
      function(data, status){
//        console.log("Data: " + data + "\nStatus: " + status);
      });
    });

// дожидаемся загрузки и делаем infoWindow стильным  
  
})


var clr_r = [
'rgb(200,  0,  0)',
'rgb(255, 90, 20)',
'rgb(250,225, 10)',
'rgb(100,230, 10)',
'rgb( 30,180, 15)',
'rgb( 80,190,155)',
'rgb( 80,180,230)',
'rgb( 100,120,230)',
'rgb( 170,190,210)',
'rgb( 210,220,230)'
];
 

param = document.location.hash.substr(1) || $.cookie('location-settings') || "55.644,37.495,11,0.90"


var p = param.split(',');

var homeGeo = ( isNaN(parseFloat(p[0])) || isNaN(parseFloat(p[1])) )
                ? ["55.7","37.32"] : [p[0].substr(0), p[1]];

//var homeGeo = [hashGeo[0].substr(1),hashGeo[1]]

var zoom = p[2]*1 || 11 ;
var hmOpacity = p[3] || 0.9;
var dinfo = p[4] || 0;


//var zoom = hashGeo[2].substr(0, hashGeo[2].length - 1);

console.log ("@@ 2 hashGeo", $.cookie('location-settings'),
    "\nparams=" , param,
    "\np=" , p,
    "\nhomeGeo=" , homeGeo, zoom, document.location );


var tile_cnt = 0 ;


window.tm = function (s="")
{
    var output = "";

// Remember when we started
   if (s == "")
   {
    lap = start = new Date().getTime();
    
    var date = new Date();
    var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

    console.log("Старт: %s",str);        
    }
    else 
    {
    var end = new Date().getTime();
    console.log("%s %s %s",end - start,end - lap,s);        
    lap = end; 
    }
};

tm();

// Класс для обработки массивов маркеров


var olat, olng;

class _markers {
  
    constructor(d)    {
        this.path_total_dist = 0;
        this.d = d;  
        }
    
    updateMarkerRow() {   } //console.log(this.d);
    push(arr) { this.d.push(arr);  }
    addMarkers() {  // 01. добавить все маркеры на карту

    var self = this;
    this.path_total_dist = 0;
     
    while(markers.length) { markers.pop().setMap(null); }  
     
    $(this.d).each(function(k,m) {
        if( isFloat(m.lat*1) && isFloat(m.lng*1) )
        self.placeMarker(m);}) 
    }

    placeMarker(m,prop={'fill':"%23113388"}) { // 02. отрисовать маркер на карте
    
// console.log("@@ placeMarker", m);
     olat = this.olat || m.lat;
     olng = this.olng || m.lng;
     
     var dist = getDistanceFromLatLonInKm(m.lat, m.lng, olat,olng);
     [this.olat, this.olng] = [m.lat, m.lng];
     
     this.path_total_dist += dist;
     
//     var dist = m.dist;
     var color = ( typeof m.color !== 'undefined')? m.color : "#ffee00";
     var pos = new google.maps.LatLng(m.lat, m.lng);    
        
     switch (m.gpxSet)
        {
            case "Велобайк":
                   console.log("@@ placeMarker", m.gpxSet);
                   icon = {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 2.5,
                        fillColor: "#ff22dd",
                        fillOpacity: 0.9,
                        strokeWeight: 0.1
                    };
                    break;
            default: 

                    var markerTitle = m.name+'\n'+m.lat+','+m.lng;
                    var text_lines = svg_text_to_lines(m.name, 15, 4);
                    var l = 0;
                    
                    text_lines = text_lines.concat([parseFloat(m.lat).toFixed(5)+','+parseFloat(m.lng).toFixed(5)]);
                    
                    
                    var m_text = $( text_lines ).map(function(k,v) {
                        l++; return '<text x="20" y="'+(l*9)+'" font-family="Arial, sans-serif" fill="%23113388" stroke="none" \
                              paint-order="stroke" text-anchor="left" font-size="9"  >'+v+'</text>'; 
                        }).get().join('');
                    
                    var [setName,pointName,p_pos,set_id,gpx_id] = m.gpx_id.split('|');
                    
                                          
                     if (glob_gpx[set_id].set_type == 0)
                     {
                     var elevationService = new google.maps.ElevationService();
                     var latLng = new google.maps.LatLng(m.lat, m.lng);
                     var elev =0;

                     var requestElevation = {'locations': [latLng] }; // calback
                    
                     elevationService.getElevationForLocations(requestElevation, function(results, status) {
                        if (status == google.maps.ElevationStatus.OK) {
                          if (results[0]) {
                           
                           elev = parseFloat(results[0].elevation.toFixed(1));
                            
//                           console.log("@@ elevation",elev, m.name  ) ;
                          }
                        }
                        else console.log("@@ elevation error");
                      });
                        
                     }

                      
                      

                    if ( globalSettings.distOnOff.on ) 
                    {
//                    text_lines = text_lines.concat([dist]);
                    var dist_info = this.path_total_dist.toFixed(1)+'+'+dist.toFixed(1) + '|' + elev;
                    m_text = m_text + '<rect x="0" y="'+(l*9)+'" width="'+dist_info.length*5.2+'" height="11" fill-opacity="0.80" rx="2" ry="2" fill="rgb(255,255,255)" stroke="none" />';
                    l++;
                    m_text = m_text + '<text x="0" y="'+(l*9)+'" font-family="Arial, sans-serif" fill="%23bb3311" stroke="none" \
                            paint-order="stroke" text-anchor="left" font-size="11"  >'+dist_info+'</text>';
                    }          
                    
                    
//                    console.log("@@ text=", text_lines);

                    //var p_pos="";
                    
                    
                    if (globalSettings.markerLableOnOff.on )
                    {
                        var url = m.url || 'data:image/svg+xml;utf-8, \
                        <svg width="132" height="52" viewBox1="0 0 15 32" xmlns="http://www.w3.org/2000/svg"> \
                        <circle fill="'+prop.fill+'" stroke="white" stroke-width="1"  cx="5" cy="5" r="5"/> \
                        <rect x="10" y="0" width="82" height="11" fill-opacity="0.40" rx="2" ry="2" fill="rgb(255,255,255)" stroke="none" />'
                        +m_text+
                        '</svg>';
                     }
                     else
                     {
                    var set_type = glob_gpx[set_id].set_type;
                    
                    var icon_p = [
                        [[6,"white", "black",2],[5,prop.fill,"white",1]],
                        [[7,"white", "black",2],[6,"Crimson","black",1]]
                        ];
                        
                        
                        var [r,fill,stroke,stroke_width ] = icon_p[set_type][( p_pos == 0 )?0:1];
                            
                        
//                        console.log('@@ orange', set_type,m); 
                        
                        var url = m.url || 'data:image/svg+xml;utf-8, \
                        <svg width="'+r*2+2*stroke_width+'" height="'+r*2+2*stroke_width+'" xmlns="http://www.w3.org/2000/svg"> \
                        <circle fill="'+fill+'" fill-opacity="0.7" \
                        stroke="'+stroke+'"  stroke-width="'+stroke_width+'"  \
                        cx="'+(r+stroke_width)+'" cy="'+(r+stroke_width)+'" r="'+r+'"/> \
                        </svg>';
                     }   
                    
                    var icon = {
                        anchor: new google.maps.Point(r+stroke_width, r+stroke_width),
                        size1: new google.maps.Size(60,30.26),
                        url: url
        }
    }
        
       var marker = new google.maps.Marker({
            name: m.name,
            title: markerTitle,
            dist:dist,
            position: pos,
            map: map,
            m: m,
            gpxSet: m.gpxSet,
            idx: m.idx,
            draggable: true,
            icon: icon,
          });
      
       
        google.maps.event.addListener(marker, 'click', function () { markerClick(this);});
        google.maps.event.addListener(marker, 'dblclick', function () { markerDel(this);});
        google.maps.event.addListener(marker, 'dragend', callDrag(marker,1));
        google.maps.event.addListener(marker, 'dragstart', callDrag(marker));
        google.maps.event.addListener(marker, 'drag', callDrag(marker));
        google.maps.event.addListener(marker, "rightclick", function(e) {
              
              

              for (prop in e) {
                if (e[prop] instanceof MouseEvent) {
                  
                  var mouseEvt = e[prop];
                  mouseEvt.preventDefault();

                  var left = mouseEvt.clientX;
                  var top = mouseEvt.clientY;
            
                  console.log("@@ rightClick",$(this)[0].m.set_id,$(this),context);

                  var rowId = $(this)[0].m.gpx_id;

                  context['activePointId'] = context['activePointId'] || rowId;
                  
                  var menuBox =$("<div marker_menu_id='"+rowId+"' id='markerMenu' \
                  style='width:120px; height:150px; position:absolute; background-color:#ffffee; font-size:10px'>\
                  <table width=100%><tr><td align=right><span class='ui-icon ui-icon-close' onclick='$(this).closest(\"div\").hide();'></span></td></tr></table>\
                  <div contenteditable>"+rowId+"</div>\
                  <br /></div>");
                  
                  
                  // ********** 2020-02-18 показать/скрыть точку на карте
                  
                  var markerHideShow = $("<input id='hs_"+rowId+"' checked type='checkbox' >\
                  <label for='hs_"+rowId+"'>Скрыть</label>");
                  
                  markerHideShow.on('change', function()
                      {
//                      console.log("hideShow.on('change'",rowId);  
                      $("input[gpx_id='"+rowId+"']").prop("checked", false); 
                      $("[marker_menu_id='"+rowId+"'").remove(); 
                      updateMarkersOnMap();
                      }
                  )        
                  
                  menuBox.append(markerHideShow)
                  // >>>>>> показать/скрыть точку на карте
                  // ********** 2020-02-19 удалить точку из набора
                  var markerRemove = $("<br /><span id='rm_"+rowId+"' class= 'ui-icon ui-icon-closethick'>Удалить</span><span>Удалить</span>");
                  
                  markerRemove.on('click', function()
                      {
                      console.log("@@ markerRemove", m);  

                      [setName,pointName,pos,set_id,gpx_id] = m.gpx_id.split('|');
                      
                      console.log("hideShow.on('remove'", [setName,pointName,pos,set_id,gpx_id] 
                                                        ,glob_gpx[set_id].points[pos] );  

                      glob_gpx[set_id].points.splice(pos,1);
                      
                      $("table[dataset='"+setName+"'] tr[gpx_id ='"+rowId+"']").remove();
                      
//                      gpxPointsToTable(glob_gpx[setName],setName);
//                      updatePointOrderInGlobalGpx(set_id, pos);
                      
                      updateMarkersOnMap();

                      $("[marker_menu_id='"+rowId+"'").remove(); 

                      }
                  )        
                  
                  menuBox.append(markerRemove)

                  // >>>>>> показать/скрыть точку на карте

                  $("#map").append(menuBox);
                  
                  p = $('#map').position();

                  console.log("@@ menuBox=", e, menuBox, mouseEvt, p );

                  menuBox.css({
                        left:(left - p.left +5),
                        top: (top - p.top +5),
                        display:"block"
                        });
            
                  var menuDisplayed = true;
                }
              }
            });
        
        markers.push(marker);
        
        if(0) drawPath(); //elevation() altitude
   
        
    //    map.panTo(pos);
        // geocoding 
    } // end method PlaceMarker
}

function updateMarkerIcon(m)
{

m.setMap(null);
console.log("@@ updateMarkerIcon", m);
url = m.url
/*'data:image/svg+xml;utf-8, \
      <svg width="52" height="32" viewBox1="0 0 15 32" xmlns="http://www.w3.org/2000/svg"> \
        <circle fill="%23ff55aa" stroke="white" stroke-width="1"  cx="14" cy="14" r="5"/> \
        <rect x="16" y="0" width="27" height="11" fill-opacity="0.40" rx="2" ry="2" fill="rgb(255,255,255)" stroke="none" /> \
        <text x="29" y="9" font-family="Arial, sans-serif" fill="%23113388" stroke="none" paint-order="stroke" text-anchor="middle" font-size="9"  >'+m.title+'</text>\
      </svg>';
*/

console.log("@@ url=",m.icon.url);

new_m     = m.m; 
new_m.url = url;
new_m.lat = m.position.lat();
new_m.lng = m.position.lng();

markersArray.push(new_m); // заменить на update Marker
markersArray.placeMarker(new_m,{'fill':"%23ff8811"});

}  



function svg_text_to_lines(t, width, height) {
  
    var words = t.split(/[\n ]+/).reverse();

    w = words ;
    
    words = words.filter( function(e) { return e !== '' });
    
    [lines,line] = [[],[]];
        
    while (word = words.pop()) {
      line.push(word);
      text = line.join(" ");
      if (text.length > width) { 
        line = []; 
        lines.push(text); 
        text="";
       }
    }
    
  if(text !== "" ) lines.push(text); 


//  console.log("@@ svg_text_to_lines \n", t, w, lines);


  return lines;
}

function svg_wrap1(t, width, height) {
  
  var tspan;
  
  text = $(t);
  
  text.attr("dy",height);
        var words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat( text.attr("dy") ),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");

    console.log("@@ elem", text, words,tspan );
    
    while (word = words.pop()) {

      line.push(word);
      tspan.text(line.join(" "));

      if (text.getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }

  return tspan;
}


let markersArray = new _markers([]);  




// end of ready

function showhideInfoWindow()
{
    
    for (m in markers)
     { m[1].close(); }
}
     
// Calculate distаnce by lattitude longitude js 
function savegpxtoOSMAnd()
 {
    var cnt = 0;

$("[type=checkbox]:checked").each(function(){
   
   wpset = $(this).attr('id');
   str = '';
   
   $('.wp_panel table[dataset="' + wpset + '"] tr:not(.header)').each(function (k,v) {

    t = $(v).children().map(function(ek,ev){ return $(ev).text()}); 
//       console.log ("@@@savegpx",k,t);

    str  +=  '<wpt lat="'+t[4]+'" lon="'+t[5]+'">\n\
<time>'+t[8]+'</time>\n'+
'<name>'+t[2]+
//'['+t[6].split('.')[0]+']'+
'</name>\n\
<sym>Scenic Area</sym>\n\
<extensions>\
<color>'+t[7]+'</color>\
</extensions>\n\
</wpt>\n\
';
   });

str = '<gpx version="1.1" creator="OsmAnd 3.3.7" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1/gpx.xsd">\
            <metadata><name>Markers_2019-06-11</name></metadata>' + str + '</gpx>';

$('#gpx_xml').text(str);

const MIME_TYPE = 'text/plain';

var cleanUp = function(a) {
  a.textContent = a.textContent+'+';
  a.dataset.disabled = true;

  // Need a small delay for the revokeObjectURL to work properly.
  setTimeout(function() {
    window.URL.revokeObjectURL(a.href);
  }, 1500);
};

//var downloadFile = function() {
  window.URL = window.webkitURL || window.URL;

  var prevLink = $('a');
  if (prevLink) {
    window.URL.revokeObjectURL(prevLink.href);
    $('output').html('');
  }

//  var bb = new Blob([typer.textContent], {type: MIME_TYPE});
  var bb = new Blob([str], {type: MIME_TYPE});

  var a = document.createElement('a');
//  a.download = container.querySelector('input[type="text"]').value;
  a.download = (cnt++)+ '.'+wpset+'.gpx';
  a.href = window.URL.createObjectURL(bb);
  setName = $("[for='"+wpset+"']").text();
  a.textContent = setName.substring(0,3);

  a.dataset.downloadurl = [MIME_TYPE, a.download, a.href].join(':');
  a.draggable = true; // Don't really need, but good practice.
  a.classList.add('dragout');
  
//  console.log("@@@ savegpx", setName.substring(3), a);

  $('[for="'+wpset+'"]').html(a); 
  $('[for="'+wpset+'"]').append (setName.substring(3));

  a.onclick = function(e) {
    if ('disabled' in this.dataset) {
      return false;
    }

    cleanUp(this);

  };
//}; // downloadFile = function()

}); // end forech wpsets

}

 
function getDistanceFromLatLonInKm(lat1,lon1, lat2=55.6442983, lon2=37.4959946) {
      var R = 6371; // Radius of the earth in km
      var dLat = deg2rad(lat2-lat1);  // deg2rad below
      var dLon = deg2rad(lon2-lon1); 
      var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c; // Distance in km
      return Math.round(d*100)/100;
    }
    
function deg2rad(deg) {
      return deg * (Math.PI/180)
    }
 
        
        
function callDrag(marker,drag_end=0) {
  return function() {

    lat  = marker.position.lat().toFixed(5); //.toFixed(4);
    lng  = marker.position.lng().toFixed(5)//.toFixed(4);
    dist = getDistanceFromLatLonInKm(lat,lng);

//    console.log("@@ callDrag", lat,lng, marker);
    
    markersArray.updateMarkerRow(marker);

// 2020-02-10 Операции по завершению перетягивания маркера
    
    if (drag_end)  
        { 
         // map.panTo(marker.position);
          console.log("@@ drag_end=", marker);
          gpxPointsToTable(glob_gpx[set_id],set_id,"checked");  
          updateLatLngInGlobalGpx(marker,lat,lng);
          updateGeoInTable(marker,lat,lng);
//          updateMarkersOnMap();         // все маркеры
//          updateMarkerIcon(marker);   // одиночный маркер
//          drawPath();
//          markersArray.addMarkers();  // все маркеры
//          updateTotalDist(marker);
          gpxexec(["updateMarkersOnMap"]);
        }
  };
}

var gpx_id_to_save = [];

function updateLatLngInGlobalGpx(m,lat,lng)
{           
    
    [setName,pointName,pos,set_id,gpx_id] = m.m.gpx_id.split('|');
    
    gpx_id_to_save.push({ gpx_id:gpx_id,lat:lat,lng:lng });

    console.log("@@ updateLatLngInGlobalGpx (): \n" , pos, lat,lng, m);

//    id = glob_gpx.findIndex(x => x.name === n[0]);

    glob_gpx[set_id].points[pos].lat = lat;
    glob_gpx[set_id].points[pos].lng = lng;

    console.log("@@ 09. updateLatLngInGlobalGpx= n", pos, lat,lng, glob_gpx, gpx_id_to_save);
}

// 2020.02.10 imporved version updateLatLngInGlobalGpx
//


function updateGpx(gpx_id, d=0 )
{           
   
    [setName,pointName,pos,set_id] = gpx_id.split('|');

//    id = glob_gpx.findIndex(x => x.name === n[0]);
/*
ID: "7"
Status: ""
name: "точка 7"
description: "метро Университет "
lat: "55.7423"
lng: "37.6155"
dist: "13.22"
color: "#ffdd88"
*/

    glob_gpx[set_id].points[pos].lat = lat;
    glob_gpx[set_id].points[pos].lng = lng;
    glob_gpx[set_id].points[pos].name = d.name || glob_gpx[setName].points[pos].name;
    glob_gpx[set_id].points[pos].description = d.description || glob_gpx[set_id].points[pos].description;

//    console.log("@@ 07.updateLatLngInGlobalGpx=", d, d.name, pos, lat,lng, glob_gpx);

}


// 2020-10-05 

function updateSetInfo(set_id, set_info)
{
    
    glob_gpx[set_id].set_name = set_info.name;
    
    console.log("@@ updateSetInfo", set_id, set_info, glob_gpx[set_id].set_name);
}

function updatePointOrderInGlobalGpx(set_id,pos)
{           
    
    
    gpx_set_trs = $("[set_id='"+set_id+"'] .points tr:not(:first-child)");

    console.log("@@_04 updatePointOrderInGlobalGpx m=", set_id, pos, gpx_set_trs);
        
    points = [];
    glbp = glob_gpx[set_id].points[pos];
        
    $.each(gpx_set_trs, function (k,v)
    {   
        tds = $($(v).children('td')[0]).text();
        inp_idx = $($(v).children('input')[0]).text();
        console.log("@@@ updatePointOrderInGlobalGpx \n k=%s \n tds=%s \n glbp[k]=%o \n\
         glbp[tds]=%o \n v=%o \n", k, tds, glbp[k], glbp[tds], v);
        points.push( glbp[tds] );
        
        $($(v).children('td')[0]).text(k);
        
        rowId = setName+"|"+glbp[tds].name+"|"+k;
        
        $($(v).find('input')[0]).attr({gpx_id:rowId});
        $(v).attr({gpx_id:rowId});
        
        console.log("@@ input=", $($(v).find('input')[0]));
    }); 

    glob_gpx[set_id].points = points;
    
//    gpxPointsToTable(glob_gpx[setName],setName);

console.log("@@ updatePointOrderInGlobalGpx= n", glob_gpx[setName].points, glbp, points);

//    id = glob_gpx.findIndex(x => x.name === n[0]);

}


function updateTotalDist(mname)
{
    [setName,pointName,pos,set_id] = mname.m.gpx_id.split('|');
    
    console.log("@@ updateTotalDist=", setName, pointName, pos,set_id, glob_gpx);
    
    var dist_total = 0;
    var o ={};
        
    $.each(glob_gpx[set_id].points, function(k,v){
        
        if (k == 0) [o.lat, o.lng] = [v.lat, v.lng];
        
        dist = getDistanceFromLatLonInKm( o.lat, o.lng, v.lat, v.lng);
        dist_total += dist ;
        
        [o.lat, o.lng] = [v.lat, v.lng];
        
    });

//    show(mname.idx);
//    dist = ((r>0) ? ""+dist_total.toFixed(2)+"<sup>+"+dist_next+"</sup>":"");

}


function selectCallback(infowindow)
{
//    console.log("@@",infowindow)
    $('.bselect').toggleClass('bselect');
    $(this).toggleClass('bselect');
    $(this).setZIndex(Number);

}
     
     
function markerClick(ob) {
    
    
    point_id = ob.idx  ;
    
    trCont = $("tr[id='"+point_id+"']");

//    console.log("@@markerClik", trCont, ob.m.gpx_id, ob);

    
    trCont.addClass(); 
    $('.rowselect').toggleClass('rowselect');
    trCont.toggleClass('rowselect');
//    $("body").scrollTo(tdgeos);
    
    gpxPoinsTableSlide(ob.m.gpx_id); 
    
    }

function gpxPoinsTableSlide(id)
{ 
    var frame = $("#left_panel"); // The ".test" parent element
    
    console.log("@@ TableSlide id=",id);
    
    frame.animate({
        scrollTop: $("[gpx_id='"+id+"']").offset().top + frame.scrollTop() -5
      }, 300);
}
 
function markerDel(ob){
    
    console.log("@@@ markerDel=",ob);
    
    tdgeos = $('.datasets td:contains('+ob.name+')').parent("tr");
    tdgeos.addClass(); 
    $('.rowdel').toggleClass('rowdel');
    tdgeos.toggleClass('rowdel');
//    $("body").scrollTo(tdgeos);
    $([document.documentElement, document.body]).animate({
        scrollTop: tdgeos.offset().top -100
    }, 500);   
    
    tdgeos.hide('slow', function(){ tdgeos.remove(); });    
    $(ob).hide('slow', function(){ ob.setMap(null); });    
    
    
    }




MERCATOR={
  
  fromLatLngToPoint:function(latLng){
     var siny =  Math.min(Math.max(Math.sin(latLng.lat * (Math.PI / 180)), 
                                   -.9999),
                          .9999);
     return {
       x: 128 + latLng.lng * (256/360),
       y: 128 + 0.5 * Math.log((1 + siny) / (1 - siny)) * -(256 / (2 * Math.PI))
     };
  },

  fromPointToLatLng: function(point){
  
     return {
      lat: (2 * Math.atan(Math.exp((point.y - 128) / -(256 / (2 * Math.PI)))) -
             Math.PI / 2)/ (Math.PI / 180),
      lng:  (point.x - 128) / (256 / 360)
     };
  
  },

  getTileAtLatLng:function(latLng,zoom){
    var t=Math.pow(2,zoom),
        s=256/t,
        p=this.fromLatLngToPoint(latLng);
        return {x:Math.floor(p.x/s),y:Math.floor(p.y/s),z:zoom};
  },
  
  getTileBounds:function(tile){
    tile=this.normalizeTile(tile);
    var t=Math.pow(2,tile.z),
        s=256/t,
        sw={x:tile.x*s,
            y:(tile.y*s)+s},
        ne={x:tile.x*s+s,
            y:(tile.y*s)};
        return{sw:this.fromPointToLatLng(sw),
               ne:this.fromPointToLatLng(ne)
              }
  },
  normalizeTile:function(tile){
    var t=Math.pow(2,tile.z);
    tile.x=((tile.x%t)+t)%t;
    tile.y=((tile.y%t)+t)%t;
    return tile;
  }

}

/** @constructor Mercator */
function CoordMapType(tileSize) {
  this.tileSize = tileSize;
}

     
function initMap() {

var mapOptions = {
    zoom: zoom,
//    mapTypeId: 'satellite',
    
    center: new google.maps.LatLng(homeGeo[0],homeGeo[1])
  };
  $('zoom').html(zoom);
  $('latlng').html(homeGeo[0]+" "+homeGeo[1]);

   map = new google.maps.Map(document.getElementById('map'), mapOptions );
   google.load("visualization", "1", {packages: ["chart"]});
        // Create an ElevationService.
   elevator = new google.maps.ElevationService();
    
   map.overlayMapTypes.insertAt( 0, new CoordMapType(new google.maps.Size(256, 256)));
      
   google.maps.event.addListener(map,'zoom_changed',function(){
         $('#zoom_info').html(this.getZoom());
         $('zoom').html(this.getZoom());
         
         ifMapChanged();

//         rect.setMap(null);

      });

   google.maps.event.addListener(map,'center_changed',function(){
         ifMapChanged();
         
         lat = this.getCenter().lat().toFixed(4);
         lng = this.getCenter().lng().toFixed(4);
         
         $('latlng').html(lng+" "+lat);
         // console.log("@@ lng ",lng,lat);
      });

  
   google.maps.event.addListener(map,'click',function(e){ // select div rectangle on map
        
       if (!isKeyControll) return; 
        
//       addMarker(map, {title:"Новая точка"}, e.latLng)
        
       console.log("@@ addListener", context); 

              
       set_id = context.activePointId.split("|")[3];
       
       console.log("@@ click addPoint",set_id, e.latLng.lat());
       
       i = {name:"Новая точка "+ glob_gpx[set_id].points.length,
                description:"Описание",
                lat:e.latLng.lat().toFixed(5) || "55.4",
                lng:e.latLng.lng().toFixed(5) || "37.45"}
       
       
                            
       addPoint(set_id,i);

        
//        int_latlng = {lat:e.latLng.lat(),lng:e.latLng.lng()};
//        var b=MERCATOR.getTileBounds(MERCATOR.getTileAtLatLng(int_latlng,this.getZoom()));
//        checkCacheMultyZoomBySQL(int_latlng, this.getZoom(),6)
//        cacheMap(b,this.getZoom(),2);
//       rect.setOptions({bounds:new google.maps.LatLngBounds(new google.maps.LatLng(b.sw.lat,b.sw.lng),new google.maps.LatLng(b.ne.lat,b.ne.lng)),
//                      map:map});

      });
  
   var controlDiv =$("#floating-panel");
   controlDiv.index = 1;
   
   map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv[0]);
   
//   console.log ("@@ map.controls=", map.controls[google.maps.ControlPosition.TOP_RIGHT]);
    
}





// ************* карта покрытия *********************
function cacheMap(b, z = 10,z_depth = 2){
    
  console.log("@@ cacheMap(): ",b,z,z_depth);
    
    var l_lat;
    var l_lng;
    
    
    
    for (layer_zoom = z; layer_zoom <= z+z_depth; layer_zoom++ )
    {
    
    cells = Math.pow(2,layer_zoom-z);
    
    lat_delt = (b.ne.lat - b.sw.lat ) / cells ;
    lng_delt = (b.ne.lng - b.sw.lng ) / cells ;
    

            
        for (l_lat = b.sw.lat+lat_delt/2; l_lat < b.ne.lat-lat_delt/4; l_lat+= lat_delt  )          
        {
//            for (l_lng = b.sw.lng+lng_delt/4; l_lng < b.ne.lng-lng_delt/4; l_lng+= lng_delt  )
        
        l_lng = b.sw.lng + lng_delt/3;
          
            while ( l_lng < b.ne.lng-lng_delt/4 )          
            {   
//                console.log("@@ b_depth", i, z, l_lat, l_lng,"\n coord=" ,coord, srcImage);
//                code = UrlExists(srcImage) ;
//                console.log('@@ UrlExists(srcImage) =', code);

//             checkByFiles ({lat:l_lat,lng:l_lng},layer_zoom)
             checkBySQL ({lat:l_lat,lng:l_lng},layer_zoom+1)
             
                             
            l_lng+= lng_delt;
        
            } // lng                    
        } // end lat                          
    } // end z
        
}


  


function checkByFiles (latlng,layer_zoom)
{
        coord = MERCATOR.getTileAtLatLng(latlng, layer_zoom);

        var srcImage  = 'http://msp.opendatahub.ru/gpx/img_cache/'+ layer_zoom + '/'+coord.x+'/'+coord.y+'.png';
         
       console.log("layer_zoom=",srcImage);
            
    
        $.ajax({
        url: srcImage,
        async : false, 
        type: 'HEAD',
        error: function(XMLHttpRequest, textStatus, errorThrown){
//                           console.log('@@ status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText +'\n' +srcImage);
        },
        success: function(data){
                    

//                    coord = MERCATOR.getTileAtLatLng(latlng, zoom_w_depth);
                    r_idx = layer_zoom + '_'+coord.x+'_'+coord.y; 

console.log("\nOK: ************\n@@ b_depth[",r_idx,"]\n",layer_zoom, latlng,"\n coord=" ,coord, srcImage);
                    
                    
                    cache_area[r_idx]=new google.maps.Rectangle({
                            strokeColor: '#888',
                            strokeWeight: 1,
                            strokeOpacity: (layer_zoom)/24,
//                            strokeColor: clr_r[layer_zoom%8],
//                            fillColor: clr_r[layer_zoom%8],
                            strokeColor: 'gray',
                            fillColor: 'red',
                            fillOpacity: 0
                            })
    
                    var b2=MERCATOR.getTileBounds(MERCATOR.getTileAtLatLng(latlng,layer_zoom));
    
                    cache_area[r_idx].setOptions({bounds:new google.maps.LatLngBounds(
                                new google.maps.LatLng(b2.sw.lat,b2.sw.lng),
                                new google.maps.LatLng(b2.ne.lat, b2.ne.lng)),
    //                              new google.maps.LatLng(b2.ne.lat,b2.ne.lng)),
                                map:map});
        
        
        }
    });                                

    
}


 
 
 function drawCacheArea(z,x,y)
 {

    r_idx = z+"_"+x+"_"+y;

//    console.log("@@@ drawCacheArea z,x,y=",z,x,y, cache_area[r_idx]);
    
    
    
    if (typeof cache_area[r_idx] == 'undefined')
    {
        
    hmk = ((z>8)?z-9:0)/7;
        
    cache_area[r_idx]=new google.maps.Rectangle({
//            fillColor: clr_r[z%8],
//            fillColor: clr_r[z%8],
//            fillColor: 'red',
//            strokeWeight: hmk*1.5 + 0.2,
            strokeWeight: 1,
//            strokeOpacity: Math.pow(2,z)/Math.pow(2,16),
            strokeOpacity: Math.pow(z,2)/Math.pow(16,2.5),
//            strokeColor: clr_r[z%8],
            strokeColor: heatMapColorforValue( hmk ),
            fillOpacity: 0
            })



    var b2=MERCATOR.getTileBounds({x:x,y:y,z:z});
    
    swlat = b2.sw.lat;
    swlng = b2.sw.lng;
    nelat = b2.ne.lat;
    nelng = b2.ne.lng;

//    frame = 400000/Math.pow(1.9,z);
    
//    frame = Math.pow(0.1,(17-z));
    frame = (z * Math.pow(2.4,z))/Math.pow(10,8);
    
    
    dlt = (b2.ne.lat - b2.sw.lat)*frame;
    dlg = (b2.ne.lng - b2.sw.lng)*frame;
    
//    console.log("@@ dlt",dlt)
    
    swlat = b2.sw.lat+dlt;
    swlng = b2.sw.lng+dlg;
    nelat = b2.ne.lat-dlt;
    nelng = b2.ne.lng-dlg;

    
    cache_area[r_idx].setOptions({bounds:new google.maps.LatLngBounds(
                new google.maps.LatLng(swlat,swlng),
                new google.maps.LatLng(nelat, nelng)),
//                              new google.maps.LatLng(b2.ne.lat,b2.ne.lng)),
                map:map});
     }    
} // end drawCacheArea

 
var markers = [];


function addMarker(map, item, location) {
  
//  console.log("@@@ Setting marker for " + item.name + " (location: " + location + ")");
  var marker = new google.maps.Marker({ map : map, position : location});
  marker.setTitle(item.title);
  var infowindow = new google.maps.InfoWindow( {
    content : item.body,
    size : new google.maps.Size(100, 300)
  });
  new google.maps.event.addListener(marker, "click", function() {
    infowindow.open(map, marker);
  });
}

function geocode(addr)
    { 
   var today = new Date();
                m = {'name':addr,
                    'color':"#8f8",
                    'time':today  
                    };
                    
    var geocoder = new google.maps.Geocoder();
    var geoOptions = {
      address: addr,
//      bounds: bounds,
      region: "NO"
    };
//    console.log("@@@ addr",geoOptions);
    res = geocoder.geocode(geoOptions, getGeo(addr));
    
//    console.log("@@@ geocode() res", geocoder, addr);
    
    return res;
}


function getGeo(addr) {  // используется при геокодировании
return function(results, status) {
  if (status == google.maps.GeocoderStatus.OK) {
    
    lat = results[0].geometry.location.lat().toFixed(5);
    lng = results[0].geometry.location.lng().toFixed(5);
    
//    tdgeos = $('.datasets td:contains('+addr+')').parent("tr").find("td:eq(4),td:eq(5),td:eq(6)")
   m = { 
         'name':addr,
         'lat':lat,
         'lng':lng,
         'color':"#ff0000"  
         };
    
    markersArray.placeMarker(m);
    
    loc = results[0].geometry.location
    
    map.panTo(loc); // центруем карту
    updateGeoInTable(addr,lat,lng); // обновляем таблицу
    
    return loc;
    
  } else {
    console.log("Geocode failed " + status);
  }
};
}

function updateGeoInTable(m,lat,lng)
{
//    tdgeos = $('.datasets td:contains('+addr+')').parent("tr").find("td").slice(4,7)
//    row = $("#")
    rselect = 'tr[gpx_id="'+m.m.gpx_id+'"]';
    
    tdgeos = $(rselect).find("td").slice(4,7)

    console.log("@@ tdgeos", m, rselect  ,tdgeos);

    tdgeos.addClass('modified_geo');
    
    $(tdgeos[0]).text(lat);
    $(tdgeos[1]).text(lng);
    $(tdgeos[2]).text(getDistanceFromLatLonInKm(lat,lng));
}

function fitMarkers()
{   
    var bounds = new google.maps.LatLngBounds();

    for (var i = 1; i < markers.length; i++) {
//    for (var i = 1; i < 5; i++) {
    lat = markers[i].getPosition().lat().toFixed(5);
    lng = markers[i].getPosition().lng().toFixed(5);
    
    if ( lat == 'NaN' || lng == 'NaN'  ) continue;
    
//    console.log("@@@ fitMarkers markers",markers[i].name,lat, lng);
    var myLatLng = new google.maps.LatLng(lat, lng);
    bounds.extend(myLatLng);
    }

    map.fitBounds(bounds);
    var zoom = map.getZoom();
    console.log("@@@ fit ", zoom, markers.length, bounds);
    map.setZoom(zoom+0)
    
}

function drawPath() {

    while(polylines.length) { polylines.pop().setMap(null); }
    if (polyline) { polyline.setMap(null); }  
    
    if ( !globalSettings.pathOnOff.on) return;

   var globalZIndex = 100;
   var path_points = {};
    
   var checked_points_by_set = {};
    
   $("[gpx_id] input:checked").map(function(i,e) {
    
//         console.log("@@ chkd",$(e),i);

         [setName,pointName,p_pos,set_id,gpx_id] = $(e).attr('gpx_id').split('|');
         
         pnt = glob_gpx[set_id].points[p_pos];
         
         var latLng = new google.maps.LatLng(pnt.lat,pnt.lng);
         
         if (path_points[set_id]) path_points[set_id].push (latLng);
         else path_points[set_id] = [latLng]; 
        
         
         });
    
//         console.log("@@@ lat, lng",path_points);
             
/*         if ( olatLng)
             {
                if (set_id == o_set_id)
                {
                 pathOptions.path = [latLng, olatLng];
                 polyline = new google.maps.Polyline(pathOptions);
                 
                 polyline.k= i;
                 
                 polyline.setOptions({ zIndex: globalZIndex++ });
                 
                 google.maps.event.addListener(polyline , 'click', function (e,o) { polylineClick( e, $(this) );});
                 polylines.push(polyline);
                }
                o_set_id = 
             }
             else 
             {
                
             }
    
         olatLng  = latLng;
    
         

    
    }
    
//         v = e.closest('tr');
                  
//         name = $(v).find("td:eq(2)").text();
//         lat = $(v).find("td:eq(4)").text(); // переделать на global_gpx
//         lng = $(v).find("td:eq(5)").text();
         

         
         
//         var latLng = new google.maps.LatLng(lat,lng);
    
         if ( olatLng )
             {
                 pathOptions.path = [latLng, olatLng];
                 polyline = new google.maps.Polyline(pathOptions);
                 
                 polyline.k= i;
                 
                 polyline.setOptions({ zIndex: globalZIndex++ });
                 
                 google.maps.event.addListener(polyline , 'click', function (e,o) { polylineClick( e, $(this) );});
                 polylines.push(polyline);
             }
    
         olatLng  = latLng;
    
    
         return latLng ;
      }).get();
*/
if ( !globalSettings.elevOnOff.on) return;   
   
    var pathOptions = {
    //          path: path_points,
    strokeWeight: 4,
    strokeColor: 'orange' ,
    strokeOpacity: 0.2,
    map: map
    }
    
    
    
    $.each(path_points, function(set_id,points) {
     
     if (glob_gpx[set_id].set_type == 1) return;
     
     console.log ("@@ eee",set_id);
        
     o_segment = 0;
     
     $.each(points, function(segment_id,segment) 
     {
         if (o_segment){
         pathOptions.path = [o_segment,segment];
         polyline = new google.maps.Polyline(pathOptions);
         polyline.segment_id = segment_id;
         polyline.set_id = set_id;
         polyline.setOptions({ zIndex: globalZIndex++ });
         google.maps.event.addListener(polyline , 'click', function (e) { polylineClick( e, set_id, segment_id );});
         polylines.push(polyline);
         }
         
         o_segment = segment;
     });   
        
//    console.log("@@ Math.floor", points)
//    samp = Math.floor(($(window).width()-500)/7);
    samp = 200;
   
    var pathRequest = {
        'path': points,
        'samples': samp
    }

   chart = new google.visualization.AreaChart(document.getElementById('elevation-chart'));
   elevator.getElevationAlongPath(pathRequest, plotElevation);
        
  });

}



function polylineClick(e, set_id, segment_id)
    {
    //        pathstart = e.getPath().getArray()[0];
    //        addMarker(map, {title:"Новая точка"}, pathstart)
    
       console.log ("@@ polylineClick ", set_id, segment_id);
    
       
       seg_idx = segment_id;
       
       i = {name:"Новая точка "+ glob_gpx[set_id].points.length,
                description:"Описание",
                lat: e.latLng.lat().toFixed(5) || "55.4",
                lng: e.latLng.lng().toFixed(5) || "37.45",
                set_id:set_id,
                seg_idx:seg_idx
                }
    
        set_id = context.activePointId.split("|")[3];
         
        addPoint(set_id, i);        
                                                
            
    }    


var el_markers = [];
var polylines = [];



function plotElevation(results, status) {

    var elev_max = -11000;
    var elev_min = 9000;
    
  if (status == google.maps.ElevationStatus.OK) {
    elevations = results;
    
    // Extract the elevation samples from the returned results
    // and store them in an array of LatLngs.
    var elevationPath = [];
    

    for (var i = 0; i < results.length; i++) {
        elev_max = Math.max(elevations[i].elevation,elev_max);
        elev_min = Math.min(elevations[i].elevation,elev_min);
      }


    for (var i = 0; i < results.length; i++) {
      elevationPath.push(elevations[i].location);
     
         if( i > 1 )
         {

         color = heatMapColorforValue(((elevations[i].elevation + elevations[i-1].elevation)/2 - elev_min)/(elev_max - elev_min));
         
//         console.log("@@ elevationPath.slice", i, elev_max, elev_min, color, elevations[i-2]);
         
         
         var pathOptions = {
          path: elevationPath.slice(i-1,i+1),
          strokeWeight: 4,
//          strokeColor: (i%2)?'#2255cc':'#ff4422' ,
          strokeColor: color ,
          strokeOpacity: 0.75,
          map: map
         } 
         polyline = new google.maps.Polyline(pathOptions);
         
         
/*         polyline.data = { marker_idx: Math.floor(i/(($(window).width()-500)/7)), 
                           i: i,
                           seg: (($(window).width()-500)/7)                                    
                         } ;  // 200-08-07 ищем предидущую точку с учетом разбиения на samp          
*/         
//         google.maps.event.addListener(polyline , 'click', function (e) { return true;});

         polylines.push(polyline);
            
        }
     }


    // Display a polyline of the elevation path.
    var pathOptions = {
      path: elevationPath,
      strokeWeight: 2,
      strokeColor: '#2255cc',
      strokeOpacity: 0.75,
      map: map
    }
    
    //polyline = new google.maps.Polyline(pathOptions);

    // Extract the data from which to populate the chart.
    // Because the samples are equidistant, the 'Sample'
    // column here does double duty as distance along the
    // X axis.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Sample');
    data.addColumn('number', 'Высота');
    for (var i = 0; i < results.length; i++) {
//      console.log ("@@@ chart result", results[i]);  
      data.addRow(['', elevations[i].elevation]);
    }

    // Draw the chart using the data within its DIV.
    document.getElementById('elevation-chart').style.display = 'block';

    options = {
              width: $("#elevation-chart-div").width()-30,
              height: $("#elevation-chart-div").height()-30,
              legend: 'Профиль',
              backgroundColor: 'rgba(255,255,255,.1)',
              hAxis: { 
                maxValue: 7,
                // title: "Профиль",
                gridlines: { count: 3, color: '#CCC' }, 
                },
              vAxis: { maxValue: 13 },
              titleY: 'Высота (m)',
              lineWidth: 2,
              pointSize: 1,
              pointShape: 'none',
              colors: ['#d3068d', '#e2431e', '#e7711b',
                       '#e49307', '#e49307', '#b9c246']
            };



    options2 = {
      width: $(window).width()-10,
      height: 150,
//      color: '#ccddff',
      legend: 'none',
      titleY1: '1Elevation (m)'
    };
    
    chart.draw(data, options);
    
// add bar listner    

    google.visualization.events.addListener(chart, 'onmouseover', function (e) {
        
//        var selection = chart.getSelection();
        pos = elevationPath[e.row];
        console.log("@@@ pos", pos, e, elevations[e.row]);
        
        while(el_markers.length) { el_markers.pop().setMap(null); 
//             base_dist.setMap(null);   
             }
        
        var elev = elevations[e.row].elevation.toFixed(0); 
        
        var image1 = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2238%22%20height%3D%2238%22%20viewBox%3D%220%200%2038%2038%22%3E%3Cpath%20fill%3D%22%23ff8080%22%20stroke%3D%22%23ccc%22%20stroke-width%3D%22.5%22%20d%3D%22M34.305%2016.234c0%208.83-15.148%2019.158-15.148%2019.158S3.507%2025.065%203.507%2016.1c0-8.505%206.894-14.304%2015.4-14.304%208.504%200%2015.398%205.933%2015.398%2014.438z%22%2F%3E%3Ctext%20transform%3D%22translate%2819%2018.5%29%22%20fill%3D%22%23fff%22%20style%3D%22font-family%3A%20Arial%2C%20sans-serif%3Bfont-weight%3Abold%3Btext-align%3Acenter%3B%22%20font-size%3D%2212%22%20text-anchor%3D%22middle%22%3E' + elev + '%3C%2Ftext%3E%3C%2Fsvg%3E';
        
        var image = '<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">\
        <path fill="#ffaa20" stroke="#ccc" stroke-width=".5" \
        d="M34.305 16.234c0 8.83-15.148 19.158-15.148 19.158S3.507 25.065 3.507 16.1c0-8.505 6.894-14.304 15.4-14.304 8.504 0 15.398 5.933 15.398 14.438z"/>\
        <text transform="translate(19 18.5)" fill="#fff" style="font-family: Arial, sans-serif;font-weight:bold;text-align:center;" font-size="12" text-anchor="middle">' + elev + '</text></svg>';
        
        image = 'data:image/svg+xml,' + encodeURIComponent(image);

//      console.log("@@ image1, image", image1, image);
        
        el_marker = new google.maps.Marker({ 
                map : map,
                title: ':'+elev,
                icon2: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 5.5,
                        fillColor: "#ddeeff",
                        strokeColor: "#4444dd",
                        fillOpacity: 0.95,
                        strokeWeight: 1.3,
                        },
                icon: image,
                position : pos
                });
        el_markers.push(el_marker);
        
//      map.panTo(pos);

        
        });

    
    google.visualization.events.addListener(chart, 'select', function (e) {
    
    var selection = chart.getSelection();


    if (selection.length) {
        var row = selection[0].row;

        pos = elevationPath[row];
        map.panTo(pos);
        
        var view = new google.visualization.DataView(data);
        chart.draw(view, options);
        }
    });
    
    google.visualization.events.addListener(chart, 'onmouseover1', function (e) {
        
//        var selection = chart.getSelection();
        
//        console.log ("@@@ selection ", selection);
        
//        var row = selection[0].row;
//        pos = elevationPath[row];

        setTooltipContent(data,e.row);
    }); 
  }
}

function setTooltipContent(data,row) {
    if (row != null) {
        var content = '<div class="custom-tooltip" ><h1>' + data.getValue(row, 0) + '</h1><div>' + data.getValue(row, 1) + '</div></div>'; //generate tooltip content
        var tooltip = document.getElementsByClassName("google-visualization-tooltip")[0];
        console.log("@@@ setTool", content, data);
        
//        pos = elevationPath[row];
        
        var marker = new google.maps.Marker({ map : map, position : pos});
        map.panTo(pos);

//        tooltip.innerHTML = content;
    }
}


function chartOver()
{ 
    var selection = chart.getSelection();
    if (selection.length) {
        var row = selection[0].row;
//        document.querySelector('#myValueHolder').innerHTML = data.getValue(row, 1);
        
        pos = elevationPath[row];
        
        var marker = new google.maps.Marker({ map : map, position : pos});
        map.panTo(pos);
        
        var view = new google.visualization.DataView(data);
        view.setColumns([0, 1, {
            type: 'string',
            role: 'style',
            calc: function (dt, i) {
                return (i == row) ? 'color: red' : null;
            }
        }]);

        chart.draw(view, options);
    }
}


function resizeChart () {
    console.log("@@@ resize", $('elevation-chart').length);
    if ($('elevation-chart-div').length)
    drawPath();
}

if (document.addEventListener) {
    console.log("@@ resize");
    window.addEventListener('resize', resizeChart);
}
else if (document.attachEvent) {
    window.attachEvent('onresize', resizeChart);
}
else {
    window.resize = resizeChart;
}


// хелперы

function isInt(n){
    return Number(n) === n && n % 1 === 0;
}

function isFloat(n){
    return Number(n) === n && n % 1 !== 0;
}


// reorder tr

var fixHelperModified = function(e, tr) {
    var $originals = tr.children();
    console.log("@@@ fixHelperModified", $originals);
    var $helper = tr.clone();
    $helper.children().each(function(index) {
        $(this).width($originals.eq(index).width())
    });
    return $helper;
},
 updateIndex = function(e, ui) {

        splt = [setName,pointName,pos,set_id,gpx_id] = $(ui.item[0]).attr('gpx_id').split('|');
        console.log("@@@ updateIndex",splt,e, ui);
        updatePointOrderInGlobalGpx(set_id,pos); 
        drawPath();
        
        $('td.index', ui.item.parent()).each(function (i) {
            $(this).html(i + 1);
        });
    },
 updatePath = function(e, ui) {
    };



CoordMapType.prototype.getTile = function(coord, zoom, ownerDocument) {

    var tile=MERCATOR.normalizeTile({x:coord.x,y:coord.y,z:zoom}),
    tileBounds=MERCATOR.getTileBounds(tile);
    
    var div = ownerDocument.createElement('div');
    
      switch ( dinfo )
      {
        case '1' : tile_html = "<div style='background-color:rgba(255,255,255,0.75); width:100px;'>"+zoom+','+tile.x+','+tile.y+"</div>";
                break;    
        case '2' : tile_html = "<div style='background-color:rgba(255,255,255,0.75); font-size:15px; color:blue; width:100px;'>"
                                +zoom+','
                                +tile.x+','
                                +tile.y+'<br />'
                                + tileBounds.ne.lat.toFixed(5)+','
                                + tileBounds.ne.lng.toFixed(5)+','
                                +"</div>";
                break;
        default:        
                tile_html = "-";
      }
       
      div.innerHTML = tile_html;
      div.style.width = this.tileSize.width + 'px';
      div.style.height = this.tileSize.height + 'px';
      div.className = 'heatmapdiv';
      div.style.fontSize = '10';
      div.style.borderStyle = 'solid';
      div.style.borderWidth = dinfo+'px';
      div.style.borderColor = '#AAAAAA';
      div.style.opacity =hmOpacity;

  
  if (zoom<17)
  {
    
    // AnyGis  
    //   srcImage  = 'https://anygis.ru/api/v1/Tracks_Strava_All/'+tile.x+'/'+tile.y+'/'+zoom;
    
    // ODH cache
    //   srcImage  = 'http://gpxlab.ru/img_cache/'+zoom+'/'+tile.x+'/'+tile.y+'.png';
    
    // ODH strava
      const srcImage  = srcImageStrava  = 'http://gpxlab.ru/strava.php?z='+zoom+
            '&x='+tile.x+
            '&y='+tile.y+
            '&heat_activities_type='+heat_map.heat_activities_type+
            '&heat_color='+heat_map.heat_color+
            '&month='+heat_map.heat_color
            ;

      var d = new Date();
      d.setMonth(d.getMonth() - 1);

      console.log(d, d.toISOString().substring(0, 10));


      const srcImage_last   = 'http://gpxlab.ru/strava.php?z='+zoom+
          '&x='+tile.x+
          '&y='+tile.y+
          '&heat_activities_type='+heat_map.heat_activities_type+
          '&heat_color='+heat_map.heat_color+
          '&month='+d.toISOString().substring(0, 10)
      ;




      div.style.backgroundImage = "url('"+srcImage+"')";


    //var filename = document.location.href.replace(/^.*[\\\/]/, '')
    //console.log("@@ document.location.href", tileBounds );
      $.get(srcImageStrava)
            .done(function() { 
    //              srcImage  = 'http://msp.opendatahub.ru/gpx/strava.php?z='+zoom+'&x='+tile.x+'&y='+tile.y;
    //              srcImage  = 'http://msp.opendatahub.ru/gpx/img_cache/'+zoom+'/'+tile.x+'/'+tile.y+'.png';
    //              div.style.backgroundImage = "url('"+srcImage+"')";
    //              div.innerHTML =srcImage;
    
          }).fail(function() { 
    //              srcImage  = 'http://msp.opendatahub.ru/gpx/strava.php?z='+zoom+'&x='+tile.x+'&y='+tile.y;
    //              div.style.backgroundImage = "url('"+srcImage+"')";
            });
        
    
    
  }
  else
  {
    
  }
  


  return div;
};





$( function() {
$( "#slider_transperency" ).slider(
    {
      orientation: "horizontal",
      range: "min",
      max: 100,
      value: hmOpacity*100,
      slide: refreshTrans,
      change: refreshTrans
    });
 $('span.ui-slider-handle').css({'display': 'inline-block'})
                                   .html("<div>"+hmOpacity*100+"</div>"); 
                                   
});

function refreshTrans ()
{
        tval = $( "#slider_transperency" ).slider( "value" );
        if ($('#toggleHM').val() == "Show HM" ) toggle();
        
        hmOpacity = tval/100;
        $('div.heatmapdiv').css({ opacity: hmOpacity });
//            $("#slider_transperency" ).find(".ui-slider-handle").text(tval);
        $('span.ui-slider-handle').css({'display': 'inline-block'})
                                   .html("<div>"+tval+"</div>");
//           console.log("@@ tval",tval );    

   ifMapChanged();                                 

}

toggle = function(s=1) {
    $("div.heatmapdiv").toggle();
    $('#toggleHM').val( $('#toggleHM').val() == "Show HM" ? "Hide HM" : "Show HM");  
//    console.log("@@ toggle v=", $('#toggleHM').val() );
};

function ifMapChanged() 
{       
//    return; 
//        console.log("@@ map",map);
         c = map.getCenter();   
         location_search = c.lat().toFixed(5)+','
                    + c.lng().toFixed(5)
                    +','+ map.getZoom()
                    +','+ hmOpacity
                    +','+ dinfo;   
            
         href = window.location.origin+"/#"+location_search;
//         console.log("@@ href ", href );
         window.location.href = href;
//         $.cookie('msp-settings', '#'+location_search);
         $.cookie('location-settings', location_search);
         
//         console.log("@@ location_search", location_search);

// Read the cookie

} //*** ifMapChanged()



// 2020-01-17 get stat by group 
//console.log("@@ init gps.js");

function getCacheStat(i)
    {
        console.log("@@ getCacheStat",i);
        
    $.ajax
        ({
            type: "POST",
            dataType : 'json',
            async: false,
            url: 'act.php',
            data: { get_cache_stat: i, depth: 10},
            success: function (d) {
                updateIntCols(d);
            },
            failure: function() {alert("Error!");}
        });

    }

function updateIntCols(d)
{

console.log ('updateIntCols', d);
    
    colors = $(Object.keys( d['colors'] )).map(function (k,v) {return v.substring(1);} );
    console.log("colors",colors);
    max_r = d['max_cnt'];

    console.log("@@ maxRow", max_r);

    
    $('.by_int').map (function(k,v)
    {   
    var svg = "<svg height='2' width='400'></svg><br />";
    
//    var maxRow = d['groups'].map(function(row){ 
//        return Math.max.apply(Math, Object.values(row).map(function(c){return c['cnt'];})); });
        
//    max_cnt = Math.max.apply(Math, maxRow);
    
//        delete d['ranges']['0rgb(200, 200, 200)'];

        
        $.each(d['ranges'],function (kk,vv) {
            
                h = w = 35;
                
                if (typeof d['groups'][k] != 'undefined' && typeof d['groups'][k][kk] != 'undefined' )
                 {
                    c = d['groups'][k][kk]['cnt'];
                    s = d['groups'][k][kk]['s'];
                    
                    svg_r = h/2.1 * Math.pow (c/max_r,1/2) +1 //2;
                    
                    svg = svg+ `<svg height="${h}" width="${w}">\
                                    <title>${c}\n${s}\n${kk}</title>\
                                    <circle cy="${h/2}" cx="${w/2}" r="${svg_r}" \
                                    stroke-width="0" fill="${colors[kk.substring(0,1)-1]}" /> \
                                 </svg>`;
//                    svg = svg+"["+d['groups'][k][kk]['cnt']+"]";
                 }   
                else  
                {   
                    svg = svg+`<svg height='${h}' width='${w}'>\
                                    <circle cx='${h/2}' cy='${w/2}' r='2' \
                                    stroke='black' stroke-width='0' fill='lightgray' />\
                                </svg>`;
                }                    
        });
        
        $(v).html(svg);
    });
    
}    

function UrlExists(url)
{
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status!=404;
}
    
// Секция для обработки кнопок тулбара

function cacheOnOff()
{   
    var bounds = map.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();
    
    N = map.getBounds().getNorthEast().lat();   
    E = map.getBounds().getNorthEast().lng();
    S = map.getBounds().getSouthWest().lat();   
    W = map.getBounds().getSouthWest().lng();  
    
    N1 = new google.maps.LatLng(N,(W+E)/2);
    N2 = new google.maps.LatLng(S,(W+E)/2);
    
    console.log("@@ map.getBounds()",ne , sw, N1, N2,"\n");
    
    if (globalSettings.cacheOnOff.on)
        {
        checkCacheMultyZoomBySQL( N1 , map.getZoom()-2,6);
        checkCacheMultyZoomBySQL( N2 , map.getZoom()-2,6);
        } 
    else clear_cache();
}


function checkCacheMultyZoomBySQL (latlng, zoom, z_depth)
{
//        coord = MERCATOR.getTileAtLatLng(latlng, zoom);
       
        var request_data = 

        { get_cache_list: 1, 
            z_depth: z_depth,
            z: zoom,
//            x: coord.x,
//            y: coord.y,
            lat: latlng.lat(),
            lng: latlng.lng()
           };

console.log ("@@ request_data",latlng,request_data );
        
        $.ajax
            ({
                type: "POST",
                dataType : 'json',
                async: false,
                url: 'act.php',
                data: request_data,
                success: function (d) {
//                    console.log("@@ data = ", d);
                    
                    $.each(d.tiles, function(k,v){
                    $.each(v, function(kk,vv){
                    $.each(vv, function(kkk,vvv){
//                        console.log("@@  k,kk,kkk =",k,kk,vvv);
                        drawCacheArea(k,kk,vvv);
                    });
                    });
                    });
                    
                },
                failure: function() {alert("Error!");}
            });

 } // end checkBySQL



function clear_cache()
{
    
    break_cnt = 0; 
    
    $.each(cache_area, function (k,v) {
        v.setMap(null);
        delete cache_area[k];
    });
}

// >>>> Секция для обработки кнопок тулбара    
// ****************  helpers *******************

function heatMapColorforValue(value){

/*  
0    : blue   (hsl(240, 100%, 50%))
0.25 : cyan   (hsl(180, 100%, 50%))
0.5  : green  (hsl(120, 100%, 50%))
0.75 : yellow (hsl(60, 100%, 50%))
1    : red    (hsl(0, 100%, 50%))
*/  
  
  var h = (1 - value) * 280 + 5
  return "hsl(" + h + ", 100%, 40%)";
}


function show_cache_legend()
{   
    dv = "";
    for (i=0;i<=16;i++)
    {
        dv = dv+"<div style='background-color:"+heatMapColorforValue(i/16)+"'>"+i+"</div>";
    }

    $('legend').append("<div class=legend>"+dv+"</div>");
};

function gpxexec(proc)
{
    $(proc).each(function(k,v){
//        console.log ("@@ gpxexec", k,v );
        eval("(async () => {" + v + "()})()")
//        eval(v+"()");
    }) ;  
}

    
// google_sheets 2020-10-15

var glob_gpx = {};
var glob_gpx_set = {cols:["set_id",
                          "set_name",
                          "set_description",
                          "set_type",
                          "set_prop",
                          "user_id",
                          "ord"],
                    el: []
                    };
var glob_gpx_points = {};
var glob_gpx_to_save = {};
var gpx_line = [];
var setCounter;
var deferreds = [];



function makeApiCall(action = "get_gpx_DB", apiCallData="*") {
  
console.log("@@@ action[",action,"]" ,apiCallData, $(this));
  
  switch (action)
      {
      case 'newGpxSet':

            var new_name = $("#newgpx").val();
            var set_type = $("#newGpxType").find('option:selected').attr('id');

            if (new_name.length < 3) 
                alert('Название должно быть более 3-ех символов');
            
            else
                {
                cntr = map.getBounds();
                lt = [];
                rb = [];
                
                d = 0.3;
                
                lt = [(1-d) * cntr.Ya.i + d * cntr.Ya.j , (1-d) * cntr.Sa.i + d * cntr.Sa.j ];
                rb = [(1-d) * cntr.Ya.j + d * cntr.Ya.i , (1-d) * cntr.Sa.j + d * cntr.Sa.i ];
                
                console.log("@@ newGpxSet", new_name, set_type , cntr, lt, rb );
                
                $.get('act.php',{ new_gpx_set: { name: new_name, set_type: set_type , start: lt, end: rb} },
                    function (response) {
                        console.log("@@ new_gpx_set", response);
                        makeApiCall();
                        }
                    );
                } 
      
            break;

      case "save_db":
            $.get('act.php',{ save_db: gpx_id_to_save },
                function (response) { 
                    glob_gpx = response.data; }
                );
                
            break;
      
      case "save_sql":
            json_gpx = JSON.stringify(glob_gpx);

            console.log("@@ save_gpx_to_db", glob_gpx);
            
            $.ajax
                ({
                    type: "POST",
                    dataType : 'json',
                    async: false,
                    url: 'act.php',
                    data: { save_sql: json_gpx },
                    success: function () {alert("Thanks!"); },
                    failure: function() {alert("Error!");}
                });
            
            break; 

      case "get_gpx_DB":
            tm('get_gpx_DB >>> Start 2');
            console.log('sss');
            $.get('act.php',  { get_gpx_set_DB: '1,18' }, function (response) {
                // console.log('@@ get_gpx_DB glob_gpx ************', glob_gpx, response);

                glob_gpx = response.data;
                
                console.log('@@ get_gpx_DB glob_gpx ', glob_gpx, response);
                
                $('#datasets').html(response['html']);  //tm('02. get_gpx_DB >>>');
                $('#datasets table[points] tr td[ed]').attr("contenteditable",true); //tm('03. get_gpx_DB >>>');
                
/*                glob_gpx.map( function(o) { 
                    Math.sum.apply(Math, o.points.map(function(o) { return o; });
                    );
*/

                max_set = Math.max.apply(Math, Object.keys(glob_gpx).map(function(o) { return o; }))
                gpxPointsToTable(glob_gpx[max_set],max_set,"checked"); // показываем последний набор точек
                updateMarkersOnMap();


// обработка событий 

                $('input#all').on('change', function(e){
                    isСheck = $(this).prop('checked');
                    set_id = $(this).attr('set_id');
                    $('#datasets table[points='+set_id+'] input').prop('checked', isСheck);
                    
                    console.log('input#all', set_id );
                    
                    updateMarkersOnMap();

                });

                
                $('span[set_show_hide]').on('click', function(e){
                        el = $(this);
                        set_id  = el.closest('div').attr('set_id');
                        
//                        console.log("@@ set_show_hide",set_id, glob_gpx[set_id].points);
                        gpxPointsToTable(glob_gpx[set_id],set_id, "checked");
                        
                        
                        if(el.hasClass("ui-icon-triangle-1-s"))
                        {
                            el.attr('class','ui-icon ui-icon-triangle-1-n');
                            $('#gpx_set_table_'+set_id).removeClass('hide');
                        }
                        else
                        {
                            el.attr('class','ui-icon ui-icon-triangle-1-s');
                            $('#gpx_set_table_'+set_id).addClass('hide');

                        }
                     }); // end on clik
                });
            
            break;


      case "get_sheets_names":
            sheet_metadata = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
            sheets = sheet_metadata.get('sheets', '')
            title = sheets[0].get("properties", {}).get("title", "Sheet1")
            sheet_id = sheets[0].get("properties", {}).get("sheetId", 0)
            break; 

      case "save_json":
            json_gpx = JSON.stringify(glob_gpx);
            json_gpx2 = JSON.stringify( [{ uno: 1, Ленинград: 2 }] );
//            console.log("@@ save_gpx_to_json", json_gpx);
            console.log("@@ save_gpx_to_json", glob_gpx);
            
            $.ajax
                ({
                    type: "POST",
                    dataType : 'json',
                    async: false,
                    url: 'act.php',
                    data: { save_json: json_gpx },
                    success: function () {alert("Thanks!"); },
                    failure: function() {alert("Error!");}
                });
            
            break; 
      
            
      case "read_json":          
            gpxFromJson();
            break; 
      
      case "read_google":  
            gpxFromGoogle();
            break; 

      case "save_google":  
              var vals = new Array();
              
              ds = apiCallData;
               
              trs = $('[dataset="'+ds+'"] tr')

              console.log("@@@ save_google", action, ds, trs); 

              row = 0;
               
               $(trs).each(function(k,tr) {
                       t = $(tr).children("td").map(function(ek,ev){ return $(ev).text()}).get(); 
                       vals[row++] = t;
                   });
                
              var params = {
                spreadsheetId: '1zNy8SZ-ZPnAYXsGGmxvDYe0hHnyS6spuYuQCcAxg6dA',  // TODO: Update placeholder value.
                range: ds+'!A1:J'+vals.length,  // TODO: Update placeholder value.
                valueInputOption: 'RAW',  // TODO: Update placeholder value.
              };
        
              var valueRangeBody = {"values": vals };
        
              var request = gapi.client.sheets.spreadsheets.values.update(params, valueRangeBody);
              request.then(function(response) {
                // TODO: Change code below to process the `response` object:
                console.log(response.result);
              }, function(reason) {
                console.error('error: ' + reason.result.error.message);
              });        
               
            break;
      
      default:
            console.log("@@ make call API", action, apiCallData);  
//            gpxFromJson();     
//            gpxFromGoogle();
      }
  } // make call API    


function gpxFromJson()  
{           
//        return; 
        glob_gpx = [];
        //tm('start read JSON');
        $.get({ url: 'data/gpx.json', cache: false },function(data) {
               console.log("@@ read_json ",data);
               glob_gpx = data;
//               gpxSetNamesToTable(data);
               console.log("@@ gpxFromJson", data );
               $.each(data,function(k,v) { 
                console.log("@@ gpxFromJson", k,v );
                $('#datasets').append(k+"</br>"); 
                
                } ); 
               
            });
        tm('end read JSON');
}


function gpxSetNamesToTable(gpx_names)
{   
    $(".datasetcheckbox").html("");

    console.log("@@ names ", gpx_names);
    
    $(".datasets").html("");
    
    $.each(gpx_names, function (k,v)
     {
       if(typeof v.points !== 'undefined')
       {
       $(".datasetcheckbox").append("<div class='checkbox_field' >\
        <div check="+v.name+"><input type=checkbox id='"+v.name+"' gpx_set_name='"+v.name+"' onchange='gpxSetCheckSelector(this.id)'>" +
        "<label for='"+v.name+"'><gpx_total>("+v.points.length+") </gpx_total>"+v.name+"</label></div></div>");
        gpxPointsToTable(v,k);
       }
       else 
       {
       $(".datasetcheckbox").append("<div class='checkbox_field' >\
        <div check="+v.name+"><input type=checkbox id='"+v.name+
            "' onchange='gpxSetCheckSelector(this.id)'>" +
        "<label for='"+v.name+"'><gpx_total>()</gpx_total>"+v.name+"</label></div></div>");
       }
    
     });
}

function isLat(lat) {  return isFinite(lat) && Math.abs(lat) <= 90; }
function isLon(lng) {  return isFinite(lng) && Math.abs(lng) <= 180; }

function gpxSetCheckSelector(id)
{   
    
    console.log('@@ pxSetCheckSelector',id,$("#"+id)[0].checked, $("#"+id));
    gpxPoinsTableSlide(id);
    gpxPoinsSelectTableByID(id, $("#"+id)[0].checked); 
}

function gpxPoinsSelectTableByID(id, isСheck)
{
    $('#gpx_set_table_'+id+' .points input').each(function(k,v){
        
//        console.log("@@ v k",v,k, $(v).closest('tr').attr('id'));
        
        $(v).css({'background-color':'red'})        
            .prop('checked', isСheck);
    });

    updateMarkersOnMap();
    console.log('@@ gpxPoinsSelectTableByID',id);
}


function gpsUpdateSetType(sel)
{   
    setId = $(sel).attr('set_id');
    glob_gpx[setId].meta.type = $(sel).val();
    console.log("@@ gpsUpdateSetType", glob_gpx);
//    updateMarkersOnMap();
}


function toggleSet(el)
{
    setId = $(el).attr('set_id');
    $("#datasets [set_id!='"+setId+"']").prop( "checked", false );
    $("[set_id] input[gpx_id]").prop( "checked", false );
    $("[set_id='"+setId+"'] input[gpx_id]").prop('checked', $(el).prop('checked'));
}


function gpxPointsToTable(v,id, checked="")
 {
//    console.log("@@ gpxPointsToTable",points);
    
/*
0: {ID: "ID"}
1: {Status: "Status"}
2: {name: "name"}
3: {description: "description"}
4: {lat: "lat"}
5: {lng: "lng"}
6: {dist: "dist"}
7: {color: "color"}
8: {time: "time"}
9: {Название станции: "Название станции"}
*/  

    points = v.points; 
    setName = v.set_name;
    o_lat = 0;
    
    options = [0,1].map(function(x) { return "<option "+ ((v.set_type == x )? "selected":"")+">"+x+"</option>"; } ).join("")
    
    console.log("@@ type options", v, id);
    
    setInfo = "<table id='prop_table_"+v.set_id+"' class=tab>"+
              "<tr>" +
                  "<td></td>" +        
                  "<td></td>"+        
                  "<td></td>"+        
                  "<td></td>"+        
                  "<td></td>"+        
                  "</tr>";          
              "</table>";
        
    header = "<tr class='header'><td> </td>" +
                  "<td><input set_type = '"+v.set_type+"' set_id ='"+id+"' onchange='toggleSet(this)' type='checkbox'/></td>" +        
                  "<td>Наименование</td>"+        
                  "<td geo>Описание</td>"+        
                  "<td>Широта1</td>"+        
                  "<td>Долгота</td>"+   
                  "<td>До базы</td>"+
                  "<td class='hide'>Цвет</td>"+ // color
                  "<td>Расстояния</td>"+
                  "</tr>";

    hide = (v.set_id == 2)?"":"hide";
    
    $("[set_id="+v.set_id+"] [set_points]").html("");
    
    $("[set_id="+v.set_id+"] [set_points]").append("<div class='wp_panel' "+hide+" id='gpx_set_table_"+v.set_id+"'>"
                    + setInfo +"<table class='tab points' dataset='"+setName+"'></table><div>");

    var row_cnt;
    var row = '';
    var dist_total = 0;
  
    $.each(points, function( k,v)
        {   
//            if(k == 0) { continue;}
//            console.log("@@ eachGPX ", v );
            dist_next = 0;
            tdist_html = 0;
//          remask = '^-?[0-9]{1,3}(?:\.[0-9]{1,10})?$';
            
         if ( o_lat && ( isLat( v.lat ) && isLon( v.lng) ) )
            {
//                console.log("@@ cells", v.lat, (typeof o_lat) );
                dist_next = getDistanceFromLatLonInKm(v.lat, v.lng, o_lat, o_lng);
                dist_total += isNaN(dist_next)? 0: dist_next; // добавляем если число  
//                tdist_html = dist_total.toFixed(2)+"<sup>+"+dist_next+"</sup>"; 
                tdist_html = dist_total.toFixed(2); 
            } 
            
            o_lat = v.lat;  
            o_lng = v.lng;  
           
//continue;
            row_cnt = k;
            rowId = setName+"|"+v.name+"|"+k+"|"+v.set_id+"|"+v.gpx_id;
//            console.log("@@ context",context);
            context['activePointId'] = context['activePointId'] || rowId;
            
            row += "<tr gpx_id='"+rowId+"'><td>"+k+"</td>" +
                  "<td><input gpx_id='"+rowId+"' type='checkbox' "+checked+" onchange='updateMarkersOnMap();' /></td>" +        
                  "<td contenteditable>"+v.name+"</td>"+        
                  "<td geo contenteditable>"+v.description+"</td>"+        
                  "<td>"+v.lat+"</td>"+        
                  "<td>"+v.lng+"</td>"+
                  "<td>"+v.dist+"</td>"+
                  "<td class='hide'>"+v.color+"</td>"+ // color
                  "<td>"+  dist_next  +"</td>"+
                  "<td>"+  tdist_html  +"</td>"+
                  "</tr>";
        });
        
        
        $("label[for='"+setName+"'] gpx_total").text("("+ points.length +") ");
        $("[dataset ='"+setName+"']").html("");
        $("[dataset ='"+setName+"']").append(header);
        $("[dataset ='"+setName+"']").append(row);
        $("[set_id ='"+v.set_id+"'] [path_length]").text(tdist_html+" км");


//        $("[contenteditable]").on("input", function() {
//          console.log("@@ *** td path_length ",$("[dataset ='"+setName+"'] td[path_length]"));
//            }, false);
        
        $('select[set_type]').on('change', function(){
            
            set_id = $(this).closest('div').attr("set_id");
            set_type = $(this).find('option:selected').attr('id');
            set_class = $(this).find('option:selected').attr('class');
            console.log('@@ select[set_type]',set_type, set_id, set_class );
            glob_gpx[set_id].set_type = set_type; 
            
            $(this).attr('class','');
            
            $(this).addClass(set_class);
            
        });
        
        $('body').on('focus', '[contenteditable]', function() {
            const $this = $(this);
            $this.data('before', $this.html());
//        }).on('blur keyup paste input', '[contenteditable]', function() {
        }).on('keypress1 blur', '[contenteditable]', function(e) {
  
              if(e.which == 13 || 1) { // 2020-10-15 теперь работает blur
//                        console.log('*********** You pressed enter! ************');
                    const $this = $(this);
                    if ($this.data('before') !== $this.html()) {
                        $this.data('before', $this.html());
                        $this.trigger('change');
        
                    gpx_fields = {2:'name',3:'description'};
                    gpx_field_name = gpx_fields[$(this).index()];
                     
                    if (typeof $(this).attr('set_id') !== typeof undefined && $(this).attr('set_id') !== false) {
                        
                        set_info = {name: $(this).text(), type: 1 }
                        updateSetInfo($(this).attr('set_id'), set_info); 
                        
                        }
                    else 
                        {     
                         
                        gpx_id = $(this).closest('tr').attr("gpx_id");
                        param = {};
                        param[gpx_field_name] = $(this).text();
                        context['activePointId'] = gpx_id;        
                        updateGpx(gpx_id, param);
                        updateMarkersOnMap("");
                        }    
                    } 
               return false; // supress enter                    
               }
               else 
               {
//                 console.log('*********** Pressed: ', e.which);
               }
  

        });
        
        
        $("[dataset ='"+setName+"'] input").on('change', function(el){
            updateMarkersOnMap();
//            console.log("@@ [dataset ='"+setName+"'] input", el);
        });
        
        $("[dataset ='"+setName+"'] tr[gpx_id]").on('click', function(el,v){
            updateMarkersOnMap("");
            
            lat = $($(this).children('td')[4]).text();
            lng = $($(this).children('td')[5]).text();
            
            var latLng = new google.maps.LatLng(lat,lng);
            
            map.panTo(latLng);
            
//            console.log("@@ map.panTo tr.on('click')=", el,lat);
        });

        tm("tm() addToTable "+setName);
        
        $(".tab.points tbody").sortable({
                helper: fixHelperModified,
                stop: updateIndex,
                items: 'tr:not(.header)',  
                cancel: '[contenteditable]',
        })//.disableSelection();
    }



function addPoint(set_id,i={name:"Новая точка",  // 2020-02-18 Добавляем новую точку
                description:"Описание",
                lat:"55.4",
                lng:"37.45"}) {
                    
            set_id = i.set_id;        

            gpx_cnt = $("[dataset ="+set_id+"] tr[gpx_id]").length;
/*              
            rowId = setName+"|Новая|"+set_id+"|"+gpx_cnt;

            row = "<tr gpx_id='"+rowId+"'><td>"+gpx_cnt+"</td>" +
                  "<td><input checked gpx_id='"+rowId+"' type='checkbox' onclick='updateMarkersOnMap();'/></td>" +        
                  "<td contenteditable>"+i.name+"</td>"+        
                  "<td geo contenteditable>"+i.description+"</td>"+
                  "<td>"+i.lat+"</td>"+
                  "<td>"+i.lng+"</td>"+
                  "<td></td>"+
                  "<td class='hide'></td>"+ // color
                  "<td></td>"+
                  "</tr>";
*/
            glob_gpx[set_id].points.splice(seg_idx,0,i);

            gpxPointsToTable(glob_gpx[set_id],set_id,"checked");

            gpxexec(["updateMarkersOnMap"]);
            
            console.log("@@ addPoint() ", i);

        
//        updateMarkersOnMap("");

}

function gpxFromGoogle() {     
      var params = {
        // The spreadsheet to request.
        spreadsheetId: '1zNy8SZ-ZPnAYXsGGmxvDYe0hHnyS6spuYuQCcAxg6dA',  // TODO: Update placeholder value.

        // The ranges to retrieve from the spreadsheet.
        ranges: [],  // TODO: Update placeholder value.

        // True if grid data should be returned.
        // This parameter is ignored if a field mask was set in the request.
        includeGridData: false,  // TODO: Update placeholder value.
      };

      var request = gapi.client.sheets.spreadsheets.get(params);
      request.then(function(response) {
        // TODO: Change code below to process the `response` object:
      sheetNames = $(response.result.sheets).map(function (k,v) {
            if (v.properties.title[0] != "~" ) return {name: v.properties.title}; 
        }).get();

        $(".datasetcheckbox").html("<div class='checkbox_field'>\
            <div check=all><input type=checkbox id='all'  onchange='updateMarkersOnMap(this.id)'>" +
                    "<label for='all'>Все</label></div></div>");

//        sheetsNames.sort();
        
        tm('start load');        
        
        setCounter = sheetNames.length;
        gpxSetNamesToTable(sheetNames);
        
        $(sheetNames).each(function(k,v){
           
//           $(".datasetcheckbox").append("<div class='checkbox_field'>\
//                <div check="+v+"><input type=checkbox id='"+v+
//                    "' onchange='updateMarkersOnMap(this.id)'>" +
//                "<label for='"+v+"'><gpx_total></gpx_total>"+v+"</label></div></div>");
//                "<label for='"+v+"'>"+cels.length+"."+v+"</label></div></div>");
            getGoogleGpxPoints(k,v.name);
          });

            
//          console.log("@@ res",glob_gpx);
          
          $.when.apply(deferreds).then(function() {
                // all AJAX calls have complete
//               console.log("@@ gpx=",gpx);
            });


      }, function(reason) {
        console.error('error: ' + reason.result.error.message);
      })
    }


    function getGoogleGpxPoints(set_id,sheetName)
    {
        var params = {
            spreadsheetId: '1zNy8SZ-ZPnAYXsGGmxvDYe0hHnyS6spuYuQCcAxg6dA',  // TODO: Update placeholder value.
            range: sheetName+'!A1:J1000',  // TODO: Update placeholder value.
          };
          
        var request = gapi.client.sheets.spreadsheets.values.get(params);
            request.then(function(response) {

//            console.log("@@ sheetName= ", sheetName, response.result)
//            deferreds.push( gpxPointToTable(response.result,sheetName) )
            
//            console.log("response.result.values= ", response.result.values);
            
            col_names=response.result.values[0];
            
            $.each(response.result.values, function(k,v)
            {
//             console.log("response.result.values= ", v  );
                var myArray = $.map(v, function(element, key ) {        // ***
//                       console.log("element, key= ", element, key) 
                       return element.value;                               // ***
                    });
            });
            
            gcols = response.result.values[0];
            geo_set = {};
            points = [];
            
            
            response.result.values
                    .slice(1) // пропускаем первую строку
                    .map(function(v,k){ 
                        p = {}
                        $.each( v , function(kk,vv) { p[gcols[kk]] = vv; } );
                        points.push(p);
                    });
            
             geo_set = {'name': sheetName,
                meta: {type: 'path',
                       descriptin: '',  
                       cdate: '2019-12-26', 
                       mdate: '2019-12-26' 
                       },
                points : points
               } 
            

//            console.log('@@ response.result.values geo_set', geo_set); 
            
            glob_gpx[sheetName] = geo_set;
            gpxPointsToTable (geo_set,set_id)  // отрисовка таблицы как для JSON    
            
            
//            tm("load data"+sheetName);
//            return response.result;
            return glob_gpx;
                
          }, function(reason) {
            console.error('error: ' + reason.result.error.message);
          }); 
          
//          console.log("@@ res",sheetName, glob_gpx);
    
    }

    function initClient() {
      var API_KEY = 'AIzaSyBbtTWVRcUwdDgQbxbhAUU3XTbhxP4NyO0';  // TODO: Update placeholder with desired API key.

      var CLIENT_ID = '608799792412-vd2f3gk4q4dgdhtf1h23utku1vc7b39g.apps.googleusercontent.com';  // TODO: Update placeholder with desired client ID.

      // TODO: Authorize using one of the following scopes:
      //   'https://www.googleapis.com/auth/drive'
      //   'https://www.googleapis.com/auth/drive.file'
      //   'https://www.googleapis.com/auth/spreadsheets'
      var SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

      gapi.client.init({
        'apiKey': API_KEY,
        'clientId': CLIENT_ID,
        'scope': SCOPE,
        'discoveryDocs': ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
      }).then(function() {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
        updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      });
    }

    function handleClientLoad() {

        makeApiCall('get_gpx_DB');  // load from DB

//      gapi.load('client:auth2', initClient);  // google load init  
    }

    function updateSignInStatus(isSignedIn) {
      if (isSignedIn) {
        makeApiCall('read');
      }
    }

    function handleSignInClick(event) {
      gapi.auth2.getAuthInstance().signIn();
    }

    function handleSignOutClick(event) {
      gapi.auth2.getAuthInstance().signOut();
    }
    
    function _gpxPointToTable(res,sheetName)
    {   
        var cels = res.values;
        var row = "";
        
        total_points = cels.length;
        dist_next = dist_total = 0;
        
         row = "<tr class='header'><td> </td>" +
                  "<td class='hide'>Название</td>" +        
                  "<td>Наименование</td>"+        
                  "<td geo>Описание</td>"+        
                  "<td>Широта</td>"+        
                  "<td>Долгота</td>"+
                  "<td>До базы</td>"+
                  "<td class='hide'>Цвет</td>"+ // color
                  "<td>Расстояния</td>"+
                  "</tr>";


        for (var r=1; r < total_points; r++)
        {   
            if (cels[r][2] == '') continue;
            
//            console.log("@@ pp ", r );
            
            
            if ( r > 2 )
            {
                dist_next = getDistanceFromLatLonInKm(cels[r][4], cels[r][5], cels[r-1][4],cels[r-1][5]);
//                console.log("@@ cells", cels[r][4], cels[r][5], cels[r-1][4],cels[r-1][5]);
                dist_total += isNaN(dist_next)? 0: dist_next; // добавляем если число  
            } 
            else
            {
            }    

            tdist_html = (r>0) ? dist_total.toFixed(2)+"<sup>+"+dist_next+"</sup>" :"Total"
           
//continue;
            
            row += "<tr class='"+((r)?"":"header")+"'><td>"+cels[r][0]+"</td>" +
                  "<td class='hide'>"+cels[r][1]+"</td>" +        
                  "<td>"+cels[r][2]+"</td>"+        
                  "<td geo>"+cels[r][3]+"</td>"+        
                  "<td>"+cels[r][4]+"</td>"+        
                  "<td>"+cels[r][5]+"</td>"+
                  "<td>"+cels[r][6]+"</td>"+
                  "<td class='hide'>"+cels[r][7]+"</td>"+ // color
                  "<td>"+tdist_html+"</td>"+
                  "</tr>";
        }
        
        $("label[for='"+sheetName+"'] gpx_total").text("("+ cels.length +") ");
        tm(sheetName)
        
        $(".datasets").append("<div class='wp_panel hide "+sheetName+"'><table class='tab' dataset='"+sheetName+"'></table><div>");
        $("[dataset ="+sheetName+"]").append(row);
        
        $(".tab tbody").sortable({
                helper: fixHelperModified,
                stop: updateIndex,
                cancel: '[contenteditable]',
        })//.disableSelection();
    
/*
    var start = document.getElementById('start');
    start.focus();
    start.style.backgroundColor = 'yellow';
    start.style.color = 'magenta';
*/    

/*                
left = 37
up = 38
right = 39
down = 40                
*/                


    document.onkeydown = checkKey;
    
    function checkKey(e) {
        
        e = e || window.event;
        
        el= start || $('.tab').find('td')[0];
        
        console.log("@@ e.keyCode", e.keyCode);
        
        switch (e.keyCode)
        {
         case 13:  
         case 37: el = el.closest('tr').find('td').eq(index).next(); 
                  break;
         case 39: el = el.closest('tr').find('td').eq(index).prev(); 
                  break;
        }
      }
        
        
        $('.tab td').keypress(function(e) {
                var $this = $(this),
                    index = $this.closest('td').index();
                console.log("@@ keypress",index,e.keyCode);
                
                el.css({color:'red'});
                el.attr('contenteditable','true');
                el.focus();
                setTimeout(function() {
                    el.focus();
                }, 0);
                 e.preventDefault();
            });

        
        $(".datasets td").on("click", function(e){
            start = $(this);
            start.focus();

            var self   = $(this),
            
            index  = self.index(),
            text   = self.text();
       
console.log("@@@ table eq()" , text + ' ' + index, start );
        
            if (e.ctrlKey) // description column
            {
            td_val = $(this).text();
                switch(index)
                {
                case 3: geo_result = geocode(td_val);
                        break; 
                
                case 6: td_val = $(this).parent("tr").find("td:eq(4),td:eq(5)")
                        .map(function() {return $(this).text()}).get();
                        
                        $(this).text(getDistanceFromLatLonInKm(td_val[0], td_val[1]));

                        break;
                }         
// console.log("@@@ td [geo]",geo_result);
            $(this).addClass('geocoded');
                
            }


// zoom to clicked marker            

            if (e.altKey) {map.setZoom(13);}

// pan to clicked marker

            $(this).attr('contenteditable','true');
            
            pan_location = $(this).parent("tr")
                 .find("td:eq(4),td:eq(5)")
                 .map(function() {
                 return $(this).text();
              }).get();
            
            lat = pan_location[0];
            lng = pan_location[1];
            
            
            if (e.ctrlKey && index == 1) {
                
                
                url = 'https://maps.googleapis.com/maps/api/elevation/json?locations=' +
                       lat+ ','+ lng + 
                       '&key=AIzaSyBbtTWVRcUwdDgQbxbhAUU3XTbhxP4NyO0';


                console.log ('@@@ altitude url', url);
                
                $.get(url, function( data){
                    console.log ('@@@ altitude', url, data );
                })
                
            }

            var latLng = new google.maps.LatLng(lat,pan_location[1]); 
            map.panTo(latLng);  
            
        })

    } // end gpxPointToTable
    
function updateMarkersOnMap(id = 0 )
{
// http://qaru.site/questions/17975/google-maps-api-v3-how-to-remove-all-markers 
    
   while(markers.length) { markers.pop().setMap(null);   }
   markersArray = new _markers([]);
   
   chkd = $("[gpx_id] input:checked");

//   console.log("@@ updateMarkersOnMap 00 chkd =", chkd);
    
   $.each(chkd, function(k,v) {

//          gpx_id = $(v).closest('tr').attr('gpx_id'); 
          gpx_id = $(v).attr('gpx_id'); 
          set_id = $(v).closest('div[set_id]').attr('set_id');
          
          g_set = glob_gpx[set_id];

          [setName,pointName,pos] = gpx_id.split("|");

//          console.log("@@@ gpx_id=", gpx_id,set_id, g_set.points[pos]);
          

          if ( typeof g_set.points[pos] === 'undefined' )  return true;   

          p = g_set.points[pos];
          
//          console.log("@@ updateMarkersOnMap each=", [setName,pointName,pos], glob_gpx[set_id]);

          m = { 'name':p.name,
                 'gpx_id':gpx_id,
                 'gpxSet':setName,
                 'lat':p.lat,
                 'lng':p.lng,
                 'dist':p.dist,
                 'color':p.color,  
//                 'icon':"icon"  
                 };
           
//           olat = lat;
//           olng = lng;
           markersArray.push(m);
   }); // end each

  console.log("@@ updateMarkersOnMap markersArray=", glob_gpx, markersArray);


  markersArray.addMarkers();
  drawPath();
//  savegpx();
}    


var start;
var lap;

function ChangedSelection()
{
var x = document.getElementById("mySelect").selectedIndex;
var color =document.getElementsByTagName("option")[x].value;
var y = document.getElementById("mySelect");
y.style.color=color;
}


    
    
    