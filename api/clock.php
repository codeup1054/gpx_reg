<?php

/* gets the contents of a file if it exists, otherwise grabs and caches */

function get_content($file, $url, $minutes = 30, $fn = '', $fn_args = '') {
    //vars
    $current_time = time(); $expire_time = $minutes * 60; $file_time = filemtime($file);
    //decisions, decisions
    if(file_exists($file) && ($current_time - $expire_time < $file_time)) {
//        echo 'returning from cached file';
        return file_get_contents($file);
    }
    else {
        $content = get_url($url);
        if($fn) { $metric = $fn($content,$fn_args);
        }
//        $content.= '<!-- cached:  '.time().'-->';
        file_put_contents($file,$content);
//        file_put_contents(str_replace("yan", $current_time.'_'."yan", $file),$content);
//        echo 'retrieved fresh from '.$url.':: '.$content;
        return $content;
    }
}

/* gets content from a URL via curl */
function get_url($url) {
    $ch = curl_init();
    curl_setopt($ch,CURLOPT_URL,$url);
    curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
    curl_setopt($ch,CURLOPT_CONNECTTIMEOUT,5);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'X-Yandex-API-Key: 3623bcf2-1366-4096-93ea-2d2186989a5c'
    ));
    $content = curl_exec($ch);
    curl_close($ch);
    return $content;
}


$TWITTER_FOLLOWERS_FILE_NAME = 'cache_clock/yandex_weather_cache.json';
$HISTORY_WEATHER_FILE_NAME = 'cache_clock/yandex_weather_history.csv';
$HISTORY_WEATHER_FILE_NAME_JSON = 'cache_clock/json_yandex_weather_history.json';

$YANDEX_WEATHER_URL = 'https://api.weather.yandex.ru/v2/informers?lat=55.692&lon=37.347';
$TWITTER_FOLLOWERS_URL = 'https://gpxlab.ru/data/yandex_weather_forecast.json';

$TWITTER_FOLLOWERS = get_content($TWITTER_FOLLOWERS_FILE_NAME,$YANDEX_WEATHER_URL,
    29,
    'format_followers',
    array('file'=>$HISTORY_WEATHER_FILE_NAME,
          'file_json'=>$HISTORY_WEATHER_FILE_NAME_JSON));
/* utility function */

function format_followers($content,$args) {
    $content = json_decode($content);
    $f = $content->{'fact'};

    $weather_metric =
        $f->{'temp'}."\t".
        $f->{'pressure_pa'}."\t".
        $f->{'humidity'}   ;

//    print ($weather_metric);

    if($weather_metric) {
//        $weather_metric = number_format($weather_metric,0,'',',');
        file_put_contents($args['file'],time()."\t".$weather_metric."\n",FILE_APPEND);
        file_put_contents($args['file_json'],"".time().":".json_encode($content).",\n",FILE_APPEND);
        return $weather_metric;
    }
}


//print (time() - filemtime($TWITTER_FOLLOWERS_FILE_NAME));
print ($TWITTER_FOLLOWERS);

?>
