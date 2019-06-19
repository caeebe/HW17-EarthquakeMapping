// Store our API endpoints
var quakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
var faultUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URL
d3.json(quakeUrl, function(quakeData) {
    d3.json(faultUrl, function(faultData){
        var faultLines = markFaults(faultData);
      // Once we have both sets of data we store the faults and mark the quakes
      markQuakes(quakeData.features, faultLines);
    });
});

// This will be run when L.geoJSON creates the point layer from the GeoJSON data.
function createCircleMarker(feature, latlng) {
  // Change the values of these options to change the symbol's appearance
  //http://using-d3js.com/04_05_sequential_scales.html
     var color = d3.interpolateHsl("lime", "red")(feature.properties.mag/5); 
    //var color = d3.interpolateRainbow(feature.properties.mag/5);
    let options = {
        radius: feature.properties.mag * feature.properties.mag,
        fillColor: color,
        color: color,
        weight: 1,
        opacity: 1,
        fillOpacity: .75
    }
  return L.circleMarker( latlng, options );
}

// Define a function we want to run once for each feature in the features array
// Give each feature a popup describing the place and time of the earthquake
function onEachFeature(feature, layer) {
  layer.bindPopup(
      "<strong>Magnitude: " + feature.properties.mag + "</strong><hr>" +
      "<h3>" + feature.properties.place + "</h3><hr>" +
      "<p>" + new Date(feature.properties.time).toLocaleString('en-US',{timeZoneName: "short"}) + "</p>"
  );
}

function markQuakes(earthquakeData, faultLayer) {

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: createCircleMarker,
      onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  //createMap(earthquakes, earthquakes);
    createMap(earthquakes, faultLayer);
}

function markFaults(faultData){
    var faults = L.geoJSON(faultData);
        
    return faults;
}

function createMap(quakes, faults) {

  // Define streetmap and darkmap layers
  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var satmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var outmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });
    
  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Light Map": lightmap,
    "Satellite Map": satmap,
      "Outdoors Map": outmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
      "Earthquakes": quakes,
      "Fault Lines": faults
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [0, 0],
    zoom: 2,
    layers: [lightmap, quakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
    
    // Create a legend to display information about our map
    var legend = L.control({
        position: "bottomright"
    });
    legend.onAdd = function (myMap) {
        var div = L.DomUtil.create('div', 'info legend'),
        magnitude = [1, 2, 3, 4, 5, 6],
        color = [];
        div.innerHTML = "<h4>MAG</h4>";
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < magnitude.length; i++) {
            div.innerHTML +=
                '<i style="background:' + d3.interpolateHsl("lime", "red")(magnitude[i]/5) + '"></i> ' +
                magnitude[i] + (magnitude[i + 1] ? ' ' + '<br>' : '+');
        }
        return div;
    };

    legend.addTo(myMap);
    
}
