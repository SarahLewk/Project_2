// Perform API call to json file to get mortgage data
d3.json("../Data/mergeDatajson.json", function(mortgageData) {
  createFeatures(mortgageData);
});

// Function to scale the Days to Liquidate 
function markerSize(days) {
  return days * 30000;
};


// Function to assign color depending on Exit Category
function getColor(m) {

  var colors = ['red','darkorange','yellow','greenyellow','green','lightblue', 'mediumblue', 'plum', 'darkmagenta'];

return  m === 8? colors[8]:
        m === 7? colors[7]:
        m === 6? colors[6]:
        m === 5? colors[5]:
        m === 4? colors[4]:
        m === 3? colors[3]:
        m === 2? colors[2]:
        m === 1? colors[1]:
               colors[0];
};

function createFeatures(mortgageData) {
  console.log(mortgageData);

  var i=0;

  var mortgage = L.geoJSON([mortgageData[i]],{
  // Give each feature a popup describing the information pertinent to it
  onEachFeature: function(layer){
      layer.bindPopup("<h3 > Days to Liquidate: "+ ["Days_to_Liquidate"] + 
      "</h3><hr><h3>Address: " + Full_Address + "</h3>");
  },
   

  pointToLayer: function(latlng){
    return new L.circle(latlng,
      { radius: markerSize(["Days to Liquidate"]),
      fillColor: getColor(MainCategoryDesc),
      fillOpacity: .8,
      color: 'grey',
      weight: .5
    })
  }    
});

createMap(mortgage);

};      



function createMap(mortgage) {

// Define lightmap, outdoorsmap, and satellitemap layers
let mapboxUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}';
let accessToken = 'pk.eyJ1Ijoic2FyYWhsZXdrIiwiYSI6ImNqd3NsZ2drMjF2Z2g0NG82ZGtvZHdyNmwifQ.cXwY5IsGq6PhDXkLw4eZ1A';
let lightmap = L.tileLayer(mapboxUrl, {id: 'mapbox.light', maxZoom: 20, accessToken: accessToken});
let outdoorsmap = L.tileLayer(mapboxUrl, {id: 'mapbox.run-bike-hike', maxZoom: 20, accessToken: accessToken});
let satellitemap = L.tileLayer(mapboxUrl, {id: 'mapbox.streets-satellite', maxZoom: 20, accessToken: accessToken});

   

// Define a baseMaps object to hold base layers
var baseMaps = {
  "Grayscle": lightmap,
  "Outdoors": outdoorsmap,
  "Satellite Map" : satellitemap
};


// Create overlay object to hold overlay layer
var overlayMaps = {
  "Mortgage": mortgage,
};

  // Create our map, giving it the lightmap and mortgage layers to display upon loading
var myMap = L.map("map-id", {
  center: [39.8283, -98.5795],
  zoom: 3,
  layers: [lightmap, mortgage]
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
  MainCategoryDesc = [0,1,2,3,4,5,6,7,8],
  // MainCategoryDesc = ["Buy Back","Foreclosure Auction","Full Payoff","Note Sale - NPL","Note Sale - PL","Note Sale - RPL","REO Sale DIL", "REO Sale FCL", "Short Payoff" ],
      labels = [];
  
  

  div.innerHTML += "<h4 style='margin:4px'>Exit Category</h4>" 
  // Loop through density intervals and generate a label for each interval
  for (var i=0; i = MainCategoryDesc.length; i++){
    div.innerHTML +=
      '<i style="background:' + getColor(MainCategoryDesc[i]) + '"></i> ' +
      MainCategoryDesc[i] + (MainCategoryDesc[i+1]? + MainCategoryDesc[i] +'<br>': '+');
    }
    return div;
};
legend.addTo(myMap);
}