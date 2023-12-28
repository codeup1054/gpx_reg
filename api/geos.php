<?php
header('content-type: application/json; charset=utf-8');
include_once ('gpx.db.php');

$res = array();

$rqst_s = file_get_contents('php://input', true);
$rqst = json_decode($rqst_s);

$res['rqst'] = $rqst;

$res['result'] = proccess_request($rqst);


echo  json_encode($res);


function proccess_request($rqst)
{
    $res = (object)array();

    switch ($rqst->action) {
        case 'create':
            $res = insertGeos($rqst->data);
            break;
        case 'getgeos':
            $res = getGeos($rqst->whe, $rqst->sort , $rqst->verbose );
            break;
        case 'geos_create_update':
            $res->funcres  = geosCreateUpdate($rqst->data, $rqst->verbose );
            $res->msg .= "03. geos_create_update '$rqst->action'";
            $res->rqst2 = $rqst->data;
            break;
        default:
            $res->msg .= "Unknown operation: '$rqst->action' : ".print_r($rqst,1)." POST:".print_r($_POST,1);
    }

    return $res;
}


function geosCreateUpdate($data, $verbose)
{
    global $conn;

    $res = (object)array();
    $res->msg =  "geosCreateUpdate 07";

//    print_r($data->geodata);

    if ($verbose)  $res->msg .= " data ".print_r($data,1);

    $id = $data->geodata->id;
    $name = $data->geodata->name;
    $meta = json_encode($data->geodata->meta, JSON_UNESCAPED_UNICODE);
    $geojson = json_encode((array)$data->geodata->geojson, JSON_UNESCAPED_UNICODE);

    $res->data_r = $data;

    $sql = "REPLACE INTO gpx_geos (id, name, meta, geojson)  VALUES ($id,'$name','$meta', '$geojson')";

    $res->msg = "*** $sql";

    if ($conn->query($sql) === TRUE)  $res->msg .=  "Успешно создана новая запись\n".$sql;
    else $res->msg .=  "Ошибка: " . $sql . "<br>" . $conn->error;

    return $res;
}
//
//function insertGeos($v)
//{
//    global $conn;
//
//    $meta = json_encode($v->meta, JSON_UNESCAPED_UNICODE);
//    $geojson = json_encode($v->geojson);
//
//    print ("$meta, $geojson");
//
////    $sql = "INSERT INTO gpx_geos (name, meta, geojson)  VALUES ('{serialize($v->name)}','{\"msg\":\"{$v->meta}\"}', '{$v->geojson}')";
//    $sql = "INSERT INTO gpx_geos (name, meta, geojson)  VALUES ('{$v->name}','{$meta}', '{$geojson}')";
//
//    print ($sql);
//
//    if ($conn->query($sql) === TRUE)  $res =  "Успешно создана новая запись";
//    else $res =  "Ошибка: " . $sql . "<br>" . $conn->error;
//
//
//    return $res;
//}


function getGeos($whe="", $sort = " order by tm_modified desc",  $verb= false)
{
    global $conn;
    $ret = (object)  array();
    $rows = array();

// 2023-09-29 поиск по JSON  SELECT * FROM gpx_geos WHERE JSON_UNQUOTE(meta->'$.msg') LIKE "Postman 4%т";

    $sql = "SELECT * from  gpx_geos ${whe} ${sort}";

    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        // output data of each row
        while ($r = $result->fetch_assoc()) {
            $r["meta"] = json_decode($r["meta"]);
            $r["geojson"] = json_decode($r["geojson"]);
            $rows[] =  $r;
        }

        $ret->msg = "Found Найдено:".$result->num_rows;
        $ret->sql_ = $sql;
        $ret->data = $rows;

    } else
        $ret->msg = "No data Нет данных".$sql;

    return $ret;
}


global $conn;
$conn->close();
?>