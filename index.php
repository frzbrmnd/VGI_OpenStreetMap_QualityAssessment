<?php
    
    if(isset($_POST['username']) && $_POST['userId']){
        $username = $_POST['username'];
        $userId = $_POST['userId'];
        $count = $_POST['count'];
        
    } else {
        header("Location: login.html");
        exit;
    }


    
    
?>

<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
        <link rel="stylesheet" href="./style/ol.css" type="text/css">
        <link rel="stylesheet" href="./style/styleSheet.css">
        <link rel="shortcut icon" href="#"> <!-- for Netbeans error! -->
        <script src="./javascript/ol.js"></script>
        <title>OSM Quality Assessment</title><!-- to do -->
    </head>
    <body>
        <nav id="heading" class="navbar navbar-light bg-light">
            <div class="container-fluid row">
                <div class="col-auto me-auto">
                    <h2>OSM Quality Assessment</h2>
                </div>
                <div class="col-auto">
                    <button id="logout" type="button" class="btn btn-outline-success">Log out</button>
                </div>  
            </div>
        </nav>
        <div id="panel">
            <div id="greeting">
                <h2>Hi <?php echo $username?>!</h2>
                <p>We want you to fill the form below and mark your favorite locations on the map. These <span id="dots">...</span><span id="more">locations may include where you live or work, and are not necessarily related to your OSM participation. You can add your locations by clicking on "Add new location" button and then mark it on the map. Since privacy is our priority, you can define your locations with a circle with a maximum radius of 500 meters.<br>For more information about this project <a href="#">click here.</a></span></p>
                <button id="moreLess" class="btn btn-secondary">Read more</button>
                
            </div>
            <form><!-- to do -->
                 
                <div class="mb-3 row">
                    <label for="age" class="col-sm-2 col-form-label bold">Age:</label>
                    <div class="col-sm-10">
                        <input type="text" id="age" class="form-control" name="age">
                    </div>
                </div>
                
                <div class="mb-3 row">
                    <label for="male" class="col-sm-2 col-form-label bold">Gender:</label>
                    <div class="col-sm-10 myRadios">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" id="male" name="gender" value="male">
                            <label for="male" class="form-check-label">Male</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="gender" id="female" value="female">
                            <label class="form-check-label" for="female">Female</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="gender" id="other" value="other">
                            <label class="form-check-label" for="other">Other</label>
                        </div>
                    </div>
                </div>
                
                
                <div class="mb-3 row">
                    <label for="education" class="col-sm-3 col-form-label bold">Education:</label>
                    <div class="col-sm-9">
                        <select id="education" class="form-select form-select-sm" name="education"><!-- to do -->
                            <option value="test0">test0</option>
                            <option value="test1">test1</option>
                            <option value="test2">test2</option>
                            <option value="test3">test3</option>
                            <option value="test4">test4</option>
                        </select><br>
                    </div>
                </div>
                
                
                    <div class="mb-3 row">

                        <label for="locations" class="col-sm-3 col-form-label bold">Location(s):</label>

                        <div class="col-sm-9 ">

                            <button type="button" id="addLocation" class="btn">Add new location</button>
                        </div>
                    </div>


                    <div id="locationsContainer">
                        <ul id="loactionsList" class="list-group list-group-flush">List of Locations:
                            <hr>



                        </ul>
                    </div>
                
                <div class="mb-3 row justify-content-center">
                    <button type="submit" value="Submit" id="submit" class="btn btn-primary col-sm-3">Submit</button>
                </div>

            </form>
        </div>
        <div id="mapContainer" class="container-fluid">
            <div class="row">    
                <div id="map" class="map"></div>
            </div>
        </div>
       
        <script src="./javascript/index.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
    </body>
</html>
