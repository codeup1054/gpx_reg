import {map} from './app.polygon_test.js'

export function polyLoader(map)
{
    console.log("@@ polyloder1", map)

    let map2 = document.createElement("div");
    map2.classList.add("custom-map-control-btn");

    const innerHTML = `
<input type="button" name="polyloader" value="polyloader" id="polyloader"
    onclick="polyLoaderFile()" />
`;

    map2.innerHTML = innerHTML

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(map2);

    console.log("@@ mapContrlsDiv",map2, map.controls[google.maps.ControlPosition.TOP_LEFT])

    $('.custom-map-control-div').append(innerHTML)

    $('#polyloader').on('click',()=>polyLoaderFile())

    function polyLoaderFile()
    {
        console.log("@@ 123",123)
    }


}


