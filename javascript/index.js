var maxRadius = 500;            // maximum acceptable radius
var location_id = 0;            // first id
var userInfo;

var raster = new ol.layer.Tile({            // main layer: OSM
  source: new ol.source.OSM(),
});

//create a vector layer and source for locations
var source = new ol.source.Vector();
var vector = new ol.layer.Vector({
  source: source,
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),
    stroke: new ol.style.Stroke({
      color: '#ffcc33',
      width: 2,
    }),
    image: new ol.style.Circle({
      radius: 7,
      fill: new ol.style.Fill({
        color: '#ffcc33',
      }),
    }),
  }),
});

var map = new ol.Map({          //creating map
  layers: [raster, vector],
  target: 'map',
  view: new ol.View({
      center: ol.proj.fromLonLat([51.391098, 35.700927]),
      zoom: 12,
  }),
});

source.on('addfeature', function(event){            //checking radius for new added locations and adding its address
    removeClass("selected");
    draw.setActive(false);
    var myFeature = event.feature;
    var centroid = myFeature.getGeometry().getCenter();
    var radius = myFeature.getGeometry().getRadius();
    if (myFeature.getId() == null){
        var id = "location_" + location_id;
        location_id += 1;
        AddLocationAddress(ol.proj.transform(centroid, "EPSG:3857", "EPSG:4326"), id);
        if (checkRadius(radius, maxRadius)){
            myFeature.setId(id);
            modify.setActive(true);

        } else {
            var newFeature = createMaxRadiusCircle(centroid, maxRadius);
            newFeature.setId(id);
            source.addFeature(newFeature);
            source.removeFeature(myFeature);
        };
    };
});



var draw = new ol.interaction.Draw({            //draw interaction
    source: source,
    type: "Circle",
});
map.addInteraction(draw);
draw.setActive(false);

var select = new ol.interaction.Select({            //select interaction
    multi: false,
});
map.addInteraction(select);
   
var modify = new ol.interaction.Modify({            //modify interaction
    features: select.getFeatures(),
})
map.addInteraction(modify);
modify.setActive(false);


select.on('select', function(){             //commands on select and deselect locations
    removeClass("selected");
    if(select.getFeatures().getLength() > 0){
            
    }
    if (select.getFeatures().getLength() > 0 && !draw.getActive()){
        modify.setActive(true);
        var selectdFeatureId = select.getFeatures().item(0).getId();
        document.getElementById(selectdFeatureId).classList.add("selected");
    } else {
        modify.setActive(false);
    }
})
   
modify.on('modifyend', function(event){             //checking radius when modifying an existing location
    var myFeature = event.features.item(0);
    var centroid = myFeature.getGeometry().getCenter();
    var radius = myFeature.getGeometry().getRadius();
    var id = myFeature.getId();
    if(!checkRadius(radius, maxRadius)){
        var newFeature = createMaxRadiusCircle(centroid, maxRadius);
        select.getFeatures().pop(myFeature);
        source.removeFeature(myFeature);
        newFeature.setId(id);
        source.addFeature(newFeature);
        select.getFeatures().push(newFeature);      
    }
})
   
document.getElementById("addLocation").onclick = function(){            //active drawing interaction for adding new locations
    draw.setActive(true); 
};

window.onclick = e => {             //select a location by clicking on its address
    if(e.target.tagName === "LI"){
        getFeatureById(e.target.id);
    };  
}

async function AddLocationAddress(coords, location_id) {            //function used for getting a locations address and adding it to the list of locations
    var new_location = document.createElement('li');
    new_location.setAttribute("id", location_id);
    new_location.setAttribute("class", "list-group-item border-0 selected");
    var deleteButton = document.createElement('button');
    deleteButton.setAttribute("type", "button");
    deleteButton.setAttribute("id", "delete_" + location_id);
    deleteButton.setAttribute("class", "deleteButton");
    deleteButton.setAttribute("onclick", "deleteLocation()");
    deleteButton.innerHTML = "<svg xmlns=\"./images/trash.svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-trash deleteIcon\" viewBox=\"0 0 16 16\"><path d=\"M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z\"/><path fill-rule=\"evenodd\" d=\"M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z\"/></svg>";
    
    document.getElementById("loactionsList").appendChild(new_location);
    await fetch('https://nominatim.openstreetmap.org/reverse?format=json&lon=' + coords[0] + '&lat=' + coords[1])
        .then(response => {
        if (!response.ok){
            throw new Error("HTTP error " + response.status);
        }
        return response.json();
    })
        .then(json => {
            this.users = json;
            
            document.getElementById(location_id).innerHTML = this.users.address.neighbourhood; 
            new_location.appendChild(deleteButton);
    })
        .catch(function (){
            this.dataError = true;
        });
}

function getFeatureById(id){            //function used for selecting a location by click on its address 
    var allFeatures = source.getFeatures();
    removeClass("selected");
    for (var i = 0; i < allFeatures.length; i++){
        if (allFeatures[i].getId() === id){         //element.classList.remove("newStyle");
            select.getFeatures().clear();
            select.getFeatures().push(allFeatures[i]);
            document.getElementById(id).classList.add("selected");
            modify.setActive(true);
        }
    }
}

function checkRadius(featureRadius, maxRadius){             //return true if radius is less than maximum radius
    if (featureRadius > maxRadius){
        return false;
    } else{
        return true;
    }
}

function createMaxRadiusCircle(centroid, radius){            //used for creating a new location 
    var newCircle = new ol.geom.Circle(centroid, radius);
    var newFeature = new ol.Feature({
                name: 'new Circle',
                geometry: newCircle
        });
    return newFeature;
}
  
function removeClass(className){                //used for styling locations addresses  
    elements = document.getElementsByClassName(className);
    for (element of elements){
        element.classList.remove(className);
    };
}  

function deleteLocation(){
    var id = event.target.parentElement.parentElement.id;
    var allFeatures = source.getFeatures();
    for (var i = 0; i < allFeatures.length; i++){
        if (allFeatures[i].getId() === id){         //element.classList.remove("newStyle");
            source.removeFeature(allFeatures[i]);
            document.getElementById(id).remove();
        }
    }
}


document.getElementById("moreLess").onclick = function(){            //read more, read less
    var dots = document.getElementById("dots");
    var moreText = document.getElementById("more");
    var btnText = document.getElementById("moreLess");

    if (dots.style.display === "none") {
      dots.style.display = "inline";
      btnText.innerHTML = "Read more"; 
      moreText.style.display = "none";
    } else {
      dots.style.display = "none";
      btnText.innerHTML = "Read less"; 
      moreText.style.display = "inline";
    }
};




var auth = osmAuth({                //authentications using OAuth on openstreetmap
    oauth_secret: '2Y0dxGIAXZCr6Fc7ipzzw3i1U2Hqoxmv7mnB7xtj',
    oauth_consumer_key: '8fgyZBpl7y2UFcdaZAPl1oYGe1vewyB24sOxfMZG',           
});

function done(err, res){ 
    if (err) {
        alert('error! try clearing your browser cache');
        return;
    }
    var u = res.getElementsByTagName('user')[0];
    var changesets = res.getElementsByTagName('changesets')[0];
    userInfo = {
        display_name: u.getAttribute('display_name'),
        id: u.getAttribute('id'),
        changesetsCount: changesets.getAttribute('count')
    };
    
    loadDoc(userInfo);
    document.getElementById("helloUser").innerHTML = "Hi " + userInfo.display_name + "!";
    document.getElementById("helloUser").style.display = 'block';
    
    document.getElementById("username").value = userInfo.display_name;
    document.getElementById("osmId").value = userInfo.id;
    document.getElementById("changesetsCount").value = userInfo.changesetsCount;
}

document.getElementById('login').onclick = function() {
    if(!auth.authenticated()){
        if (!auth.bringPopupWindowToFront()) {
            auth.authenticate(function() {
                update();
            });
        }
    }else{
        alert("you are logged in as " + userInfo.display_name);
    }
};

document.getElementById("logout").onclick = function(){
    if(auth.authenticated()){
        auth.logout();
    }
    source.clear();
    document.getElementById("age").value = 0;
    document.getElementById('male').checked = false;
    document.getElementById('female').checked = false;
    document.getElementById('other').checked = false;
    document.getElementById('education').checked = false;
    document.getElementById("none").selected = true;
    document.getElementById("helloUser").style.display = 'none';
    
    var theList = document.getElementById("loactionsList");             //bug: doesnt delete the last location address
    var theListItems = theList.getElementsByTagName("li");
    for (var i = 0; i < theListItems.length; i++){
        theList.removeChild(theListItems[i]);
    }
}




function showDetails() {
    auth.xhr({
        method: 'GET',
        path: '/api/0.6/user/details'
    },done);
}

function update() {
    if (auth.authenticated()) {
        showDetails();
    }
}


window.onload = function(){
    if (auth.authenticated()) {
        update();
    }
}


function validateForm() {
    
    var formIsValide = true;
    var errorMessage = ""; 
    var form = document.getElementById("myForm");
   
    //check if the user have logged in
    if(!auth.authenticated()){
        errorMessage += "You are not logged in. \n";
        formIsValide = false;
    }
    
    //check if the user have added any location
    var locations = source.getFeatures();
    if(locations.length == 0){
        errorMessage += "List of locations is empty. Please add some locations.";
        formIsValide = false;
    }
    
    //create hidden inputs for locations
    document.getElementById("length").value = locations.length;
    for (var i = 0; i < locations.length; i++){
        var radius = document.createElement("INPUT");
        radius.setAttribute("type", "hidden");
        radius.setAttribute("name", "location_" + i + "_radius");
        radius.value = locations[i].getGeometry().getRadius();
        form.appendChild(radius);
        var center = ol.proj.transform(locations[i].getGeometry().getCenter(), "EPSG:3857", "EPSG:4326");  
        var lat = document.createElement("INPUT");
        lat.setAttribute("type", "hidden");
        lat.setAttribute("name", "location_" + i + "_lat");
        lat.value = center[1];
        form.appendChild(lat);
        
        var lon = document.createElement("INPUT");
        lon.setAttribute("type", "hidden");
        lon.setAttribute("name", "location_" + i + "_lon");
        lon.value = center[0];
        form.appendChild(lon);
    }
    
    if(formIsValide){
        form.submit();
    }else {
        alert(errorMessage);
    }
}


function myFunction(){
    document.getElementById('errorMessageContainer').style.display = 'none';
};
        
        
function loadDoc(userInfo) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            var locationsArray = data[0];
            var userInfo = data[1];
            if (locationsArray.length == 0){
                document.getElementById('newUser').value = "new";
            }else {
                document.getElementById('newUser').value = "existing";
                addExistingLocationsToSource(locationsArray);
                document.getElementById('age').value = parseInt(userInfo.age);
                if(userInfo.gender !== "") document.getElementById(userInfo.gender).checked = true;
                if(userInfo.education !== "") document.getElementById(userInfo.education).selected = true;
            }
        }
    };
    xhttp.open("POST", "loadDoc.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("username=" + userInfo.display_name + "&osmId=" + userInfo.id);
}


function addExistingLocationsToSource(locationsArray){
    for (var i = 0; i < locationsArray.length; i++){
        var centerStr = locationsArray[i].center; 
        var centerSplited = centerStr.substring(1, centerStr.length-1).split(",");
        var centerFloat = [parseFloat(centerSplited[0]), parseFloat(centerSplited[1])];        
        var centroid = ol.proj.transform(centerFloat, "EPSG:4326", "EPSG:3857");
        var newFeature = createMaxRadiusCircle(centroid, parseFloat(locationsArray[i].radius));
        source.addFeature(newFeature);
    }
}
