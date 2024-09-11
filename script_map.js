// Initialize the map with zoom control enabled
var map = L.map('map', {
  zoomControl: true,
  maxZoom: 16
});

// Add Esri Light Gray Base layer
var Esri_LightGrayBase = L.tileLayer('http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}');
Esri_LightGrayBase.addTo(map);

// Set the view to the center of the US
map.setView([39.8283, -98.5795], 4);

// URLs for pizzeria and brewery GeoJSON files
const pizzaUrl = 'https://raw.githubusercontent.com/jfebersole/jebersole/main/pizzerias.geojson';
const breweryUrl = 'https://raw.githubusercontent.com/jfebersole/jebersole/main/brewery_data.geojson';
const beerUrl = 'https://raw.githubusercontent.com/jfebersole/jebersole/main/beer_data.json';

// Declare variables for layers and marker clusters
var pizzeriaLayer, markerClusterPizza, breweryLayer, markerClusterBrewery;

// Custom icons for pizzerias and breweries
var customIconPizza = L.icon({
  iconUrl: 'icon_pizza.png',
  iconSize: [64, 64],
  iconAnchor: [32, 32]
});

var customIconBeer = L.icon({
  iconUrl: 'icon_beer.png',
  iconSize: [64, 64],
  iconAnchor: [32, 32]
});

// Create and add the legend control
var legend = L.control({ position: 'topleft' });
legend.onAdd = function () {
  var div = L.DomUtil.create('div', 'info legend-container');
  div.innerHTML = '<h2>Layers</h2>' +
    '<div id="brewery-legend"><label class="container"><p>Breweries</p><input type="checkbox" id="brewery-checkbox" checked><span class="checkmark"></span></label></div>' +
    '<div id="pizzeria-legend"><label class="container"><p>Pizzerias</p><input type="checkbox" id="pizzeria-checkbox" checked><span class="checkmark"></span></label></div>';
  return div;
};
legend.addTo(map);

// Fetch and process pizzeria data
fetch(pizzaUrl)
  .then(response => response.json())
  .then(data => {
    pizzeriaLayer = L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        var marker = L.marker(latlng, { icon: customIconPizza });
        var props = feature.properties;
        var popupContent = `<h2>${props.Pizzeria}</h2>
          <p>Rating: ${props.Rating}</p>
          <p>Style: ${props.Style}</p>
          <p>Notes: ${props.Notes}</p>`;
        if (props.Image) {
          popupContent += `<img src='${props.Image}' alt='Pizzeria Image' style='width: 100%;'>`;
        }
        marker.bindPopup(`<div class="custom-popup">${popupContent}</div>`);
        return marker;
      }
    });

    // Create a marker cluster group with full zoom behavior
    markerClusterPizza = L.markerClusterGroup({
      maxClusterRadius: 1,  // Force icons to display as markers at full zoom
      iconCreateFunction: function (cluster) {
        return L.divIcon({
          html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
          className: 'pizza-cluster',
          iconSize: [40, 40]
        });
      }
    });

    markerClusterPizza.addLayer(pizzeriaLayer);
    map.addLayer(markerClusterPizza);

    // Update checkbox functionality
    document.getElementById('pizzeria-checkbox').addEventListener('change', function () {
      if (this.checked) {
        map.addLayer(markerClusterPizza);
      } else {
        map.removeLayer(markerClusterPizza);
      }
    });
  })
  .catch(error => console.error('Error fetching pizzeria data:', error));

// Fetch and process brewery data
fetch(breweryUrl)
  .then(response => response.json())
  .then(data => {
    breweryLayer = L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        return L.marker(latlng, { icon: customIconBeer }).bindPopup(`<div class="custom-popup"><h3>${feature.properties['Brewery Name']}</h3></div>`);
      }
    });

    markerClusterBrewery = L.markerClusterGroup({
      maxClusterRadius: 1,  // Force icons to display as markers at full zoom
      iconCreateFunction: function (cluster) {
        return L.divIcon({
          html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
          className: 'beer-cluster',
          iconSize: [40, 40]
        });
      }
    });

    markerClusterBrewery.addLayer(breweryLayer);
    map.addLayer(markerClusterBrewery);

    // Update checkbox functionality
    document.getElementById('brewery-checkbox').addEventListener('change', function () {
      if (this.checked) {
        map.addLayer(markerClusterBrewery);
      } else {
        map.removeLayer(markerClusterBrewery);
      }
    });

    // Fetch and process beer data AFTER breweryLayer is ready
    fetch(beerUrl)
      .then(response => response.json())
      .then(beerData => {
        breweryLayer.eachLayer(function (layer) {
          var breweryName = layer.feature.properties["Brewery Name"];
          var beers = beerData.filter(beer => beer["Brewery"] === breweryName);
          var popupContent = `<h2>${breweryName}</h2><h3>Rated Beers:</h3>`;

          beers.forEach(beer => {
            popupContent += `<div style='display: flex; align-items: center;'>
              <img src='${beer["Label"]}' alt='Beer Image' style='width: 65px; height: 65px; margin-right: 10px;'>
              <div><p>${beer["Beer"]}</p><p>My Rating: ${beer["My Rating"]}</p><p>Untappd: ${beer["Untappd Rating"]}</p></div>
              </div>`;
          });

          layer.bindPopup(`<div class="custom-popup">${popupContent}</div>`);
        });
      })
      .catch(error => console.error('Error fetching beer data:', error));
  })
  .catch(error => console.error('Error fetching brewery data:', error));

// CSS for the popups
var style = document.createElement('style');
style.innerHTML = `
  .custom-popup {
    max-height: 200px;
    overflow-y: auto;
    width: 300px;
  }
  .leaflet-popup-content {
    overflow: visible !important;
  }
  .leaflet-popup-content-wrapper {
    overflow: hidden;
  }
`;
document.head.appendChild(style);
