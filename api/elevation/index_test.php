<?php
header('content-type: application/json; charset=utf-8');

function getOSMElevation( $lat_lng = ["55.69_37.40"=>1, "55.69_37.41"=>1 ])
{

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

            print($k."|".json_encode($v[0]));

            $elev[] = array(
                "lat" => $v["location"]["lat"],
                "lng" => $v["location"]["lng"],
                "elevation" => $v["elevation"]
            );
        }

        $ret['result'] = $elev;
    }

    return $ret;

}


$res = array();

$res['results'] = getOSMElevation();

echo  json_encode($res);

?>