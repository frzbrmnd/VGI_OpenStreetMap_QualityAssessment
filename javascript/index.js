var raster = new ol.layer.Tile({
  source: new ol.source.OSM(),
});

var maxRadius = 500;
var source = new ol.source.Vector();
source.on('addfeature', function(event){
    
    var circle = event.feature.getGeometry();
    
    
    var radius = circle.getRadius(); 
    var centroid = circle.getCenter(); 
    if (radius > maxRadius){
        source.removeFeature(event.feature);
        var newCircle = new ol.geom.Circle(centroid, maxRadius);
        var newFeature = new ol.Feature({
            name: 'new Circle',
            geometry: newCircle
        });
        source.addFeature(newFeature);
    }
    
    var place = "test";
    var new_row = document.createElement('p');
    new_row.className = "aClassName";
    reverseGeocode(ol.proj.transform(centroid, "EPSG:3857", "EPSG:4326"), place);
    
    map.removeInteraction(draw);
    
    console.log(source.getFeatures());
});


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


var map = new ol.Map({
  layers: [raster, vector],
  target: 'map',
  view: new ol.View({
      center: ol.proj.fromLonLat([51.66310, 32.62578]),
      zoom: 20,
  }),
});


// draw circles
var draw, snap;
function addInteraction(){
    draw = new ol.interaction.Draw({
        source: source,
        type: "Circle",
    });
    map.addInteraction(draw);
    snap = new ol.interaction.Snap({source: source});
    map.addInteraction(snap);    
    
}




document.getElementById("addLocation").onclick = function(){
    addInteraction();
};

// get locations addresses
async function reverseGeocode(coords, placeId) {
    await fetch('https://nominatim.openstreetmap.org/reverse?format=json&lon=' + coords[0] + '&lat=' + coords[1])
        .then(response => {
        if (!response.ok){
            throw new Error("HTTP error " + response.status);
        }
        return response.json();
    })
        .then(json => {
            this.users = json;
            document.getElementById(placeId).innerHTML = this.users.address.neighbourhood;
    })
        .catch(function (){
            this.dataError = true;
        });
}


