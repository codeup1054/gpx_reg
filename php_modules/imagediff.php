<style>
div {
    width: 100px;
    height: 100px;
    position: relative;
    border: solid 0px red;
    display: inline-block;
    font-size: 10px;
    padding:0px;
}
</style>

<?php

$root = $_SERVER['DOCUMENT_ROOT'];

$f = $_REQUEST['f'] | 55;
$ms = (isset($_REQUEST['ms']))? $_REQUEST['ms'] : '2021-06' ;
$me = (isset($_REQUEST['me']))? $_REQUEST['me'] : '2021-08' ;

//print ($me."<br>".$_REQUEST['me']);
//print ("<pre>".print_r ($_REQUEST,1)."</pre>");

$fuzz = range(50, 90, 3) ;


//$z = '14';
//$x = 9870;
//$y = 5125;

//$z = '15';
//$x = 19750;
//$y = 10200;

$z = '16';
$x = 39557;
$y = 20470;

$steps = 10;
$imgSize = 100;
$canvasSize = ($imgSize*$steps).'px';

$xrange = range($x, $x + $steps - 5) ;
$yrange = range($y, $y + $steps - 5) ;



//echo '<img src="data:image/jpg;base64,'.base64_encode($image1->getImageBlob()).'" alt="" />';
//echo '<img src="data:image/jpg;base64,'.base64_encode($image2->getImageBlob()).'" alt="" /><br/>';
echo "<div style='width: $canvasSize; height: $canvasSize; background-color: #4CAF50;'>";

$image1 = new imagick();
$image1->SetOption('fuzz', $f.'%');

$image2 = new imagick();
$image2->SetOption('fuzz', $f.'%');


$noimage = new imagick($root . "/img_cache_history/nomap.png");

$cnt = 0;
$cnt_total = 0;


foreach ($yrange as $yk=>$yv) {

//    sleep(1);

    foreach ($xrange as $k => $v) {


        $cnt_total ++;

        $idx = "$cnt_total $cnt: [$z]  $v, $yv  \n /img_cache_history/$ms/all/hot/$z/$v/$yv.png \n /img_cache_history/$me /all/hot/$z/$v/$yv.png";


        $path_comp = $root . "/img_cache_comp/$ms-$me/all/hot/$z/$v/";
        $imgsrc = $path_comp . $yv.".png";

        if(file_exists($imgsrc) && false) {
            echo "<img src='/img_cache_comp/$ms-$me/all/hot/$z/$v/$yv.png' title = '$idx' width=" . $imgSize . "px />";
        }
        else if (file_exists($root . "/img_cache_history/$ms/all/hot/$z/$v/$yv.png") &&
            file_exists($root . "/img_cache_history/$me/all/hot/$z/$v/$yv.png")) {

            $cnt++;
            $image1->readImage($root . "/img_cache_history/$ms/all/hot/$z/$v/$yv.png");
            $image2->readImage($root . "/img_cache_history/$me/all/hot/$z/$v/$yv.png");
            $result = compImg($image2, $image1, 1);


//            $target_color = new ImagickPixel('#D6CCD4');

            $target_color = 'rgb(214,204,212)';
            $alpha = 0;
            $fuzz = 0.05 * $result[0]->getQuantumRange()['quantumRangeLong'];
            $fill = 'rgb(214,204,0,0.2)';

//            $result[0]->opaquePaintImage($target_color, $fill, $fuzz, false, Imagick::CHANNEL_DEFAULT);




            $result[0]->transparentPaintImage(
                $target_color, $alpha, $fuzz, false
            );

            [$brightness, $saturation, $hue] = [100,100,70];
            $result[0]->modulateImage($brightness, $saturation, $hue);


            $imgbase64 = "data:image/jpg;base64,". base64_encode($result[0]->getImageBlob());

//            echo "<div title = '$idx' style='background-image: url ($imgbase64); '></div>";

//            print ($path_comp);

            if (!is_dir($path_comp)) {  // ************ 2020 Create directory *****************
                mkdir($path_comp,0777, true);
            }




            $result[0]->writeImage($imgsrc);

            echo "<img title = '$idx' width=".$imgSize."px src='$imgbase64'/>";

        } else {


            echo "<div title = '$idx' style='border:solid 0px whitesmoke; width:".$imgSize."px; height:".$imgSize."px;'></div>";
        }

//    $result = compImg($image1,$image2, $imageConsts[$k]);
//    echo $fuzz[$k].'<img src="data:image/jpg;base64,'.base64_encode($result[0]->getImageBlob()).'" alt="" />';
    }
    echo "<br/>";
}
echo "</div>";

$image2->destroy();
$image1->destroy();


function compImg ($i1,$i2,$c)
{
    return $i1->compareImages($i2, $c);
}

function compztImg ($i1,$i2,$c)
{
    $i1->setImageVirtualPixelMethod(Imagick::VIRTUALPIXELMETHOD_TRANSPARENT);
    $i1->setImageArtifact('compose:args', "1,0,-0.5,0.5");
    $i1->compositeImage($i2, Imagick::COMPOSITE_MATHEMATICS, 0, 0);

    return $i1;
}







?>