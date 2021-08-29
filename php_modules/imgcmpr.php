<?php

$CONS = [];

$p = [
    'ms'=> '2021-07',
    'me'=> '2021-08',
    'z' => '16',
    'x' => 39549,
    'y' => 20501,
    'fuzz' => 45,
    'root_dir' => $_SERVER['DOCUMENT_ROOT'],

 ];

foreach($p as $k=>$v)
{
    $p[$k] = (isset($_REQUEST[$k]))? $_REQUEST[$k] : $v ;
    $$k = $p[$k];
}

$path_comp_relative = "/img_cache_comp/$ms-$me/all/hot/$z/$x/";
$filename_comp = $y.".png";

$filename_comp_absolute = $root_dir . $path_comp_relative . $filename_comp;

//echo "<pre>".print_r([$me, check_file($filename_comp_absolute), $_REQUEST ],1)."</pre>";


if (check_file($root_dir . $path_comp_relative . $filename_comp,1) && true)
{
//    print $path_comp_relative . $filename_comp;

    $image = new imagick($root_dir . $path_comp_relative . $filename_comp);

    echo $image;
}
else
{
    $image1 = new imagick();
    $image1->SetOption('fuzz', $fuzz.'%');

    $image2 = new imagick();
    $image2->SetOption('fuzz', $fuzz.'%');

    $ms_image_path = $root_dir . "/img_cache_history/$ms/all/hot/$z/$x/$y.png";
    $me_image_path = $root_dir . "/img_cache_history/$me/all/hot/$z/$x/$y.png";

//    echo "<pre>".print_r([$ms_image_path, $me_image_path, check_file($ms_image_path) , check_file($me_image_path)],1)."</pre>";
    
    
    if (check_file($ms_image_path) && check_file($me_image_path)) {

        $image1->readImage($ms_image_path);
        $image2->readImage($me_image_path);

        $result = $image1->compareImages($image2, 1);

        /** set compare_image  transparency */

//        $fuzz = 0.05 * $result[0]->getQuantumRange()['quantumRangeLong'];
        $fuzz = 0.5 * $result[0]->getQuantumRange()['quantumRangeLong'];

        $result[0]->transparentPaintImage(
            'rgb(214,204,212)', 0, $fuzz, false
        );

        $result[0]->transparentPaintImage(
            '#FFFBD9', 0, $fuzz, false
        );


        [$brightness, $saturation, $hue] = [100,100,70];
        $result[0]->modulateImage($brightness, $saturation, $hue);

        $result[0]->writeImage($root_dir . $path_comp_relative . $filename_comp);
//        print $path_comp_relative . $filename_comp;
        echo $result[0];
    }

    $image2->destroy();
    $image1->destroy();

}

/**  functions * */

function check_file($path, $create_path = false )
{


    $dirname = dirname($path);

    if(file_exists($path)) {
        return true;
    }
    else if (!is_dir($dirname) && $create_path == true) {
        mkdir($dirname,0777, true);
        return false; // dir created
    };
    return false;
}


?>