export function altitudeColor(alt,
                              altThresholds = [
                                  0, 100, 120, 140,
                                  160, 180, 200, 220,
                                  240, 260],
                              colors = [
                                  '#440077', '#0040CC', '#00aaDD', '#00CCB0',
                                  '#00C000', '#80FF00', '#FFFF00', '#FFC000',
                                  '#FF0000', '#882200', '#411100'
                              ]
) {
    // const altThresholds = [800, 900, 1000, 1100, 1200, 1300, 1400, 1500]; // meters

    // const altThresholds = [
    //       0, 100, 120, 140,
    //     160, 180, 200, 220,
    //     240, 260 ]; // meters

    // const colors = [
    //     '#440099', '#0040FF', '#00aaFF', '#00FFB0',
    //     '#00E000', '#80FF00', '#FFFF00', '#FFC000',
    //     '#FF0000', '#880066'
    // ];


    for (let i = 0; i < colors.length; ++i) {
        if (alt >= altThresholds[i] && alt < altThresholds[i+1]) {
            const p = (alt - altThresholds[i]) / (altThresholds[i+1] - altThresholds[i]);
            const col = calSegmentColor(colors[i],colors[i+1], p);
            // console.log(`@@ geo.js col=${col}`);
            return col;
        }
    }
    return colors[colors.length-1];
}

function calSegmentColor(h1 = '0000FF',h2 = 'FF0000', p=0.5)
    {
        const r1 = hexToRgb(h1.replace('#',''));
        const r2 = hexToRgb(h2.replace('#',''));
        const r3 = {
            r: Math.floor(r1.r + p * (r2.r - r1.r)).toString(16).padStart(2,'0'),
            g: Math.floor(r1.g + p * (r2.g - r1.g)).toString(16).padStart(2,'0'),
            b: Math.floor(r1.b + p * (r2.b - r1.b)).toString(16).padStart(2,'0'),
        }

        // console.log(`@@ geo.js r3 = `,r3, p);

        return `#`+[r3.r,r3.g,r3.b].join('')
    }

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}


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


export const MERCATOR = {

    fromLatLngToPoint: function (latLng) {
        let siny = Math.min(Math.max(Math.sin(latLng.lat * (Math.PI / 180)),-.9999),.9999);
        return {
            x: 128 + latLng.lng * (256 / 360),
            y: 128 + 0.5 * Math.log((1 + siny) / (1 - siny)) * -(256 / (2 * Math.PI))
        };
    },

    fromPointToLatLng: function (point) {     return {
        lat: (2 * Math.atan(Math.exp((point.y - 128) / -(256 / (2 * Math.PI)))) -
            Math.PI / 2) / (Math.PI / 180),
        lng: (point.x - 128) / (256 / 360)
    };
    },

    getTileAtLatLng: function (latLng, zoom) {
        let t = Math.pow(2, zoom), p = this.fromLatLngToPoint(latLng);
        return {x: Math.floor(p.x * t / 256 ), y: Math.floor(p.y * t / 256), z: zoom};
    },

    getTileBounds: function (tile) {
        tile = this.normalizeTile(tile);
        var t = Math.pow(2, tile.z),
            s = 256 / t,
            sw = {
                x: tile.x * s,
                y: (tile.y * s) + s
            },
            ne = {
                x: tile.x * s + s,
                y: (tile.y * s)
            };
        return {
            sw: this.fromPointToLatLng(sw),
            ne: this.fromPointToLatLng(ne)
        }
    },
    normalizeTile: function (tile) {
        var t = Math.pow(2, tile.z);
        tile.x = ((tile.x % t) + t) % t;
        tile.y = ((tile.y % t) + t) % t;
        return tile;
    }

}