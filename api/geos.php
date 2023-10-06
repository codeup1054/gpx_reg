<?php
header('content-type: application/json; charset=utf-8');
include_once ('gpx.db.php');

$res = array();
//$res['post'] = $_POST;

$rqst = json_decode(file_get_contents('php://input', true));


$res['result'] = proccess_request($rqst);


print_r([$rqst,$res]);



function proccess_request($rqst)
{
    $res = (object)array();

    switch ($rqst->action) {
        case 'create':
            $res = insertGeos($rqst->data);
            break;
        case 'getgeos':
            $res = getGeos($rqst->whe, $rqst->verbose );
            break;
        default:
            $res->msg = 'Operation undefined';
    }
    return $res;
}


function insertGeos($v)
{
    global $conn;
    print_r ($v->meta->msg);
    print_r ($v->name);

    $meta = json_encode($v->meta, JSON_UNESCAPED_UNICODE);
    $geojson = json_encode($v->geojson);

    print ("$meta, $geojson");

//    $sql = "INSERT INTO gpx_geos (name, meta, geojson)  VALUES ('{serialize($v->name)}','{\"msg\":\"{$v->meta}\"}', '{$v->geojson}')";
    $sql = "INSERT INTO gpx_geos (name, meta, geojson)  VALUES ('{$v->name}','{$meta}', '{$geojson}')";

    print ($sql);

    if ($conn->query($sql) === TRUE)  $res =  "Успешно создана новая запись";
    else $res =  "Ошибка: " . $sql . "<br>" . $conn->error;
    return $res;
}


function getGeos($whe, $verb= false)
{
    global $conn;

    $ret = (object)  array();

    $rows = array();


// 2023-09-29 поиск по JSON  SELECT * FROM gpx_geos WHERE JSON_UNQUOTE(meta->'$.msg') LIKE "Postman 4%т";

    print_r (["_r",$v]);

    $sql = "SELECT * from  gpx_geos where {$whe}";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        // output data of each row
        while ($r = $result->fetch_object()) {
            $rows[] =  $r;
        }

        $ret->msg = "Найдено:".$result->num_rows;
        $ret->data = $rows;

    } else
        $ret->msg = "Нет данных".$sql;

    return $ret;
}


global $conn;
$conn->close();
?>