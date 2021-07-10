<?php

$time_start = $time_lap = microtime(true);

global $ranges;
$ranges=array(
    '0rgb(200,  0,  0)' => 60 * 30,
    '1rgb(255, 90, 20)' => 3600 * 1,
    '2rgb(250,225, 10)' => 3600 * 12,
    '3rgb(100,230, 10)' => 3600 * 24 * 1,
    '4rgb( 30,180, 15)' => 3600 * 24 * 2,
    '5rgb( 80,190,155)' => 3600 * 24 * 7,
    '6rgb( 80,180,230)' => 3600 * 24 * 14,
    '7rgb( 100,120,230)' => 3600 * 24 * 21,
    '8rgb( 170,190,210)' => 3600 * 24 * 30,
    '9rgb( 210,220,230)' => 3600 * 24 * 365);


$sql_create_gpx_point = "CREATE TABLE `gpx`.`gpx_points` ( 
`gpx_id` INT NOT NULL , 
`name` VARCHAR(128) NOT NULL , 
`description` TEXT NOT NULL , 
`lat` VARCHAR(32) NOT NULL , 
`lng` VARCHAR(32) NOT NULL , 
`data` TEXT NOT NULL , 
`set_id` INT NOT NULL , 
UNIQUE `gpx_id_unique` (`gpx_id`)) ENGINE = InnoDB CHARSET=utf8 COLLATE utf8_bin;";

$sql_create_gpx_set = "CREATE TABLE `gpx`.`gpx_set` ( 
`set_id` INT NOT NULL , 
`set_name` VARCHAR(128) NOT NULL , 
`set_description` TEXT NOT NULL , 
`set_type` INT NOT NULL , 
`set_prop` TEXT NOT NULL , 
`user_id` INT NOT NULL , UNIQUE `set_id_unique` (`set_id`)) ENGINE = InnoDB;";


// 2020-06-22 get strava auth from 


function apify()
{
    $filename = 'data/apify.dat';
    
    $data_arr = array();

    $now = new DateTime();


    if (file_exists($filename ))
      {  
        $file_data = file_get_contents($filename);
        $data = json_decode($file_data);
        
        $mod_date = date("Y-m-d H:i:s", filemtime($filename));
    //          print($mod_date."<br />"); 
        $last_modified = new DateTime($mod_date );
        $interval = $now ->diff($last_modified );
        $diff = $now->getTimestamp() - $last_modified->getTimestamp();
      }
      
//      print ($diff);
      
      if ($diff > 3*24*3600)
//      if (1)
      {  

        $api = "https://api.apify.com/v2/key-value-stores/sDIt3nY626MkMDeLd/records/OUTPUT?disableRedirect=1";
        $api = "https://api.apify.com/v2/acts/sdsp256~stravaauth/runs/last/dataset/items?token=7mnSuF3Wpv2jKZJ6NX2WX2P9R";
        $api = "https://api.apify.com/v2/datasets/YgnKy2iWiM9geSnCt/items?format=json&clean=1";
        $api = "https://api.apify.com/v2/datasets/L9eJ1I3N1TglXD6ot/items?format=json&clean=1";
        $api = "https://api.apify.com/v2/actor-tasks/sdsp256~my-task-6/run-sync?token=7mnSuF3Wpv2jKZJ6NX2WX2P9R";
                        
        $ch = curl_init($api); // such as http://example.com/example.xml

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        
        $api_cookie = curl_exec($ch);
        
        print ("80: api_cookie=".$api_cookie );
        
        try
        { 
//            $api_cookie_arr = json_decode ($api_cookie)[0];
            $api_cookie_arr = json_decode ($api_cookie);
            
        }
        catch (Exception $e) 
        {
            echo 'Выброшено исключение: ',  $e->getMessage(), "\n";
        }

        $dt = $now->format('Y-m-d H:i:s');

        $data->$dt = $api_cookie_arr;
        
        $data = (array) $data;

        krsort($data);

        file_put_contents($filename, json_encode ($data, JSON_PRETTY_PRINT) );
        
        curl_close($ch);
          
        }
    
    $res = reset($data);
    return $res; 
}


function secondsToTime($seconds)
{
    $dtF = new DateTime('@0');
    $dtT = new DateTime("@$seconds");

    $d = $dtF->diff($dtT)->format('%a');
    $h = $dtF->diff($dtT)->format('%h');
    $i = $dtF->diff($dtT)->format('%i');

    $d = ($d) ? $d . "дн. " : "";
    $h = ($h) ? $h . "ч. " : "";
    $i = ($i) ? $i . "мин. " : "";

    return $d . $h . $i;
}


function jq_header()
{
    echo '<html>
<head>                                                               

    <link href="gpx.css" rel="stylesheet" type="text/css" />
    <script src="https://code.jquery.com/jquery-1.12.4.js"></script>
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <script type="text/javascript" src="js/cookie/jquery.cookie.js"></script>
<!--    <script type="text/javascript" src="js/google_sheets_api.js"></script> -->
<!-- chart and elevation 
    <script type="text/javascript" src="https://www.google.com/jsapi"></script>
    <script src="https://www.google.com/uds/?file=visualization&amp;v=1&amp;packages=columnchart" type="text/javascript"></script>
-->     
    <script src="js/gpx.js"></script> 
</head>';
}


class gpxSQL extends MySQLi
{
    public function newGpxSetDB($set_data) // 2020-08-06 Добавление нового набора 
    {
        $res = [];
        
        $debug = 0;
        
        if ($debug){
            print "newGpxSetDB:<br />";
            print_r($set_data);
        }
        
        
        $set_name = $set_data['name'];
        $set_type = $set_data['set_type'];

        $sql = "update `gpx_set` set ord = ord+1;";
        
        if ($result = $this->query($sql)) {}
        else echo "***** Ошибка SQL $sql:\n (" . $this->errno . ") " . $this->error;

        $sql = "insert into `gpx_set` (set_name,set_type,ord) values ('$set_name','$set_type',0)";
        
        if (!$debug)
        {
            if ($result = $this->query($sql)) {}
            else echo "***** Ошибка SQL $sql:\n (" . $this->errno . ") " . $this->error;
        }
        else echo "Debug SQL:\n$sql \n";


//        echo "@@ addGpxSetDB = ".print_r($sql,1);

//            $sql_res = sprintf("@@ *** res = $result <br />\n: %d\n ", $this->affected_rows);
//            print ($sql_res);
            
/*            $result->free();
            print ($sql_res); 
            while ($o = $result->fetch_object()) 
            {
                $res[] =  $o;
            }
            $id = mysqli_insert_id($link);
            $sql .= "insert into `gpx_points` (name,description,lat,lng,prop,set_id) values 
                ('Дом', '','55.644784','37.496969','',)";
*/
        
        
        
        if ($result = $this->query("select max(set_id) as max from `gpx_set`"))
            while ($o = $result->fetch_object()) $set_id = $o->max;
        else echo "***** Ошибка SQL:\n (" . $this->errno . ") " . $this->error ."<br />";    
        

        if ($result = $this->query("select max(gpx_id) as max from `gpx_points`"))
            while ($o = $result->fetch_object()) $max_gpx_id = $o->max;
        else echo "***** Ошибка SQL:\n (" . $this->errno . ") " . $this->error ."<br />";    
        
//        list($lat, $lng) = array('55.644784', '37.496969');
//        list($lat2, $lng2) = array('55.647', '37.50');
        list($lat, $lng) = $set_data['start'];
        list($lat2, $lng2) = $set_data['end'];
        
        $max_gpx_id2 = $max_gpx_id+1;

        $sql = "insert into `gpx_points` (name,ord,set_id,lat,lng) values 
        ('$set_name начало' ,0,$set_id,$lat, $lng),
        ('$set_name конец',0,$set_id,$lat2,$lng2)";
     
        if (!$debug)
        {
            if ( $result = $this->query($sql) ) {}
            else  echo "***** Ошибка SQL:\n (" . $this->errno . ") " . $this->error;
        }
        else print ("Debug SQL:\n$sql");

        return 1; 
    }
    
    public function getSetFromDB($sets="7,19") // 2020-02-21
    {

        $res = array(); $res_html = "";

        $points = $this->getPointFromDB();
        
        $points_tr = $points['tr']; 
        $points_data = $points['data'];
        $res_data = array();


        $sql = "SELECT *, 
                        (SELECT COUNT(*) FROM `gpx_points` WHERE `gpx_points`.set_id = `gpx_set`.set_id ) 
                        AS point_cnt FROM `gpx_set` order by ord asc";
        if ($result = $this->query($sql)) {
            $sql_res = sprintf("sql $sql \n: %d\n", $this->affected_rows);
            while ($o = $result->fetch_object()) {
                //                                    $max_cnt = max($o->cnt, $max_cnt);
                //                                    $res[$o->set_id] = array(
                //                                    "set_id"=>$o->set_id,
                //                                    "set_name"=>$o->set_name,
                //                                    "set_prop"=>$o->set_prop,
                //                                    "set_type"=>$o->set_type,
                //                                    "ord"=>$o->ord,
                //                                    "set_description"=>$o->set_description);
                //
                //                                    $res_csv .= "<tr><td>".implode("\t",(array) $o)."\n";
 /*               $res_html .= "<div dataset set_id=$o->set_id>
                                  <table set_info>
                                        <tr>
                                        <td width=30px ><span set_show_hide class='ui-icon ui-icon-triangle-1-s'></span></td>
                                        <td width=30px >$o->ord</td>
                                        <td>[$o->set_id]</td>
                                        <td width=200px set_name >$o->set_name</td>
                                        <td><select set_type = '$o->set_type' >$opt</select></td>
                                        <td set_cnt>$o->point_cnt</td>
                                        </tr>
                                    </table>
                                    <div set_points></div>
                                </div>";
*/              
                
                $opts = [];
                $opts_arr = array(0=>"Путь",1=>"Точки");
                $opt ='';
                
                
                foreach ($opts_arr as  $k=>$v)
                {
                    $opt .= "<option id=$k  class='option_$k'  ".(($k == $o->set_type )?"selected":"")." >$v</option>";    
                } 
                

                $res_html .= "<div dataset set_id=$o->set_id set_type='$o->set_type' >
                                  <table set_info class=tab>
                                        <tr>
                                        <td width=30px ><span set_show_hide class='ui-icon ui-icon-triangle-1-s'></span></td>
                                        <td width=400px title = 'ID: $o->set_id \nord: $o->ord' >
                                            <span set_id = '$o->set_id'  contenteditable>$o->set_name</span>
                                            <a path_length></a></td>
                                        <td>
                                        <select class='option_$o->set_type' set_type = '$o->set_type' >$opt</select>
                                        </td>
                                        <td set_cnt>$o->point_cnt</td>
                                        </tr>
                                    </table>
                                    <div set_points></div>
                                </div>";
                
                $res_html .= (isset($points_tr[$o->set_id]))?$points_tr[$o->set_id]:"";                                    
                $res_data[$o->set_id] = $o;
                if (isset($points_data[$o->set_id]))
                {
                $res_data[$o->set_id]->points = $points_data[$o->set_id];
                }
            }
           
//        print_r ($res_data);
           
            // 	1	set_id
            //	2	set_name
            //	3	set_description
            //	4	set_type
            //	5	set_prop
            //	6	user_id
            //	7	ord

            $res_json = array('data'=>$res_data, 'html'=>$res_html);


        } else
            echo "***** Ошибка SQL $sql:\n (" . $this->errno . ") " . $this->error;

        return json_encode($res_json);
    }
    
    
    
    
    

    public function getPointFromDB($sets = "7,19") // 2020-02-21
    {

        $res = array();
        $tr = array();
        
        $whe = "where set_id in ($sets)";
        $whe = "";
        
        $sql = "select * from gpx_points $whe order by ord asc";

        if ($result = $this->query($sql)) {
            $sql_res = sprintf("sql $sql \n: %d\n", $this->affected_rows);
            while ($o = $result->fetch_object()) {
                /*                                    $max_cnt = max($o->cnt, $max_cnt);
                $res[$o->set_id] = array(
                "gpx_id"=>$o->gpx_id,
                "name"=>$o->name,
                "description"=>$o->description,
                "lat"=>$o->lat,
                "lng"=>$o->lng,
                "ord"=>$o->ord);
                */
                //                                    $res_csv .= implode("\t",(array) $o)."\n";
//                print_r($o);
                
                $tr[$o->set_id][] = "<tr title = '$o->gpx_id' point_id=$o->gpx_id>
                <td ><input type=checkbox></td>
                <td >$o->ord</td>
                <td ed>$o->name</td>
                <td ed>$o->description</td>
                <td>$o->lat</td>
                <td>$o->lng</td>
                </tr>";
                
                
                $points[$o->set_id][] = $o;
//                $tr[$o->set_id][] = "<tr><td>" . implode("</td><td>", (array )$o) . "</td></tr>";
            }
            
            
            foreach(array_keys($tr) as $set_id) 
                {
                $res[$set_id] = "<table class='hide' points_table set_id=$set_id>
                <tr><td>
                    <input type=checkbox id='all' set_id=$set_id></td>
                <td colspan=3>весь набор</td></tr>
                ".implode("",$tr[$set_id])."</table>";
                }

//            print_r ($res);
            /* 	1	gpx_id
            2	name
            3	description
            4	lat
            5	lng
            6	user_id
            7	ord
            */
        } else
            echo "Ошибка SQL $sql:\n (" . $this->errno . ") " . $this->error;

        return array('tr'=>$res,'data'=>$points);
    }

    public function saveGlobGpxDB($glob_gpx_json) // 2020-02-20
    {
        $sets = array();
        $points = array();
        $glob_gpx = json_decode($glob_gpx_json, true);
        
//        print_r ($glob_gpx );

        //          print ("glob_gpx ='%s'".print_r($glob_gpx,1));
        $cnt = 0;

        foreach ($glob_gpx as $k => $v) {
            $sets[] = "('".$v['set_id']."','".
                          $v['set_name']."','". 
                          $v['set_type']."','".
                          $v['ord'].
                          "')";

            $pcnt = 0;

            foreach ($v["points"] as $kk => $vv) {

/*(set_id, `name`,`description`,`lat`,`lng`,`ord`)

[ord] => 0
                            [gpx_id] => 17
                            [name] => ЙВП, Сокольники
                            [description] => 
                            [lat] => 55.7962599
                            [lng] => 37.6780104
                            [prop] => 
                            [set_id] => 1
*/                            

                $points[] = "('".$v['set_id']."','"
                                .$vv['name']."','" 
                                .$vv['description']."','"
                                .$vv['lat']."','"
                                .$vv['lng']."','"
                                .$vv['ord']."')";
                $pcnt++;
                /*    [ ] => 0
                [] => 
                [name] => Китай город
                [description] => метро Китай Город 
                [lat] => 55.7544
                [lng] => 37.6366
                [dist] => 13.22
                [color] => #ffdd88
                [Расстояния] => 0
                [Название станции] => Юго-западная
                */
                //                print ("k=$k, v=".print_r($vv['name'],1)."\n");

            }
            $cnt++;
        }

        /*          if (
        //                !$gsql->query("DROP TABLE IF EXISTS strava_cache") ||
        //                !$gsql->query($sql_create_tab) ||
        $result = $this->query($sql_set_insert)) {
        printf("Затронутые строки (INSERT): %d\n", $this->affected_rows); 
        }
        else  echo "Ошибка SQL: (" . $this->errno . ") " . $this->error;
        */

        $sql = '';
//        $sql .= "TRUNCATE gpx_set; 
        $sql .= "TRUNCATE gpx_points;";
        $sql .= "TRUNCATE gpx_set;";
        $sql .= "INSERT INTO gpx_set (set_id, `set_name`,`set_type`,ord) VALUES " .
            implode(",\n", $sets) .
            " ON DUPLICATE KEY UPDATE set_type = values(set_type), set_name = values(set_name);";
        $sql .=  "INSERT INTO gpx_points (set_id, `name`,`description`,`lat`,`lng`,`ord`) VALUES " .
            implode(",\n", $points).";";

        if ($result = $this->multi_query($sql)) {
            printf("sql $sql \neffected  %d\n", $this->affected_rows);
        } else
            printf("else sql $sql \n %d\n", $this->affected_rows);
        {
//            echo "Ошибка SQL $sql \n (" . $this->errno . ") " . $this->error;
            $sql  = '';            


        /*          if ( $result = $this->multi_query($sql_points_insert)) {
        printf("sql $sql_points_insert \n: %d\n", $this->affected_rows); 
        }
        else  echo "Ошибка SQL $sql_points_insert \n: (" . $this->errno . ") " . $this->error;
        */

    }
    }

    public function groupsIntervals($ranges)
    {
        $case_groups = "";
        $ov = 0;
        $max_cnt = 0;

        foreach ($ranges as $k => $v) {
            $case_groups .= " when (UNIX_TIMESTAMP()-d) between $ov and $v then '$k'";
            $ov = $v + 1;
        }


        $sz = count($ranges) + 1;

        $sql_select_group = "select count(*) as cnt, sum(t.s) as s, t.z as z, t.rng as rng from 
        (select z, s, d, case    
            $case_groups   
            else 'more'   
            end as rng  
          from strava_cache) t where (UNIX_TIMESTAMP()-d) < $ov
        group by t.z, t.rng  
        ORDER BY t.z, t.rng ASC";

        //        print "case_groups = ".$sql_select_group;

        $res = array();
        if (1 && //    !$mysqli->query("DROP TABLE IF EXISTS strava_cache") ||
            //    !$mysqli->query($sql_create_tab) ||
        $result = $this->query($sql_select_group)) {
            while ($o = $result->fetch_object()) {
                $max_cnt = max($o->cnt, $max_cnt);
                $res[$o->z][$o->rng]['cnt'] = $o->cnt;
                $res[$o->z][$o->rng]['s'] = $o->s;
            }
            ;

        } else {
            $err = "Не удалось создать таблицу: (" . $this->errno . ") " . $this->error;
        }

        //        echo "<br />*** ".$line." ***<br />";
        //        print_r ($res);
        return array('res' => $res, 'max_cnt' => $max_cnt);
    }


    public function getCacheList($z, $x, $y, $depth)
    {

        $res = array();
        $max_x = $x + pow(2, $depth);
        $max_y = $y + pow(2, $depth);
        $z = $z;

        $q = "select * from strava_cache where 
                    z = $z and  
                    x >= $x and  
                    x <= $max_x  and  
                    y >= $y and  
                    y <= $max_y  
                    ";

        //        print ("@@ *** q=".$z.",".$depth."\n".$q."\n");

        if (1 && $result = $this->query($q)) {
            while ($o = $result->fetch_object()) {
                //                $res[$o->z][$o->x][$o->y]['d'] = $o->d;
                //                $res[$o->z][$o->x][$o->y]['s'] = $o->s;
                //                $res[$o->x][$o->y]['d'] = $o->d;
                //                $res[$o->x][$o->y]['s'] = $o->s;
                $res[$o->x][] = (int)$o->y;
            }
            ;

        } else
            $err = "Не удалось выполнить запрос: (" . $this->errno . ") " . $this->error;


        //        echo "\n******* res=\n ".print_r ($res,1);
        return $res;
    }
}


function getTile($zoom, $lat, $lon)
{

    $tile['x'] = floor((($lon + 180) / 360) * pow(2, $zoom));
    $tile['y'] = floor((1 - log(tan(deg2rad($lat)) + 1 / cos(deg2rad($lat))) / pi()) /
        2 * pow(2, $zoom));
    return $tile;
}


function getLatLngFromZXY($z, $x, $y)
{
    $n = pow(2.0, $z);
    $res['lng'] = $x / $n * 360.0 - 180.0;
    $lat_rad = atan(sinh(pi() * (1 - 2 * $y / $n)));
    $res['lat'] = 180.0 * ($lat_rad / pi());
    return $res;
}

function getLatLng($x, $y)
{
    $res['lat'] = (2 * atan(exp(($y - 128) / -(256 / (2 * pi())))) - pi() / 2) / (pi
        () / 180);
    $res['lng'] = ($x - 128) / (256 / 360);
    return $res;
}

global $gsql;
$gsql = new gpxSQL("localhost", "u1371051_gpx", "9jEig00&", "u1371051_gpx");

$gsql->set_charset('utf8mb4');

/* проверка соединения */
if ($gsql->connect_errno) {
    printf("Не удалось подключиться: %s\n", $gsql->connect_error);
    exit();
}


$tm_on = 1;

function tm($s = '', $is_str = 0)
{
    global $time_start, $time_lap, $tm_on;

    $t = microtime(true);
    $res = $t;

    if ($s == '') {
        $time_lap = $time_start = microtime(true);
        return;
    } else {
        $res = sprintf("<sup><a class=red>+%0.4f</a> %0.3f %s <a class=blue>%s</a></sup><br/>",
            ($t - $time_lap), ($t - $time_start), date('M-d H:i:s', time()), $s);

        $res2 = sprintf("+%0.4f %0.3f %s %s\n", ($t - $time_lap), ($t - $time_start),
            date('M-d H:i:s', time()), $s);

    }

    $time_lap = $t;

    if ($is_str || !$tm_on)
        return $res2;
    else
        echo $res;
}

function gpx_cache_scan()
{

    $res = array();
    $cmd = array('total_cnt' =>
            "find ./img_cache/ -type f -exec ls -l --time-style=+%s {} + | wc -l",
            'total_size_with_dir' => "du -s -B1 ./img_cache/ | awk '{ print $1 }'");

    foreach ($cmd as $k => $v) {
        $io = popen($v, 'r');
        if ($io) {
            while (($line = fgets($io, 200)) !== false)
                $res[$k][] = $line;
            fclose($io);
        } else {
            print ("error opening the file.");
        }
    }

    return $res;
}


?>