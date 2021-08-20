let data = {}

data = (!!data)?[]:data

console.log("@@ ", data)


const mapLegend = document.createElement("div");
mapLegend.classList.add("if need");
mapLegend.addEventListener("click", () => { // if need

});

mapLegend.innerHTML = "<div></div>"; // внутри для обозначения линии  svg line, <div>, transparent png with background-color


map.controls[google.maps.ControlPosition.TOP_LEFT].push(mapLegend);

<img src="transp.png" width=30px height=5px style="background-color:{legend}"> < {legend_speed}
