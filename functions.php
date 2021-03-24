<?php
    
    function createInsertQueryForLocations($userId, $lat, $lon, $radius){
        
        
        $query = " INSERT INTO ";
        $query .= "locations ";
        $query .= "(osmid, loc) ";
        $query .= "VALUES ({$userId}, CIRCLE(POINT({$lon}, {$lat}), {$radius}));";
        return $query;
    }
    
    function selectLocationsByOsmId(){//todo
        $query = " select * From locations";
        $query .= "locations ";
        $query .= "(osmid, loc) ";
        $query .= "VALUES ({$userId}, CIRCLE(POINT({$lon}, {$lat}), {$radius}));";
        return $query;
    }
    
   
    function performQuery($query){
        
        // Connecting, selecting database
        $db_connection = pg_connect("host=localhost dbname=OSM_Users_info user=postgres password=faraz@816#postgres") or die('connection failed' . pg_last_error());
        
        // Performing SQL query
        $result = pg_query($query) or die('Query failed: ' . pg_last_error());
        
        // Free resultset
        pg_free_result($result);

        // Closing connection
        pg_close($db_connection);
    }

?>