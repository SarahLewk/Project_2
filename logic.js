// Perform API call to USGS API to get earthquake data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function(earthquakeData) {
  createFeatures(earthquakeData.features);
});

// Function to scale the Magnitude 
function markerSize(magnitude) {
  return magnitude * 30000;
};

// Function to assign color depending on Magnitude
function getColor(m) {

  var colors = ['lightblue','lightgreen','yellow','orange','lightsalmon','red'];

  return  m > 5? colors[5]:
          m > 4? colors[4]:
          m > 3? colors[3]:
          m > 2? colors[2]:
          m > 1? colors[1]:
                 colors[0];
};

function createFeatures(earthquakeData) {

  var earthquakes = L.geoJSON(earthquakeData,{
    // Give each feature a popup describing the information pertinent to it
    onEachFeature: function(feature, layer){
      layer.bindPopup("<h3 > Magnitude: "+ feature.properties.mag + 
      "</h3><h3>Location: " + feature.properties.place +
      "</h3><hr><h3>" + new Date(feature.properties.time) + "</h3>" );
    },

    pointToLayer: function(feature, latlng){
      return new L.circle(latlng,
      { radius: markerSize(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: .8,
        color: 'grey',
        weight: .5
      })
    }    
  });

  createMap(earthquakes);
};  
  
function createMap(earthquakes) {

  // Define lightmap, outdoorsmap, and satellitemap layers
  let mapboxUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}';
  let accessToken = 'pk.eyJ1Ijoic2FyYWhsZXdrIiwiYSI6ImNqd3NsZ2drMjF2Z2g0NG82ZGtvZHdyNmwifQ.cXwY5IsGq6PhDXkLw4eZ1A';
  let lightmap = L.tileLayer(mapboxUrl, {id: 'mapbox.light', maxZoom: 20, accessToken: accessToken});
  let outdoorsmap = L.tileLayer(mapboxUrl, {id: 'mapbox.run-bike-hike', maxZoom: 20, accessToken: accessToken});
  let satellitemap = L.tileLayer(mapboxUrl, {id: 'mapbox.streets-satellite', maxZoom: 20, accessToken: accessToken});

  
  var tectonicPlates = new L.LayerGroup();
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function (plateData) {
    L.geoJSON(plateData,
      {
        color: 'violet',
        weight: 2
      })
      .addTo(tectonicPlates);
  });    

  // Define a baseMaps object to hold base layers
  var baseMaps = {
    "Grayscle": lightmap,
    "Outdoors": outdoorsmap,
    "Satellite Map" : satellitemap
  };
  
  // Create overlay object to hold overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
  };

    // Create our map, giving it the lightmap and earthquakes layers to display upon loading
  var myMap = L.map("map-id", {
    center: [39.8283, -98.5795],
    zoom: 3,
    layers: [lightmap, earthquakes]
  });

  // Create a layer control
  // Pass in baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  
  // Create a legend to display information in the bottom right
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function(map) {

    var div = L.DomUtil.create('div','info legend'),
        magnitudes = [0,1,2,3,4,5],
        labels = [];

    div.innerHTML += "<h4 style='margin:4px'>Magnitude</h4>" 
    // Loop through density intervals and generate a label for each interval
    for (var i=0; i < magnitudes.length; i++){
      div.innerHTML +=
        '<i style="background:' + getColor(magnitudes[i] + 1) + '"></i> ' +
        magnitudes[i] + (magnitudes[i+1]?'&ndash;' + magnitudes[i+1] +'<br>': '+');
      }
      return div;
  };
  legend.addTo(myMap);
}