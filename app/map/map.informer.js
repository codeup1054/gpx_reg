import {clearCookie} from '/app/map/map.location.cookie.js?2'


export let mapInformer = {
    add: function()
    {

        let zoomLatLngMonitor = document.createElement("div");
        zoomLatLngMonitor.classList.add("custom-map-control-div");
        zoomLatLngMonitor.style.display="inline-block";

        $("#debug").append(zoomLatLngMonitor);

        const zooms = [...Array.from({ length:12 }, (_, i) => 5+i)]


        const zoomOpt = zooms.map((v, k) => {
            return "<option value='" + k + "' " +
                ((_param.zoom == v) ? 'selected >' : '>') + v + "</option>"
        }).join("")

        const zoomSelect = "<select>"+zoomOpt+"</select>"

        zoomLatLngMonitor.innerHTML = "<zoom>" + _param.zoom  + "</zoom>" +
            "<div class='inline-block'><lat>" + _param.homeGeo.lat + "</lat><br><lng>" + _param.homeGeo.lng + "</lng></div>";

        _map.controls[google.maps.ControlPosition.TOP_RIGHT].push(zoomLatLngMonitor);

        $("zoom").on("click",() => { console.log ("@@ 222",222);  clearCookie();});
    }
}
