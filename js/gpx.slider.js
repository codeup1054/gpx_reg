

// function addSlider(control,target)
// {
//     console.log("@@ addSl ", control,target, control.attr("id")  )
//
//     control.slider({
//         orientation: "horizontal",
//         range: "min",
//         max: 100,
//         value: opacity_arr['map'] * 100,
//         slide: function (event, ui) {
//         }
//     })
//
//     control.on("slide", function (event, ui) {
//
//         let tval = ui.value;
//
//         targetOpacity = tval / 100;
//
//         target.css({opacity: hmOpacity[k]});
//
//         $(control.id + ' span.ui-slider-handle')
//             .html("<div>" + tval + "</div>");
//         // ifMapChanged();
//     });
//
//
// }

// console.log("@@ addSlide init")



$(function () {
    // console.log("@@ 2 m $( .slider_transparency )",  $( ".slider_transparency" ))

        $( ".slider_transparency" ).each(function(k,v){


        const opacityKey = $(v).attr('id')
        const sliderId = opacityKey
        const target = $(v).attr('target')
        let el_opacity  = arrOpacity[target] || 0.5

            // console.log("@@ slider_transparency 3",[target, opacityKey, k , v ]);



        $(v).slider({
            orientation: "horizontal",
            range: "min",
            max: 100,
            value: el_opacity*100,
            create: function( event, ui ) {
                // console.log("@@ slide callback",event, ui  )
                $('#' + sliderId+' span.ui-slider-handle').html("<div>" + Math.floor(el_opacity*100) + "</div>");
                if (target !='map')
                    $('.' + target).css({opacity: el_opacity});
                else
                    setMapStyler(el_opacity*100);
            },
            slide: function( event, ui ) {
                let tval = ui.value;

                arrOpacity[target] = tval / 100;

                if (target ==='map')
                {
                    setMapStyler(tval)
                }
                else
                {
                    $('.' + target).css({opacity: arrOpacity[target]});
                }

                $('#' + sliderId+' span.ui-slider-handle').html("<div>" + tval + "</div>");

                ifMapChanged();
            }
        })
    })

    $('.slider_transparency').dblclick(function() {
        var sliderId = $(this).attr('id') ;

        if (sliderId== 'slider_map') {
            $(this).slider('value', 50, $(this));
            $('#' + sliderId +' span.ui-slider-handle').html("<div>" + 50 + "</div>");

            setMapStyler(50)

            arrOpacity[$(this).attr('target')] =0.5

            ifMapChanged()
        }
    })

})