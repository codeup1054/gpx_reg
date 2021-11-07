import {ifMapChanged} from '/app/map/map.location.cookie.js'

export let mapEvents = {
    add: function()
    {
        // console.log("@@ $(gpx_controls)")
        $("select.gpx-controls").on('change',(e)=> {
            const option_text = $(e.target).find("option:selected").text()
            console.log( "@@ change :", [ e.target.id, param, map ] )
            $(e.target).attr("model", option_text )
            param.controls[e.target.id] = option_text
            ifMapChanged()
        })
    }
}
