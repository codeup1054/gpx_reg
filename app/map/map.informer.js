import {clearCookie} from '/app/map/map.location.cookie.js?2'


export let mapInformer = {
    add: function()
    {
        let p = param
        // console.log("@@ mapInformer param",p)

        let zoomLatLngMonitor = document.createElement("div");
        zoomLatLngMonitor.classList.add("custom-map-control-div");

        $("#debug").append(zoomLatLngMonitor);

        const zooms = [...Array.from({ length:12 }, (_, i) => 5+i)]


        const zoomOpt = zooms.map((v, k) => {
            return "<option value='" + k + "' " +
                ((p.zoom == v) ? 'selected >' : '>') + v + "</option>"
        }).join("")

        const zoomSelect = "<select>"+zoomOpt+"</select>"

        zoomLatLngMonitor.innerHTML = "<zoom>" + p.zoom  + "</zoom>" +
            "<div class='inline-block'><lat>" + p.homeGeo.lat + "</lat><br><lng>" + p.homeGeo.lng + "</lng></div>";

        p.map.controls[google.maps.ControlPosition.TOP_LEFT].push(zoomLatLngMonitor);

        $("zoom").on("click",() => { console.log ("@@ 222",222);  clearCookie();});
    }
}
