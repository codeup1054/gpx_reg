import {addSliderCallback} from '/app/map/map.controls.js'

export function layerTool () {

    let mapCtrl = document.createElement("div");
    mapCtrl.classList.add("custom-map-control");

    const monthOptions = []
    const currMonth = new Date('2021-12-31');
    const now = new Date();

    now.setMonth(now.getMonth(), 2)

    while (currMonth.setMonth(currMonth.getMonth() + 1, 1) < now) {
        monthOptions.push(currMonth.toISOString().substr(0, 7))
    }

    let mapLayerSelectorHTML = ""


    let defaultMonth = ['2021-08'] //['2021-08','2021-11']

    // console.log ("@@ defaultMonth",defaultMonth)
    const overlaysDetails = Object.keys(overlayDetails)

    const tileOptsSelect = overlaysDetails.map((v, k) => {
        return k + "<option value='" + v + "' " + ((_param.controls.overlayDetails == k) ? 'selected >' : '>') + v.substr(9) + "</option>"
    })


    $.each(defaultMonth, function (k, v)
    {
        // console.log ("@@ k,v",k,v)
        const monthOptsSelect = monthOptions.map((vv, kk) => {
            return "<option value='" + v + "' " + ((v === vv) ? 'selected' : '') + ">" + vv + "</option>"
        }).join("")

        mapLayerSelectorHTML =
            // "<div target='"+v+"' class='slider' slider ></div>" +
            "<select class='selector' map_overlay='" + k + "'>"+ monthOptsSelect + "</select>" +
            "<select class='selector gpx-controls' id='mapOverlays' title='tile_info' " +
            "onchange='_param.mapOverlays[k]'>" + tileOptsSelect + "</select>"
        $(".selector_" +k).val(v).change()


        let mapLayerSettings = document.createElement("span");
        mapLayerSettings.innerHTML = mapLayerSelectorHTML;
        mapCtrl.appendChild(mapLayerSettings);

        let mapLayerSlider = document.createElement("div");
        mapLayerSlider.setAttribute("target", v);
        mapLayerSlider.setAttribute("slider", null);
        addSliderCallback(mapLayerSlider);
        // console.log("@@ mapLayerSlider",mapLayerSlider);
        mapCtrl.insertBefore(mapLayerSlider,mapCtrl.firstChild);

    })
    return mapCtrl;
}

export function hmCompareTool()
{
    let mapCtrl = document.createElement("div");
    mapCtrl.classList.add("custom-map-control");
    mapCtrl.innerHTML = '<span><b>darkness</b></span>';

    // let d = new Date()
    // const left_layer = d.toISOString().substr(0,7) // current month
    // const right_layer = d.toISOString().substr(0,7) // current month
    //

    let mapStyleSlider = document.createElement("div");
    mapStyleSlider.classList.add('slider');
    mapStyleSlider.setAttribute("target", 'map');
    mapStyleSlider.setAttribute("slider", null);
    addSliderCallback(mapStyleSlider);

    mapCtrl.insertBefore(mapStyleSlider,mapCtrl.firstChild);


    return(mapCtrl);
}