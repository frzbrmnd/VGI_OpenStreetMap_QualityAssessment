<?php require_once("functions.php"); ?>  
<?php   
    if (!empty($_POST)){
        $errorMessage = "";
        $length = (int) $_POST["length"];
        $username = pg_escape_string($_POST['username']);
        $osmId = (int) $_POST['osmId'];
        $changeSetsCount = (int) $_POST['changesetsCount'];
        $age = (int) $_POST['age'];
        $gender = $_POST['gender'];
        $education = $_POST['education'];
        
        if (empty($_POST['osmId'])){            //check if the user have logged in
            $errorMessage .= "You are not logged in. <br/>";
        }
        if (empty($length)){                    //check if the user have added any location
            $errorMessage .= "List of locations is empty. Please add some locations.<br/>";
        }
        if (!($gender === "" || $gender === "male" || $gender === "female" || $gender === "other")){                    //check if gender is valid
            $errorMessage .= "$gender is not valid. <br/>";
        }
        if (!($education === "" || $education === "illiterate" || $education === "HighSchool" || $education === "BachelorDegree" || $education === "MasterDegree" || $education === "Phd")){                    //check if education is valid
            $errorMessage .= "$education is not valid.";
        }
        
        
        if (!empty($errorMessage)){
            ?>
            <style type="text/css">
                #errorMessageContainer {
                    display: block;
                }
            </style>
            <script>
                document.getElementById("errorMessage").innerHTML = '<?php echo $errorMessage; ?>';
            </script>
            <?php
        } else {
            $query = "";
            if ($_POST['newUser'] === "existing"){
                $query .= "UPDATE users ";
                $query .= " SET changesetscount={$changeSetsCount}, age={$age}, gender='{$gender}', education='{$education}' ";
                $query .= " WHERE osmid=$osmId;";
            }else if ($_POST['newUser'] === "new") {
                $query .= "INSERT INTO ";
                $query .= "users ";
                $query .= "(username, osmid, changesetscount, age, gender, education) ";
                $query .= "VALUES ('{$username}', {$osmId}, {$changeSetsCount}, {$age}, '{$gender}', '{$education}'); ";
            }
            
            $query .= " DELETE FROM locations WHERE osmid={$osmId};";
            for ($i = 0; $i < $length; $i++) {
                $latitude = (float) $_POST["location_" . $i . "_lat"];
                $longitude = (float) $_POST["location_" . $i . "_lon"];
                $radius = (float) $_POST["location_" . $i . "_radius"];
                $query .= createInsertQueryForLocations($osmId, $latitude, $longitude, $radius);
            }
            performQuery($query);
        }
    }
?>
        
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
                    <button id="login" type="button" class="btn btn-outline-success">Login</button>
                </div>  
                <div class="col-auto">
                    <button id="logout" type="button" class="btn btn-outline-success">Logout</button>
                </div>  
            </div>
        </nav>
        
        <div id="errorMessageContainer" class="alert alert-danger">
            <h4>Error occurred</h4>
            
            <p id="errorMessage"></p>
            
            <button id="closeMessage" class="btn" onclick="myFunction()">
                <span>&times;</span>
            </button>
        </div>
        
        <div id="panel">
            <div id="greeting">
                <h2 id="helloUser">asd</h2>
                <p>We want you to fill the form below and mark your favorite locations on the map. These <span id="dots">...</span><span id="more">locations may include where you live or work, and are not necessarily related to your OSM participation. You can add your locations by clicking on "Add new location" button and then mark it on the map. Since privacy is our priority, you can define your locations with a circle with a maximum radius of 500 meters.<br>For more information about this project <a href="https://github.com/frzbrmnd/VGI_OpenStreetMap_QualityAssessment">click here.</a></span></p>
                <button id="moreLess" class="btn btn-secondary">Read more</button>
                
            </div>
            <form id="myForm" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>" method="post">
                 
                <div class="mb-3 row">
                    <label for="age" class="col-sm-2 col-form-label bold">Age:</label>
                    <div class="col-sm-10">
                        <input type="number" id="age" class="form-control" name="age" value="0" oninput="javascript: if (this.value.length > 2) this.value = this.value.slice(0, 2);" min="0" max="99">
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
                            <option id="none"></option>
                            <option id="Illiterate" value="Illiterate">illiterate</option>
                            <option id="HighSchool" value="HighSchool">High school diploma or lower</option>
                            <option id="BachelorDegree" value="BachelorDegree">Bachelor degree</option>
                            <option id="MasterDegree" value="MasterDegree">Master degree</option>
                            <option id="Phd" value="Phd">PhD</option>
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
                    <button type="button" name="btnSubmit" id="btnSubmit" class="btn btn-primary col-sm-3" onclick="event.preventDefault(); validateForm()">Save</button>
                </div>
                <input id="username" type="hidden" name="username">
                <input id="osmId" type="hidden" name="osmId">
                <input id="changesetsCount" type="hidden" name="changesetsCount">
                <input id="length" type="hidden" name="length">
                <input id="newUser" type="hidden" name="newUser">
            </form>
        </div>
        <div id="mapContainer" class="container-fluid">
            <div class="row">    
                <div id="map" class="map"></div>
            </div>
        </div>
        <div id="asd"> </div>
        <script src='./javascript/osmauth.js'></script>
        <script src="./javascript/index.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
    </body>
</html>




        


       