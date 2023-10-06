<?php

error_reporting(E_ALL);
ini_set("display_errors", 1);

global $heat_activities, $heat_color;

$DOC_ROOT = $_SERVER['DOCUMENT_ROOT']."/";

$heat_activities = ['all',
    'run',
    'ride',
    'winter',
    'water'][0];

$heat_color =   ['hot',
    'bluered',
    'purple',
    'blue',
    'gray'][2];

global $p;

$p = (object)[];

$default_p = ['x'=> '9901' ,
    'y'=> '5132'  ,
    'z'=> '14',
    'watermark'=> 0 ,
    'heat_activities_type' => 'all',
    'heat_color' => 'hot',
    'hist' => date('Y-m'),
    'CloudFront-Signature' => '',
    'CloudFront-Key-Pair-Id' => '',
    'CloudFront-Policy' => ''
];

//print("<pre>".print_r($_REQUEST,1)."</pre>");

foreach($default_p as $k=>$v)
{
    $p->$k =
        isset($_GET[$k]) ? $_GET[$k] : $v ;
}
           //https://heatmap-external-a.strava.com/tiles-auth/$heat_activities_type/$heat_color
$img_url  = "https://heatmap-external-a.strava.com/tiles-auth/all/hot/$p->z/$p->x/$p->y.png?px=256".
            "&Signature=".$p->{'CloudFront-Signature'}.
            "&Key-Pair-Id=".$p->{'CloudFront-Key-Pair-Id'}.
            "&Policy=".$p->{'CloudFront-Policy'};
print ("</br>".$img_url);

$image = new Imagick($img_url);
echo $image;

?>
