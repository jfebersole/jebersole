// URLs to your JSON files on GitHub
const breweryJsonUrl = 'https://raw.githubusercontent.com/jfebersole/jebersole/main/data/VORB_data.json';
const beerJsonUrl = 'https://raw.githubusercontent.com/jfebersole/jebersole/main/data/beer_data.json';
const pizzaGeoJsonUrl = 'https://raw.githubusercontent.com/jfebersole/jebersole/main/data/pizzerias.geojson';
const breweryGeoJsonUrl = 'https://raw.githubusercontent.com/jfebersole/jebersole/main/data/brewery_data.geojson';

// Fetch JSON data utility function
async function fetchJsonData(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Error fetching JSON data:', error);
        return null;
    }
}

// Function to build an HTML table from JSON data
globalThis.buildHtmlTable = function(data, containerId, imageColumn) {
    if (!data || data.length === 0) {
        document.getElementById(containerId).innerHTML = '<p>No data available</p>';
        return;
    }

    const headers = Object.keys(data[0]);
    const headerRow = `<tr>${headers.map(header => `<th class="sortable">${header}</th>`).join('')}</tr>`;

    const bodyRows = data.map(row => {
        const cells = headers.map(header => {
            const cellContent = (header === imageColumn) ? `<img src="${row[header]}" alt="Image" style="max-height: 100px;">` : row[header];
            return `<td>${cellContent}</td>`;
        });
        return `<tr>${cells.join('')}</tr>`;
    });

    document.getElementById(containerId).innerHTML = `<table>${headerRow}${bodyRows.join('')}</table>`;
};

// Load and display brewery and beer data
(async function() {
    const breweryData = await fetchJsonData(breweryJsonUrl);
    buildHtmlTable(breweryData, 'brewery-container', 'Logo');

    const beerData = await fetchJsonData(beerJsonUrl);
    buildHtmlTable(beerData, 'beer-container', 'Label');
})();

// Initialize Leaflet map
var map = L.map('map', { zoomControl: false, maxZoom: 16 });
L.tileLayer('http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}').addTo(map);
map.setView([39.8283, -98.5795], 4);

// Custom icons
var customIconPizza = L.icon({ iconUrl: 'images/icon_pizza.png', iconSize: [64, 64], iconAnchor: [32, 32] });
var customIconBeer = L.icon({ iconUrl: 'images/icon_beer.png', iconSize: [64, 64], iconAnchor: [32, 32] });

// Add legend control
var legend = L.control({ position: 'topleft' });
legend.onAdd = function() {
    var div = L.DomUtil.create('div', 'info legend-container');
    div.innerHTML = '<h2>Layers</h2>' +
        '<div><label><input type="checkbox" id="brewery-checkbox" checked> Breweries</label></div>' +
        '<div><label><input type="checkbox" id="pizzeria-checkbox" checked> Pizzerias</label></div>';
    return div;
};
legend.addTo(map);

// Fetch and process GeoJSON data for pizzerias and breweries
(async function() {
    const [pizzaData, breweryData, beerData] = await Promise.all([
        fetchJsonData(pizzaGeoJsonUrl),
        fetchJsonData(breweryGeoJsonUrl),
        fetchJsonData(beerJsonUrl)
    ]);

    var pizzeriaLayer = L.geoJSON(pizzaData, {
        pointToLayer: (feature, latlng) => L.marker(latlng, { icon: customIconPizza })
            .bindPopup(`<h2>${feature.properties.Pizzeria}</h2><p>Rating: ${feature.properties.Rating}</p>`)
    });

    var breweryLayer = L.geoJSON(breweryData, {
        pointToLayer: (feature, latlng) => {
            var marker = L.marker(latlng, { icon: customIconBeer });
            var breweryName = feature.properties['Brewery Name'];
            var beers = beerData.filter(beer => beer.Brewery === breweryName);
            var beerList = beers.map(beer => `<p>${beer.Beer} (Rating: ${beer['My Rating']})</p>`).join('');
            marker.bindPopup(`<h2>${breweryName}</h2>${beerList}`);
            return marker;
        }
    });

    var markerClusterPizza = L.markerClusterGroup().addLayer(pizzeriaLayer).addTo(map);
    var markerClusterBrewery = L.markerClusterGroup().addLayer(breweryLayer).addTo(map);

    document.getElementById('pizzeria-checkbox').addEventListener('change', function() {
        this.checked ? map.addLayer(markerClusterPizza) : map.removeLayer(markerClusterPizza);
    });

    document.getElementById('brewery-checkbox').addEventListener('change', function() {
        this.checked ? map.addLayer(markerClusterBrewery) : map.removeLayer(markerClusterBrewery);
    });
})();
