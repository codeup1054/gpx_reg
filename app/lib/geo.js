export function geo_distance(a, b, precision = 3, unit = "K") {
    const lat1 = a[0];
    const lon1 = a[1];
    const lat2 = b[0];
    const lon2 = b[1];


    var radlat1 = Math.PI * lat1 / 180
    var radlat2 = Math.PI * lat2 / 180
    var theta = lon1 - lon2
    var radtheta = Math.PI * theta / 180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    if (unit == "K") {
        dist = dist * 1.609344
    }
    if (unit == "M") {
        dist = dist * 0.8684
    }
    return dist;
}


// function polyDistance(gsArray)
// {
//     console.log("@@ polySementDistance poly= ",gsArray);
//
//     const segments = [];
//
//     for (let i = 0; i < gsArray.length-1; i++ )
//     {
//         const s = gsArray[i];
//         const e = gsArray[i+1];
//
//         let _first = { lat:s[0], lng:s[1] };
//         let _last =  { lat:e[0], lng:e[1] };
//         let segLenMeter = Math.floor(google.maps.geometry.spherical.computeDistanceBetween(_first,_last));
//         segments.push(segLenMeter);
//     }
//
//     return segments;
// }