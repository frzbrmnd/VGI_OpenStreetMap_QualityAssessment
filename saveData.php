<?php
    
    

    function saveLocation($userId, $lat, $lon, $radius){
        $query = " INSERT INTO ";
        $query .= "locations ";
        $query .= "(osmid, loc) ";
        $query .= "VALUES ({$userId}, CIRCLE(POINT({$lon}, {$lat}), {$radius}));";
        return $query;
    }
    
    $length = $_POST["length"];
    
    // Connecting, selecting database
    $db_connection = pg_connect("host=localhost dbname=OSM_Users_info user=postgres password=faraz@816#postgres") or die('connection failed' . pg_last_error());
    
    $query = "";
    
    $query = "INSERT INTO ";
    $query .= "users ";
    $query .= "(username, osmid, changesetscount, age, gender, education) ";
    $query .= "VALUES ('{$_POST['username']}', {$_POST['osmId']}, {$_POST['changesetsCount']}, {$_POST['age']}, '{$_POST['gender']}', '{$_POST['education']}');";
    
    for ($i = 0; $i < $length; $i++) {
        $query .= saveLocation($_POST['osmId'], $_POST["location_" . $i . "_lat"], $_POST["location_" . $i . "_lon"], $_POST["location_" . $i . "_radius"]);
    }


    // Performing SQL query
    $result = pg_query($query) or die('Query failed: ' . pg_last_error());
    
    // Free resultset
    pg_free_result($result);

    // Closing connection
    pg_close($db_connection);
?> 
