<?php
header('content-type: application/json; charset=utf-8');
include_once ('gpx.db.php');

$res = array();
//$res['post'] = $_POST;

$rqst = json_decode(file_get_contents('php://input', true));


$res['result'] = proccess_request($rqst);


//print_r($res['result']);

echo  json_encode($res);


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


    $meta = json_encode($geodata->meta, JSON_UNESCAPED_UNICODE);
    $geojson = json_encode($geodata->geojson);

//    print($res->msg);
//    print ("$meta, $geojson");

//    $sql = "INSERT INTO gpx_geos (name, meta, geojson)  VALUES ('{serialize($v->name)}','{\"msg\":\"{$v->meta}\"}', '{$v->geojson}')";
//    $sql = "INSERT INTO gpx_geos (name, meta, geojson)  VALUES ('{$geodata->name}','{$meta}', '{$geojson}')
//ON DUPLICATE KEY UPDATE";

    $sql = "REPLACE INTO gpx_geos (id, name, meta, geojson)  VALUES ($geodata->id,'$geodata->name','$meta', '$geojson')";

    $res->msg .= "\n *** $sql";

    if ($conn->query($sql) === TRUE)  $res =  "Успешно создана новая запись\n".$sql;
    else $res =  "Ошибка: " . $sql . "<br>" . $conn->error;

    return $res;
}

function insertGeos($v)
{
    global $conn;
//    print_r ($v->meta->msg);
//    print_r ($v->name);

    $meta = json_encode($v->meta, JSON_UNESCAPED_UNICODE);
    $geojson = json_encode($v->geojson);

    print ("$meta, $geojson");

//    $sql = "INSERT INTO gpx_geos (name, meta, geojson)  VALUES ('{serialize($v->name)}','{\"msg\":\"{$v->meta}\"}', '{$v->geojson}')";
    $sql = "INSERT INTO gpx_geos (name, meta, geojson)  VALUES ('{$v->name}','{$meta}', '{$geojson}')";

//    INSERT INTO table (id, name, age) VALUES(1, "A", 19) ON DUPLICATE KEY UPDATE
//name="A", age=19

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

    $sql = "SELECT * from  gpx_geos {$whe}";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        // output data of each row
        while ($r = $result->fetch_assoc()) {
            $r["meta"] = json_decode($r["meta"]);
            $r["geojson"] = json_decode($r["geojson"]);
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