import {_mapObjects}  from "/app/geodata/geo_model.js";
import {model} from "../../const.js";

export function addSlider(sliderEl) {

    const target = $(sliderEl).attr(`target`);
    const target2 = $(sliderEl).attr(`target2`) || 'no_target2';

    console.log(`@@ 33 addSlider `, target, sliderEl);

    let _param = model.param;

    let el_opacity = (_param.mapOverlays[target] !== undefined ) ? _param.mapOverlays[target].opacity : 0.5

    $(sliderEl).slider({
        orientation: "horizontal",
        range: "min",
        max: 100,
        value: el_opacity * 100,

        create: function (event, ui) {

            let sliderHandle = $(sliderEl).find('span.ui-slider-handle');
            sliderHandle.innerHTML="<div>" + Math.floor(el_opacity * 100) + "</div>";
            // console.log("@@ 22. span.ui-slider-handle')", sliderHandle,"\n children=" , $(this).children());

            if (target === 'map')
                setMapStyler(el_opacity * 100);
            else {
                $('[' + target + ']').css({opacity: el_opacity});
            }

        },
        slide: function (event, ui) {
            let tval = ui.value;

            _param.mapOverlays[target] = {"opacity" :  tval / 100};

            if (target === 'map') {
                setMapStyler(tval)
            } else {
                const target2opacity = $('.' + target2).css("opacity");

                $('.' +  target).css({opacity : tval/100});

                const selected_val = $(`select[target2 = "${target2}"]`).val();

                $('.' + target2).css({opacity: (selected_val == 'NO MAP')? 0: 1-tval/100});
            }

            $('[target=' + target + '] span.ui-slider-handle').html("<div>" + tval + "</div>");

            // ifMapChanged();
        }
    })

}