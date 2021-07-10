<?php 
include_once 'gpx.lib.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$now = time();  
$var = array();
$tm_on = (isset($_GET['tm']))?1:0;


//print_r($_GET);

jq_header(); 

?>

<style>
.cache td:nth-child(n+2):nth-child(-n+15){
    text-align: right;
 }

.cache td:nth-child(n+5):nth-child(-n+15){
    text-align: right;
    padding: 0px 5px 0px 0px;
 }

 

 
.cache td               { font-size:12px; }

.cache tr:nth-child(1) td:nth-child(n+5):nth-child(-n+15)   { font-size:8px; }

.cache tr:nth-child(2n) { background-color:whitesmoke; }

.cache tr:nth-child(1),
.cache tr:last-child {
    background-color:lightgray;
    font-weight:bold;
 }

.cache tr:nth-child(1) td{ padding:3px; }


.cache div 
{
    display:inline-block;
    height:15px;
}

.cache td:nth-child(n+2):nth-child(-n+4) div{
    display:inline-block; 
    background-color:lightgray;
    height:5px; 
 }
 
</style>
<a href='?update=1' >update du</a>

<?php



$total_inter_cnt = array();

$styles = "";


foreach($ranges as $kk=> $vv)
 { 
    $total_inter_cnt[$kk] = 0;
    $styles .= " td.total_cnt_interval:nth-child(".(substr($kk,0,1)+5).") { background-color:".substr($kk,1)." !important; }";    
//    $styles2 .= " td.total_cnt_div div:nth-child(".(substr($kk,0,1)+4).") { background-color:".substr($kk,1)." !important; }";    
 }   

echo "<style>$styles </style>";  

 tm();


$sql_res = $gsql->groupsIntervals($ranges);
$sql_bars = $sql_res['res'];

function groupsIntervalsFiles($ranges)
{

global $gsql;

$c_day_cnt = array();
$cache_files = array();
$bar = array();

$du_size = ""; // размер подпапок 

// find . -mmin -120 -type f  -exec ls -la {} + | awk '{s+=$5} END {print "Total SIZE: " s}'
// $io = popen ( "cd ./img_cache/all/hot/; find . -mmin -120 -type f -exec ls -l {} + | awk '{ print $5, $6 , $7, $8, $9 }'", 'r' );

$io = popen ( "cd ./img_cache/all/hot/; find . -type f -exec ls -l --time-style=+%s {} + | awk '{ print $5\"/\"$6\"/\"$7 }'", 'r' );

tm("01. get find");

//print ("io=".$io);

$total_size = 0;
$total_cnt = 0;
$inserts = "";

if ($io) {
    while (($line = fgets($io, 200)) !== false) {
//        $du_size .= "".str_replace("\t./img_cache/","-",$line);
        $p = explode('/',$line);
//        print ("<pre>".$line." ".print_r($p,1)."</pre>");
//        print ("".$line."\n<br />");
        $total_cnt++;
        $total_size = $total_size + $p[0];
        $s = $p[0]; // размер файла 
        $t = $p[1]; // время
        $dt = "'".gmdate("Y-m-d H:i:s", $p[1])."'"; //date time
        $z = $p[3]; // zoom
        $x = $p[4]; // x
        $y = substr($p[5],0,strlen($p[5])-5); // y
        $total_size_zoom[$z] = (isset($total_size_zoom[$z]))?$total_size_zoom[$z]+$s:$s;
        
        $delt = time()-$p[1];
        $d_c = d_color($delt);
        
        if ( isset($bar[$z][$d_c] ))
        {
        $bar[$z][$d_c] = array(
                   'cnt' => $bar[$z][$d_c]['cnt']+1,  
                   'size' => $bar[$z][$d_c]['size'] +$s
                   );
        }
        else
        {
            $bar[$z][$d_c] = array('cnt' => 1,'size' => $s);
        } 

        $inserts .= ",($z,$x,$y,$s,$t,$dt)";
        
    
        }
    fclose($io);
    } 
    else 
    {
    // error opening the file.
    } 

    if (1)  // refresh gpx from files 
    {
        $sql_insert = "INSERT INTO strava_cache (z,x,y,s,d,date_time) VALUES ".substr($inserts,1);
        
        $sql_create_tab ="CREATE TABLE `strava_cache` (
         `z` int(11) NOT NULL,
         `x` int(11) NOT NULL,
         `y` int(11) NOT NULL,
         `s` int(11) NOT NULL,
         `d` int(11) NOT NULL,
         `date_time` varchar(32) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8";
        
//          print ($sql_create_tab."**** ".$_GET['update']." ***");
          if ( 
                !$gsql->query("DROP TABLE IF EXISTS strava_cache") ||
                !$gsql->query($sql_create_tab) ||
                !$gsql->query($sql_insert)) {
                echo "Не удалось создать таблицу: (" . $gsql->errno . ") " . $gsql->error;
                    }
                else printf("Затронутые строки (INSERT): %d\n", $gsql->affected_rows); 
                    
    }

//   echo "<br />$total_cnt<br /><pre>size=".($total_size)."<br />".print_r($total_size_zoom,1)."</pre>";
    
   return array('bar'=>$bar, 'total_size' => $total_size); 

} // >>> groupsIntervalsFiles



tm("02. create array");
//echo "<br />cache_files = <pre>".print_r($cache_files,1)."<br /></pre>";
tm("03. ksort");

$l = "";

if (isset($_GET['update'])) 
{   
    $res = groupsIntervalsFiles($ranges);
    print ("total_size=".$res['total_size']);
}

//ksort($bar);
//print_r ($bar);
//print_r ($sql_bars);

$total_cnt = $total_size = 0;

$c_cnt = array();
$c_size = array();

    foreach($ranges as $kk=>$vv)
    {
        $c_cnt[$kk]  = 0;
        $c_size[$kk] = 0;
    }    



foreach($sql_bars as $k => $v)
{
    $svg = $dv = $td = $tdh = "";
    ksort($v);
//tm("04. bar: $k");
    $r_cnt = $r_size = 0;
        
    foreach($ranges as $kk=>$vv)
    {   
//       print ("<br />".$kk."<br />");
//        print_r ($v);
        
        
        
        $tdh .= "<td>".secondsToTime($vv)."</td>";
        
        $clr = substr($kk, 1);

        if( isset ($v[$kk])) 
                {   
                    $c = $v[$kk]['cnt']; 
                    $s = $v[$kk]['s']; 
                    
                    $r_cnt += $c;
                    $r_size += $s;

                    $c_cnt[$kk]  += $c;
                    $c_size[$kk] += $s;
                    
                    $svg_r = pow($c,1/3)*2;
                    
                    $td .= "<td style='background-color:$clr; '>$c</td>";
                    $dv .= "<div style='background-color:$clr; width:".($c/50)."px;'></div>";
                    $svg .= "<td style='text-align:center;'>
                                <svg height='$svg_r' width='$svg_r'>
                                    <circle cx='".($svg_r/2)."' cy='".($svg_r/2)."' r='".($svg_r/2)."' 
                                    stroke='black' stroke-width='0' fill='$clr' />
                                </svg>
                             </td>";
                }
            else {
                    $td .= "<td ></td>";
                    $svg .= "<td ></td>";
                }
        
                
    } 
    
    $total_cnt += $r_cnt;
    $total_size += $r_size;
    $mean_size = $r_size/$r_cnt;


    $dv_cnt = "$r_cnt<br /><div title='$vv' style='width:".($r_cnt/200)." '></div>";

    $dv_size = floor($r_size/1024)."<br /><div title='$vv' style='margin: auto;  background-color:lightgray; 
                                      height:5px; width:".($r_size/5000000 )." '></div>";

    $dv_mean_size = floor($mean_size)."<br /><div title='$vv' style='margin: auto;  background-color:lightgray; 
                                      height:5px; width:".($mean_size/400 )." '></div>";

    $l .= "<tr>
                <td>$k</td>
                <td>$dv_cnt</td>
                <td>$dv_size</td>
                <td>$dv_mean_size</td>
                $td 
                <td>$k</td>
                <td>$dv</td>
                <td class=by_int>$k</td>
            </tr>";
    
}  //             >>> foreach($sql_bars as $k => $v)

$dv = "<div title='$vv' style='font-size:15px; display:inline-block; background-color:$clr; height:19px; width:".($vv/3 )." '>".$vv."</div>";

ksort($c_cnt);

tm("04. gpx_cache_scan() start");

$cache_info = gpx_cache_scan();

tm("04. gpx_cache_scan() end");


$total_du = isset($cache_info['total_size_with_dir'][0])? isset($cache_info['total_size_with_dir'][0]) : "";
$total_cwd = isset($cache_info['total_cnt'][0]) ? $cache_info['total_cnt'][0] : "";

tm("05. echo table");


$dvt = "";

foreach($c_cnt as $k=>$v)
{
    $dvt  .= "<div style='width:".($v/300)."px; background-color:".substr($k,1)."'></div>";
}

echo "
<table class='stab cache'>
<tr><td>№</td>
    <td>Кол-во</td>
    <td>Размер</td>
    <td>Ср. размер</td>
    $tdh
    <td>Z</td>
    <td>Диаграмма</td>
    <td>
         <button id='min' class='sign'  onclick='getCacheStat(\"min\");'>Мин</button>
         <button id='hour' class='sign'  onclick='getCacheStat(\"h\");'>Час</button>
         <button id='day' class='sign'  onclick='getCacheStat(\"d\");'>День</button>
         <button id='week' class='sign'  onclick='getCacheStat(\"w\");'>Неделя</button>
         <button id='month' class='sign'  onclick='getCacheStat(\"m\");'>Месяц</button>
    </td>
</tr>
$l
<tr><td>Total</td>
    <td>$total_cnt<br />$total_cwd</td>
    <td>".floor($total_size)."<br />$total_du<br />".floor( 100 * $total_du/$total_size )."</td>
    <td>".floor($total_size/$total_cnt)."</td>
    <td class='total_cnt_interval'>".implode("</td><td class='total_cnt_interval'>",array_values( $c_cnt))."</td>
    <td></td>
    <td class='total_cnt_div'>$dvt</td>
</tr>
</table>";


tm("06. >>>>");

function cmp($a1, $b1) {
    
    $a = str_replace('./img_cache/','', $a1 ); 
    $b = str_replace('./img_cache/','', $b1 ); 
    
    if ($a < $b) {
        return -1;
    } else if ($a > $b) {
        return 1;
    } else {
        return 0;
    }
}

function d_color($t)
{     
      global $ranges;
      foreach ($ranges as $k=>$v) if  ($t < $v) return $k;
      return $ranges[7];
}

tm("7. inserts end >>>>");

/* Создание таблицы не возвращает результирующего набора */
//if ($mysqli->query("CREATE TEMPORARY TABLE myCity LIKE City") === TRUE) {
//    printf("Таблица myCity успешно создана.\n");
//}

?>

<!-- <img src = "http://msp.opendatahub.ru/gpx/strava.php?z=14&x=9894&y=5128"/> --> 
</html>
<script>
$(document).ready( function(){ getCacheStat("d"); }
);

</script>