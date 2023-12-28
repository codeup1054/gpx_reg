<?php
header('content-type: application/json; charset=utf-8');
include_once ('../gpx.db.php');

$res = array();
//$res['post'] = $_POST;

$rqst = json_decode(file_get_contents('php://input', true));

//echo print_r($_REQUEST,1);
//print_r($rqst);


$res['results'] = proccess_request($rqst);


echo  json_encode($res);


function proccess_request($rqst)
{
    $res = (object)array();

    switch ($rqst->action) {
        case 'create':
            $res = insertGeos($rqst->data);
            break;
        case 'getelevation':
            $res = getElevationDB($rqst->geojson);
            break;
        case 'geos_create_update':
            $res->funcres  = geosCreateUpdate($rqst->data, $rqst->verbose );
            $res->msg .= "03. geos_create_update '$rqst->action'";
            break;
        default:
            $res->msg .= "Unknown operation '$rqst->action'";
    }

    return $res;
}


function geosCreateUpdate($data, $verbose)
{
    global $conn;

    $res = (object)array();
    $res->msg =  "geosCreateUpdate 07";

    $geodata = $data->geodata;

    if ($verbose)
        $res->msg .= " data ".print_r($data,1);


//    $meta = json_encode($geodata->meta, JSON_UNESCAPED_UNICODE);
//    $geojson = json_encode($geodata->geojson);

//    $sql = "INSERT INTO gpx_geos (name, meta, geojson)  VALUES ('{$geodata->name}','{$meta}', '{$geojson}')
//ON DUPLICATE KEY UPDATE";

    $sql = "REPLACE INTO osm_elevation  (lat, lng, elevation)   VALUES ($geodata->lat,'$geodata->lng','$geodata->elevation')";
    $res->msg .= "\n *** $sql";
    if ($conn->query($sql) === TRUE)  $res =  "Успешно создана новая запись\n".$sql;
    else $res =  "Ошибка: " . $sql . "<br>" . $conn->error;

    return $res;
}



function elevationReplace($elevation_data, $verbose = false)
{
    global $conn;

    $res = (object)array();
    $res->msg =  "elevationReplace";

//    print_r((object)$elevation_data['result'] );

    $data_string = [];

    foreach($elevation_data['result'] as $k=>$v)
    {
        $o = (object)$v;
        $data_string[] = "($o->lat,$o->lng,$o->elevation)";
    }

    if ($verbose)   $res->msg .= " data ".print_r($data,1);


    $sql_data = implode(",",$data_string);

    $sql = "REPLACE INTO osm_elevation  (lat, lng, elevation)   VALUES $sql_data";

    $res->msg .= "\n elevationReplace $sql \n";

    if ($conn->query($sql) === TRUE) {
        $res->msg .= "Успешно добавлены \n" . $sql;
    }
    else
        $res->msg =  "Ошибка: " . $sql . "<br>" . $conn->error;


    return $res;
}



function getElevationDB($geojson,  $verb= false)
{
    global $conn;

// 2023-12-15 Add request
// 2023-12-14 поиск по JSON  SELECT * FROM gpx_geos WHERE JSON_UNQUOTE(meta->'$.msg') LIKE "Postman 4%т";


    $whe = ' where ';

    $lat_lng = [];

    $rows = array();

    foreach ((array)$geojson as $k=>$v)
    {
//            print (" (lat = $v[0] and lng = $v[1] ) or"  );
        $whe .= " (lat = $v[0] and lng = $v[1] ) or";
        $lat_lng[number_format($v[0],4)."_".number_format($v[1],4)] = 1;
    }

    $sql = "SELECT lat,lng,elevation from  osm_elevation $whe false";
    $result = $conn->query($sql);
    $ret = new stdClass();

    if ($result->num_rows > 0) {
        // output data of each row
        while ($r = $result->fetch_assoc()) {
            $rows[] =  $r;
        }

        $ret->sql_ = $sql;
        $ret->data = $rows;

    } else
        $ret->msg .= "No data in DB: ". $sql;

    foreach ($rows as $k=>$v)
    {
        $key = number_format($v['lat'],4)."_".number_format($v['lng'],4);
        unset($lat_lng[$key]);
    }

    $osm_Lat_Lng = [];

    if (count($lat_lng) > 0 )
    {
        $osm_Lat_Lng = getOSMElevation($lat_lng);

        /**
         *  elevationReplace()  add after get data
         */

        elevationReplace($osm_Lat_Lng);

        $ret->new_data = $osm_Lat_Lng["result"];
        $rows = array_merge($rows, $ret->new_data);

//            print_r ($osm_Lat_Lng);
    }

    $ret->msg = "Found Найдено:".$result->num_rows ." | ".count($lat_lng) ."</br> new from OSM: ". count($osm_Lat_Lng) ;

    return $ret;
}


function getOSMElevation( $lat_lng = ["55.69_37.40"=>1, "55.69_37.41"=>1 ])
{
    sleep(1);

    $coords_str = str_replace("_",",", implode("|",array_keys($lat_lng)));

    $ret = array();
    $ret['$coords_str '] = $coords_str;
    $ret['msg'] = "getOSMElevation";
    $url = "https://api.opentopodata.org/v1/aster30m";

    $data = ['locations' => $coords_str, "interpolation" => "bilinear"];

    $options = [
        'http' => [
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data),
        ],
    ];

    $context = stream_context_create($options);

    $result = file_get_contents($url, false, $context);

    $j = json_decode($result, true);

    if (!$result) {
        $ret["err"] = $result;
    }
    else
    {
        $elev = [];
        foreach($j["results"] as $k=>$v) {


            $elev[] = array(
                "lat" => number_format($v["location"]["lat"],4),
                "lng" => number_format($v["location"]["lng"],4),
                "elevation" => number_format($v["elevation"],1),
            );
        }

        $ret['result'] = $elev;
    }

    return $ret;

}


global $conn;
$conn->close();
?>