<?php
//phpinfo();
// обработчик данных
//header('Content-type: text/html; charset=utf-8');

include_once "gpx.lib.php";

error_reporting(E_ALL);
ini_set("display_errors", 1);
///print_r ($_REQUEST);

$data =  json_decode("{data:'test'}");


if (isset ($_REQUEST["new_gpx_set"]))
    {
    $data =  $_REQUEST["new_gpx_set"];
    header('Content-Type: application/json; charset=utf-8');
    print $gsql->newGpxSetDB($data);
    }



if (isset ($_REQUEST["save_json"]))
    {
    $data =  $_REQUEST["save_json"];

        $myFile = "data/gpx.json";
        $fh = fopen($myFile, 'w') or die("can't open file");
        $stringData = $data;
        fwrite($fh, $stringData);
        fclose($fh);
        print ( "\n<br />filesize=".filesize ($myFile));
    }

     
if (isset ($_REQUEST["save_db"]))
    {
    tm();
    $data =  $_REQUEST["save_db"];
    $gsql->saveGlobGpxDB($data);
    print ( "\n<br />filesize=");
    tm('>>>');
    }

if (isset ($_REQUEST["save_sql"]))
    {
    tm();
    $data =  $_REQUEST["save_sql"];
//    print_r ($data); 
    $gsql->saveGlobGpxDB($data); 
    print ( "\n<br />filesize=");
    tm('>>>');
    }

if (isset ($_REQUEST["get_gpx_set_DB"]) )    {

    header('Content-Type: application/json');
//    print "{sss1:'www'}\n";

    print $gsql->getSetFromDB();

    }

if (isset ($_REQUEST["get_points_by_set_id_DB"]))    { 

    $set_ids = $_REQUEST["get_points_by_set_DB"];
    header('Content-Type: application/json');
    print $gsql->$this->getPointFromDB($set_ids);
    }    



if (isset ($_REQUEST["get_cache_stat"]))
    {   
        $depth = isset($_REQUEST["depth"]) ? $_REQUEST["depth"] : 10;

        switch ($_REQUEST["get_cache_stat"])
        {
          case 'min': $int = 60*6; break;   
          case 'h': $int = 3600; break;   
          case 'd': $int = 3600*24; break;   
          case 'w': $int = 3600*24*7 ; break;   
          case 'm': $int = 3600*24*30 ; break;
          default:  $int = 360;  
        }
        
        $rng = array();
        for ( $i = 0; $i < $depth; $i++ )
        {
            $rng [$i."rgb(200, 200, 200)"] = $i*$int;
        } 
        
//        print_r ($rng);
//        print (", ".$int.", ".$depth."\n");
        
        $cache_group_int  = $gsql->groupsIntervals($rng);
        
//        print_r ($cache_group_int);
        $res = array (
                'colors'=>$ranges,
                'ranges'=>$rng,
                'groups'=>$cache_group_int['res'],
                'max_cnt'=>$cache_group_int['max_cnt'] 
                );
                
        print (json_encode( $res));
        
    }

if (isset ($_REQUEST["get_cache_list"]))
    {   
//       print_r ($_REQUEST);
        
        $tiles = array();
        
        $z = isset($_REQUEST["z"]) ? $_REQUEST["z"] : 9;
        $x = isset($_REQUEST["x"]) ? $_REQUEST["x"] : 342;
        $y = isset($_REQUEST["y"]) ? $_REQUEST["y"] : 161;
        $lat = isset($_REQUEST["lat"]) ? $_REQUEST["lat"] : 55.45;
        $lng = isset($_REQUEST["lng"]) ? $_REQUEST["lng"] : 37.65;
        $depth = isset($_REQUEST["z_depth"]) ? $_REQUEST["z_depth"] : 2;

        $t = getTile($z,$lat,$lng);
        $int_latlng = getLatLngFromZXY($z, $t["x"], $t["y"]);
        
//        for ($zoom = $z;  $zoom <= ($z+$depth) ; $zoom++)
        for ($zoom = $z;  $zoom <= 16 ; $zoom++)
        {

           $t = getTile($zoom,$int_latlng['lat'],$int_latlng['lng']);
//           print ("\n***\n".$zoom."\n".print_r($t,1)); 

           
           $tiles[$zoom]  = $gsql->getCacheList( $zoom, $t["x"], $t["y"], $zoom - $z);
        }
        

//        print_r ($cache_group_int);
        $res = array (
                'colors'=>'red',
                'groups'=>1,
                'tiles'=> $tiles,
                'x'=>$x,
                'y'=>$y
                );
                
        print (json_encode( $res));
        
    }


// ****** ���������� *****

function isJson($string) {
   
 json_decode($string);
 
 print ("<br />isJson=, "
    .json_decode($string)
    ." json_last_error= "
    .json_last_error()
    ." <br />");
 
 return (json_last_error() == JSON_ERROR_NONE);
}

?>