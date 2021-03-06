var maxRadius = 500;            // maximum acceptable radius
var location_id = 0;            // first id


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

// get locations addresses
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

function createMaxRadiusCircle(centroid, maxRadius){            //used for creating a new location with maximum radius if primitive radius is bigger than maximum radius
    var newCircle = new ol.geom.Circle(centroid, maxRadius);
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