<?php

    $osmId = (int) $_POST['osmId'];
    $query = "select center(loc), radius(loc) From locations WHERE osmid={$osmId};";
    
    // Connecting, selecting database
    $db_connection = pg_connect("host=localhost dbname=OSM_Users_info user=postgres password=faraz@816#postgres") or die('connection failed' . pg_last_error());
        
    // Performing SQL query
    $result = pg_query($query) or die('Query failed: ' . pg_last_error());
    
    $data = array();
    $existingLocations = array();
    while ($row = pg_fetch_row($result)) {
        
        $location = array(
            'center' => $row[0],
            'radius' => $row[1],
        );
        array_push($existingLocations, $location);
    }
    array_push($data, $existingLocations);
    
    
    $query = "select age, gender, education from users WHERE osmid={$osmId};";
    
    // Connecting, selecting database
    $db_connection = pg_connect("host=localhost dbname=OSM_Users_info user=postgres password=faraz@816#postgres") or die('connection failed' . pg_last_error());
        
    // Performing SQL query
    $result = pg_query($query) or die('Query failed: ' . pg_last_error());
    
   
    while ($row = pg_fetch_row($result)) {
        
        $user = array(
            'age' => $row[0],
            'gender' => $row[1],
            'education' => $row[2],
        );
        array_push($data, $user);
    }
    
    $jsonstring = json_encode($data);
    
    
    // Free resultset
    pg_free_result($result);

    // Closing connection
    pg_close($db_connection);
    
    
    
    
    
    echo $jsonstring;
    
    
    
?>

