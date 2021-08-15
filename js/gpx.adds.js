var clr_r = [
    'rgb(200,  0,  0)',
    'rgb(255, 90, 20)',
    'rgb(250,225, 10)',
    'rgb(100,230, 10)',
    'rgb( 30,180, 15)',
    'rgb( 80,190,155)',
    'rgb( 80,180,230)',
    'rgb( 100,120,230)',
    'rgb( 170,190,210)',
    'rgb( 210,220,230)'
];




function isLat(lat) {
    return isFinite(lat) && Math.abs(lat) <= 90;
}

function isLon(lng) {
    return isFinite(lng) && Math.abs(lng) <= 180;
}
