<?php // content="text/plain; charset=utf-8"

//require_once ('jpgraph/jpgraph.php');
//require_once ('jpgraph/jpgraph_line.php');

require_once ('jpgraph/jpgraph-4.3.5/src/jpgraph.php');
require_once ('jpgraph/jpgraph-4.3.5/src/jpgraph_line.php');
require_once ('jpgraph/jpgraph-4.3.5/src/jpgraph_plotline.php');
require_once ('jpgraph/jpgraph-4.3.5/src/jpgraph_text.inc.php');

global $rolling_mean_depth;
global $data_depth; $data_depth = 84;
global $forecast_depth ; $forecast_depth = 2;

$rolling_mean_depth = 16;


$font_size = 11;
$label_margin = 3;
$axis_shift = 30;
$lw = [3,3,3,2,5,2];
$color = ['#cba',"#f24",'#4bf',"#ef7","#3fa", "#f5e" ];
$axcolor = ['#cba',"#f44",'#9df',"#ff9","#4fb", "#f5e"];
$metrics = ['temp','humidity','prec_prob','pressure_mm','wind_speed']; //,'prec_mm'];

$title_text = (new DateTime())->format("Y-m-d H:m:s");


$string = file_get_contents("cache_clock/json_yandex_weather_history.json");
$string = "{".substr($string, 0, -2)."}";
if ($string === false) {    } // deal with error...

$metric_json_data = json_decode($string, true);
if ($metric_json_data === null) {    print(')// deal with error...'); }

$metric_json_data = array_filter($metric_json_data, create_function('$value', 'return $value !== null;'));


// Setup the graph https://jpgraph.net/download/manuals/chunkhtml/ch14s06.html
$graph = new Graph(300,220);
$graph = new Graph(450,350);

$graph->ClearTheme();

//$graph->title->Set($title_text);
//$graph->SetBox(false);

$graph->SetMargin(25,120,20,10);

$graph->SetBackgroundGradient('black@0','black@0',BGRAD_FRAME);
//$graph->img->SetTransparent('black');


$p = [];
$m = [];
$dt_ticks = [];
$old_day = $old_indx ="@@@";

foreach ($metric_json_data as $k => $v) {
//    if ($k % 5 == 1) {

    $s = str_replace("T", " ", $v['now_dt']);
    $new_day = substr($s, 8, 2);
    $indx = substr($s, 8, 5);

    if ( $new_day === $old_day && $old_indx ===  $indx && false) {
        $s= substr($s, 11, 2);
    } else {
        $s = substr($s, 8, 5);
        $old_day = $new_day;
        $old_indx = $indx;
    }

//    $dt_ticks[$indx] = $s . " | ".($new_day == $old_day).' | '.$old_day.$new_day;

    $dt_ticks[$indx] = $s;

    $last_dt = substr($v['now_dt'], 11, 2) + 3;
}

$per1 = array_map( fn($v) => $dt_ticks[$v], $dt_ticks);

$per1 = array_slice (array_values($dt_ticks),
    count($dt_ticks)-$data_depth+6,
    $data_depth+6
);

$per2 = array_map( fn($v) => (($last_dt+3 + $v/2)%24), range(0,24));

$per = array_merge($per1,$per2);

//$log = print_r([$dt_ticks, $last_dt, $data_depth, $per1,$per2],1);
//$txt = new Text($log);
//$txt->SetFont(FF_ARIAL,FS_NORMAL,12);
////$txt->SetShadow();
//$txt->SetColor('red');
//$graph->Add($txt);



foreach ($metrics as $i => $mk) {

    $mjd_fact = array_slice($metric_json_data,  // $metric_json_data_fact
        count($metric_json_data)-$data_depth, $data_depth );

    $mjd_forecast = array_slice($metric_json_data,
        count($metric_json_data)-6*$forecast_depth, 6*$forecast_depth );

    if ($mk == 'prec_prob')
    {
//            $m[$mk] = array_fill(0, 6*$forecast_depth, null);

        $mjd_fact = array_slice($metric_json_data,  // $metric_json_data_fact
            count($metric_json_data)-$data_depth-6*$forecast_depth, $data_depth + 6*$forecast_depth );

        foreach ($mjd_fact  as $k => $v) {
            $m[$mk][] = $v['forecast']['parts'][$forecast_depth-1][$mk] * 1;
        }

    }
    else
    {
        foreach ($mjd_fact  as $k => $v)
            $m[$mk][] = $v['fact'][$mk];

        $mk_forecast = str_replace('temp','temp_avg',$mk); // for temp_avg in forecast

        foreach ($mjd_forecast as $k => $v) {
//                 pp ($metric_json_data_forecast[$k]['forecast']['parts'][$cast_depth]);

            $m[$mk][] = $v['forecast']['parts'][$forecast_depth-1][$mk_forecast];
        }

    }

//    pp([$mk, count($m[$mk])]); //,  $metric_json_data, $m[$mk]]);

    $m[$mk] = rolling_mean($m[$mk],$rolling_mean_depth);
//    $m[$mk] = array_slice($m[$mk],count($m[$mk]) - $data_depth ,$data_depth );

    switch($mk) {
        case 'pressure_pa':
            $y_max = 1015;
            $y_min = 960;
            break;
        case 'pressure_mm':
            $y_max = 760;
            $y_min = 720;
            break;
        case 'humidity':
            $y_max = 100;
            $y_min = 30;
            break;

        case 'prec_prob':
            $y_max = 50;
            $y_min = 0;
            break;
        case 'temp':
            $y_max = 30;
            $y_min = -10;
            break;

        case 'wind_speed':
            $y_max = 10;
            $y_min = 2;
            break;

        default:
            $y_max = max($m[$mk]) < 0 ? 0 : max($m[$mk]);
            $y_min = min($m[$mk]) > 0 ? 0 : min($m[$mk]);
    }

    if ($i == 0)
    {

//        pp([ $y_max, $per ]);

        $graph->SetScale('intlin',$y_min, $y_max);
        $graph->xaxis->SetTickLabels($per);
        $graph->xaxis->SetLabelSide('SIDE_BOTTOM');
        $graph->xaxis->SetFont(FF_ARIAL,FS_NORMAL,11);
//        $graph->yscale->SetAutoTicks();
        $graph->xaxis->SetColor("#f35","#fff@0");
        $graph->xaxis->SetLabelAngle(45);
//        $graph->xaxis->scale->ticks->SetTextLabelStart(10);
        $graph->xaxis->SetTextTickInterval(2,3);
        $graph->xaxis->SetLabelMargin(200);
//        $graph->xaxis->SetTextLabelInterval(2);

        $graph->SetYDeltaDist($axis_shift);

        $p[$i] = new LinePlot($m[$mk]);

        $graph->Add($p[$i]);
        $p[$i]->SetColor($color[$i+1]);
        $p[$i]->SetWeight($lw[$i+1]);
        $graph->yaxis->SetLabelFormatString("%-01.0f");
        $graph->yaxis->SetColor($axcolor[$i+1]);
        $graph->yaxis->SetFont(FF_ARIAL,FS_NORMAL,$font_size);
        $graph->xgrid->Show();
        $graph->xgrid->SetColor('#333');
        $graph->ygrid->Show();
        $graph->ygrid->SetColor('#333');

    }
    else {

        $graph->SetYScale($i-1, 'lin',$y_min, $y_max);
        $p[$i] = new LinePlot($m[$mk]);
        $p[$i]->SetColor($color[$i+1]);
        $p[$i]->SetWeight($lw[$i+1]);
        $graph->AddY($i-1, $p[$i]);
        $graph->ynaxis[$i-1]->SetColor($axcolor[$i+1]);
        $graph->ynaxis[$i-1]->SetFont(FF_ARIAL,FS_NORMAL,$font_size);
        $graph->ynaxis[$i-1]->SetLabelAlign('left','top');
        $graph->ynaxis[$i-1]->SetLabelFormatString("%02.0f");
        $graph->ynaxis[$i-1]->SetLabelMargin($label_margin);
//        $graph->ynaxis[$i-1]->scale->SetGrace(50);

    }
}

$v_plot = new PlotLine();
$v_plot->SetDirection(VERTICAL);
$v_plot->SetColor('white');
$v_plot->SetPosition($data_depth-$forecast_depth*6);
$graph->AddLine($v_plot);

$graph->img->SetAntiAliasing(False);
// Output line
$graph->Stroke();


function pp ($o)
{
    echo "<pre>".print_r($o,1)."</pre>";
}

function rolling_mean(array $data, $range)
{
    $result = [];
    for ($i = 0 ; $i < count($data) ; $i++) {
        $r = ($i < (count($data) - $range) )?$range: count($data) - $i;
        $result[] = array_sum(array_slice($data, $i, $r))/$r;
    }

    return $result;
}

function setTicks($n)
{
    global $data_depth;
    global $forecast_depth;
//    return (string)".".(($n-$data_depth));
    return (string)".".($n);

}


?>
