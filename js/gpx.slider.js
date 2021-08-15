$(function () {

    $( ".slider_transparency" ).each(function(k,v){

        console.log("@@ slider_transparency",k,v);

        $(v).slider({
            orientation: "horizontal",
            range: "min",
            max: 100,
            value: hmOpacity[k]*100,
            slide: function( event, ui ) {}
        })
        let hist = $(this).attr('hist')
        $('[hist="'+hist+'"] span.ui-slider-handle')
            .html("<div>" + Math.floor(hmOpacity[k]*100) + "</div>");


        $('div.heatmapdiv.'+hist).css({opacity: hmOpacity[k]});

        $(v).on( "slide", function( event, ui ) {

            let hist = $(this).attr('hist')

            let tval = ui.value;
            let k = ($(this).attr('hist') === '2021-06')?0:1;

            hmOpacity[k] = tval / 100;

            $('div.heatmapdiv.'+hist).css({opacity: hmOpacity[k]});

            $('[hist="'+hist+'"] span.ui-slider-handle')
                .html("<div>" + tval + "</div>");

            ifMapChanged();

        } );


    })
})