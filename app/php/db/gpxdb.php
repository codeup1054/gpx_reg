<?php
global $gsql;

class gpxSQL extends MySQLi
{
    /* check connection */
    public function db_info()
    {
        if ($this->connect_errno) {
            printf("Не удалось подключиться: %s\n", $gsql->connect_error);
            exit();
        }
        else {
            $query_result = array();

            $q0 = "SHOW TABLES;";
            $q1 = "SELECT SUM(TABLE_ROWS) FROM INFORMATION_SCHEMA.TABLES  WHERE TABLE_SCHEMA = 'u1371051_gpx'";
            $q2 = "SELECT * FROM INFORMATION_SCHEMA.TABLES  WHERE TABLE_SCHEMA = 'u1371051_gpx'";

                if ($result = $this->query($q2))
                    while ($o = $result->fetch_object()) {
                        $query_result[] = $o;
                        printf ("%s \t%s \t%s</br>\n", $o->TABLE_NAME, $o->TABLE_ROWS, $o->CREATE_TIME );
                    }
                else echo "***** Ошибка SQL:\n (" . $this->errno . ") " . $this->error . "<br />";
                printf("DB_INFO:\n");
                var_dump(array_keys((array)$query_result[0]));
            }
    }
}

$gsql = new gpxSQL("localhost", "u1371051_gpx", "9jEig00&", "u1371051_gpx");

$gsql->db_info();


//get_class_methods('gpxSQL')

//$methods = $gsql->getMethods(ReflectionMethod::IS_PUBLIC);
//var_dump($methods);



?>