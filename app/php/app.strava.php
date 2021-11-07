<?php

// https://my.apify.com/actors/9rJZagTpspnLsgeX6#/source   получить Policy и $Signature


include_once $_SERVER['DOCUMENT_ROOT'].'/app/php/gpx.lib.php';

error_reporting(E_ALL);
ini_set("display_errors", 1);

/* 2020-04-10
{ "email": "sdsp256@gmail.com" , "password": "652@163Ava" }


//header('Content-type: image/jpeg');
https://heatmap-external-{switch:a,b,c}.strava.com/tiles-auth/running/bluered/{0}/{1}/{3}.png?px=256&Key-Pair-Id={ID}&Signature={Sig}&Policy={P}
Где:
{0} = zoom
{1} = x*
{2} = y*
{ID} = CloudFront-Key-Pair-Id
{Sig} = CloudFront-Signature
{P} = CloudFront-Policy

//$img = 'https://anygis.ru/api/v1/Tracks_Strava_Ride/13/4950/2566.png?px=256';
//$img_static = 'https://heatmap-external-a.strava.com/tiles-auth/all/hot/14/9901/5132.png?px=256&Signature=dHHhv0RrKOD4J3zmNy31LWJBNoq-eDHqmoy3UWKyvbPc0lWF2CVQO3QnDkW4Mk8MSrIP5C4~bFdhw-ZM7ujk2iaA9UXRlT7nLK0yzjQLTi99VOf-ToFaisg4lmPqfKlbVYoRo6~cSdlZWj5RzMykoxziSsFhY5V4sAdVWQxz732IilR~ROky5h4FTEUIJisCyVQUpuC0fLVehIdteE0Zt9TtN7GKFbNieSkDFm-PibtqTPIoMEeJd1MlYcdnLIzQUSeMPVBNogXv-oZ3yeXMmuJMJTmDdzBJlar-~nAf~HyggeyI92V2WedGa-jgl3DijXHxsiH79rwnNWtSnjiH6Q__&Key-Pair-Id=APKAIDPUN4QMG7VUQPSA&Policy=eyJTdGF0ZW1lbnQiOiBbeyJSZXNvdXJjZSI6Imh0dHBzOi8vaGVhdG1hcC1leHRlcm5hbC0qLnN0cmF2YS5jb20vKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTU3ODkyNTQ1MX0sIkRhdGVHcmVhdGVyVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNTc3NzAxNDUxfX19XX0_';
*/

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
    'hist' => date('Y-m')
];



foreach($default_p as $k=>$v)
{
    $p->$k =
        isset($_GET[$k]) ? $_GET[$k] : $v ;
}


//print "<pre>".print_r ($p,1)."</pre>";

$cache_path = ['img_cache','img_cache_history']; //,'img_cache_history_thumb'];
$img_path =  $DOC_ROOT . "img_cache_history/$p->hist/$p->heat_activities_type/$p->heat_color/$p->z/$p->x/$p->y.png";


if (file_exists($img_path))  {
          $image = new Imagick($img_path);
    }
    else if ($p->hist != date('Y-m')) {
        $image = new Imagick($DOC_ROOT ."/img_cache_history/nomap.png");
    }
    else    {
        $watermark = "";

        $image = loadFromStrava($p->z, $p->x, $p->y, $p->heat_activities_type, $p->heat_color, $watermark);

        writeImage($img_path, $image);

        $img_path =  $DOC_ROOT . "img_cache_history/$p->hist/$p->heat_activities_type/$p->heat_color/$p->z/$p->x/$p->y.png";

        update_gpx($img_path); // записываем в базу

    }

echo $image;

/**
 *
 * Записываем в файл изображение из strava

 */


function writeImage($img_path, $image)
{
    $path_parts = pathinfo($img_path);

    if (!is_dir($path_parts['dirname'])) {  // ************ 2020 Create directory *****************
        mkdir($path_parts['dirname'],0777, true);
    }
    $image->writeImage($img_path);


}





function loadFromStrava($z,$x,$y,$heat_activities_type,$heat_color,$watermark=0)
{
    global $img_str, $img_cache_path, $watermark_img_str, $img_cache_path_history, $img_cache_path_history_thumb;


    $strava_url = "https://heatmap-external-a.strava.com/tiles-auth/$heat_activities_type/$heat_color";

    //11,1149,657
    // chrome://settings/cookies/detail?site=strava.com  искать после перехода по ссылке https://www.strava.com/heatmap#9.03/37.74883/55.67465/hot/all
    //описание авторизации https://developers.strava.com/docs/getting-started/#oauth
    //$img_url = "$strava_url/$z/$x/$y.png?px=256&$Signature&$Key";

    $Key_Pair_Id = "APKAIDPUN4QMG7VUQPSA";

    $ap = apify();

//    echo "ap=".print_r ($ap,1);
//    $Policy = "eyJTdGF0ZW1lbnQiOiBbeyJSZXNvdXJjZSI6Imh0dHBzOi8vaGVhdG1hcC1leHRlcm5hbC0qLnN0cmF2YS5jb20vKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTU5MzMzMzc5M30sIkRhdGVHcmVhdGVyVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNTkyMTA5NzkzfX19XX0_";
//    $Signature = "dUglMjwk2FIIOQC1G0zQMO~ZPhh7cbV-dVsdY5X331drD6Eu17AsElSLmo5040feYnNlG49hq9Mqy-o7iGobmMorNxJubxbCtqTeQDO7MOdgGY3gHxoXzt-z4MocjeeVLNUQGlpreVTGDabnFb97ZrF0Kfunk2~LXQKE5cAh1H6uNcBmEZR8xBNV9t9qXJglnbL7Yik9ojMNYUhlfHAMD2vYyhdJDSlNNEEFh0T9bkGx8EJrYsLJ6MEOmPaGd~ArbXQHt3Q2IG6-HAiJRGLU8ty6SYvXubVq8RjeJXZMqpqlRY2aLjAX7rlhWTIPtjgvJnT3Ud09xBtisKJQeSdGqw__";

    $Policy = $ap->{'CloudFront-Policy'};
    $Signature = $ap->{'CloudFront-Signature'};

//    $Signature = "My5Cctgax-eZiSPik8BYr~c79H-UXidiuutFfz9BulmYe0tH~wJnUEA0bFzkQN2Rlo91pN~Mn09JZm2XJfz6LhSJl2a8Az6D5qzoG5TrvFYeWUtzmSRm62~iiJTp7qrQi3ePdxzhRSafeju0F3SFMAMmWBcbZBIbVainHwaPuvNtSiy4FUTb1jIkexX6eXzMEoG1RFFw8Zcexqom3ODyZeGR4b3A7qrYsnZmRoS7PuIqnPnxpox4ZV3kAGIgXOYzsp6HPSft8KbpVnuz63ujReCinUToDdzyAWNH4854IAOw~0FGwga4EAjVUUhM2DuXhTjHz0vxq0bhMzjJUtpm~w__";

    /**
     * 2021-11  get file and make image
     */

    $img_url  = "$strava_url/$z/$x/$y.png?px=256&Signature=$Signature&Key-Pair-Id=$Key_Pair_Id&Policy=$Policy";
    $image = new Imagick($img_url);


//    $img_url = "$strava_url/$z/$x/$y.png?px=256";
//    $img = "https://anygis.ru/api/v1/Tracks_Strava_Ride/$x/$y/$z";   // c 2020-01-28 не работает

//    print ("<a href='".$img_url."'>$img_url</a>");

//    $check_paths = [$img_cache_path, $img_cache_path_history, $img_cache_path_history_thumb];
//
//    foreach ($check_paths as $path)    {
//        $path_parts = pathinfo($path);
//        if (!is_dir($path_parts['dirname'])) {  // ************ 2020 Create directory *****************
//            mkdir($path_parts['dirname'],0777, true);
//        }
//    }

    // записываем изображение из Strava
//    $image->writeImage($img_cache_path);
//    $image->writeImage($img_cache_path_history);
//
//    $image->resizeImage(32, 32,Imagick::FILTER_LANCZOS,1 ); // thumb
//    $image->writeImage($img_cache_path_history_thumb);


//    $watermark_img_str =  $watermark_img_str."{".$watermark."}date: ".tm('res',1)."\n".$update_res;
    $watermark_img_str =  $watermark_img_str."date: ".tm('res',1)."\n";


    $font = 'Helvetica';
    $watermark_text = new ImagickDraw();
    $watermark_text->setFillColor('blue');
    $watermark_text->setFont($font);
    $watermark_text->setFontSize(9);
    $watermark_text->setStrokeAntialias(true);
    $watermark_text->setStrokeColor('none');
    $watermark_text->setStrokeWidth(0);
    $watermark_text->setGravity(Imagick::GRAVITY_NORTHWEST);
    // Clone & set stroke attributes
    $watermark_outline = clone $watermark_text;
    $watermark_outline->setFillColor('none');
    $watermark_outline->setStrokeColor('rgba(255,255,255, 0.9)');
    $watermark_outline->setStrokeWidth(4);
    $watermark_outline->setStrokeAntialias(true);  //try with and without
    //$watermark_outline->setTextAntialias(true);  //try with and without
    // Set the text for both, and offset one to match stroke width
    $watermark_outline->annotation(0, 0, $watermark_img_str);
    $watermark_text->annotation(0, 0, $watermark_img_str."****");
    // Draw stroke, then text

    global $watermark;

    if ($watermark || 0)  // не используется в .get
    {
        $image->drawImage($watermark_outline);
        $image->drawImage($watermark_text);
    }


return $image;

}



function update_gpx($img_path)
{
    global $gsql;

    //  ./12/2305/1422.png

//    $command = "cd ./img_cache/; find ./$z/$x/$y.png -type f -exec ls -l --time-style=+%s {} + | awk '{ print $5\"/\"$6\"/\"$7 }'";
    $command = "find $img_path -type f -exec ls -l --time-style=+%s {} + | awk '{ print $5\"/\"$6\"/\"$7 }'";
    $io = popen ( $command , 'r' );

    if ($io) {
        while (($line = fgets($io, 200)) !== false) {
            //        $du_size .= "".str_replace("\t./img_cache/","-",$line);
            $p = explode('/',$line);

            $arr_length = count($p);

//            print ("<pre>".$line." ".print_r($p,1)."</pre>");
            $s = $p[0]; // размер файла
            $d = $p[1]; // время
            $z = $p[$arr_length-3]; // zoom
            $x = $p[$arr_length-2]; // x
            $y = substr($p[$arr_length-1],0,strlen($p[$arr_length-1])-5); // y
        }

        $sql_insert = "INSERT INTO strava_cache (z,x,y,s,d)  VALUES ($z,$x,$y,$s,$d)";

//        print ($sql_insert);

        $err="OK";

        if ( 0 &&
            //    !$mysqli->query("DROP TABLE IF EXISTS strava_cache") ||
            //    !$mysqli->query($sql_create _tab) ||
            !$gsql->query($sql_insert)
        ) {
            $err = "Не удалось создать таблицу: (" . $gsql->errno . ") " . $gsql->error;
        }

        return "sql_err=[".$err."]".$sql_insert;


        fclose($io);
    }
    else
    {
        // error opening the file.
    }
    //print (tm("01. get find",1)."$command<br /><pre>".$line."<br />******:".print_r($p,1)."</pre>");
}


?>
