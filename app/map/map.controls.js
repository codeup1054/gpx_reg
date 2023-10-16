import {mapObjects, geoZonesFiles,_geos}  from "/app/geodata/geo_model.js";
import {ifMapChanged} from "/app/map/map.location.cookie.js";
import {MERCATOR} from '/app/map/map.overlay.js?1'
import {geoZoneTools} from "./controls/geo_zones.js";
import {cacheTool} from "./controls/cache.control.js";
import {layerTool, hmCompareTool} from "./controls/layer.control.js";
import {polylineTools} from "./controls/gpx.geos.edit/gpx.geos.list.edit.js";


let cssId = 'myCss';  // you could encode the css path itself to generate id..
if (!document.getElementById(cssId))
{
    let head  = document.getElementsByTagName('head')[0];
    let link  = document.createElement('link');
    link.href = 'app/map/map.controls.css';
    link.type = 'text/css';
    link.id   = cssId;
    link.rel  = 'stylesheet';
    link.media = 'all';
    head.appendChild(link);
}

// import {USGSOverlay} from "/app/map/map.usgsoverlay.js";


function add_geo_zones() {
    const customControlPanel = $("<div/>", {
        "class": "custom-map-control",
        "css": {"border": "red 1px solid;"}
    });
    customControlPanel.text("13`13`1");
    return customControlPanel;
}


export let mapControls = {
    add_custom_control_panel: function () {
        // const customControlPanel = $("<div/>", {
        //         "class": "custom-map-control-button-panel",
        //         "css": {"border": "red 1px solid;"}
        //     }
        // );
        let customControlPanel = document.createElement("div");

        customControlPanel.appendChild(geoZoneTools());
        customControlPanel.appendChild(cacheTool());
        customControlPanel.appendChild(polylineTools());

        _map.controls[google.maps.ControlPosition.TOP_LEFT].push(customControlPanel);


        customControlPanel = document.createElement("div");
        customControlPanel.appendChild(layerTool());
        customControlPanel.appendChild(hmCompareTool()) ;
        _map.controls[google.maps.ControlPosition.TOP_CENTER].push(customControlPanel);

        // addSlider();

    },

    add_compare_control: function()
    {
        let mapCtrl = document.createElement("div");
        mapCtrl.classList.add("custom-map-control-div");

        $("#debug").append(mapCtrl)

        const left_layer = ''

        let d = new Date()
        const right_layer = d.toISOString().substr(0,7) // current month

        const controlHTML =
            left_layer +
            "<div target='"+right_layer+"' class='slider' slider ></div>" +
            right_layer +
            "</br><div target = 'map' slider></div>Map"

        mapCtrl.innerHTML = "<div class='slider_control' style='height:100px;'>" + controlHTML + "</div>"

        _map.controls[google.maps.ControlPosition.TOP_LEFT].push(mapCtrl);
    },

    add_geozone_control: function(mapCtrl)
    {
       geoZoneTools({}, mapCtrl, _map);
    },

    add_polyline_control: function(mapCtrl)
    {
        // polylineTools();
    }

}



// export function addSliderCallback(sliderId, target) {
export function addSliderCallback(sliderEl) {
    const sliderId = $(sliderEl).attr(`target`);
    const target = sliderId;

    // console.log(`@@ 21. addSliderCallback [${target}] `,  sliderEl, sliderId);

    let el_opacity = (_param.mapOverlays[sliderId] !== undefined ) ? _param.mapOverlays[sliderId].opacity : 0.5

    $(sliderEl).slider({
        orientation: "horizontal",
        range: "min",
        max: 100,
        value: el_opacity * 100,

        create: function (event, ui) {

            let sliderHandle = sliderEl.querySelector('span.ui-slider-handle');
            sliderHandle.innerHTML="<div>" + Math.floor(el_opacity * 100) + "</div>";
            // console.log("@@ 22. span.ui-slider-handle')", sliderHandle,"\n children=" , $(this).children());

            if (target === 'map')
                setMapStyler(el_opacity * 100);
            else
                $('[' + target +']').css({opacity: el_opacity });
        },
        slide: function (event, ui) {
            let tval = ui.value;

            _param.mapOverlays[sliderId] = {"opacity" :  tval / 100};

            if (target === 'map') {
                setMapStyler(tval)
            } else {
                $('.' + target).css('opacity', tval/100);
                // $('.map-tile').css('opacity', tval/100);
            }

            // sliderHandle.innerHTML="<div>" + tval + "</div>";
            $('[target=' + sliderId + '] span.ui-slider-handle').html("<div>" + tval + "</div>");

            ifMapChanged();
        }
    })

}


function setMapStyler(tval) {
    const mapStyles = [{
        "stylers": [{
            "lightness": 2 * tval - 100
        }]
    }];


    _map.setOptions({styles: mapStyles});

}