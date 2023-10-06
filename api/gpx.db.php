<?php
// Подключение к MySQL
$servername = "localhost"; // хост
$username = "u1371051_gpxlabd"; // имя пользователя
$password = "U9q-iPN-ugr-52f"; // пароль если существует
$dbname = "u1371051_gpxlab"; // база данных

// Создание соединения
global $conn;

$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset('utf8mb4');

// Проверка соединения
if ($conn->connect_error) {
    die("Ошибка подключения: " . $conn->connect_error);
}

//$conn->query("SET NAMES UTF8");

// Установка данных в таблицу
?>