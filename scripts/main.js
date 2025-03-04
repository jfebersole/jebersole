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
            if (header === imageColumn && row[header]) {
                return `<td><img src="${row[header]}" alt="Image" style="max-height: 100px;" onerror="this.style.display='none';"></td>`;
            } else if (header === imageColumn) {
                return `<td></td>`; // Empty cell for missing images
            } else {
                return `<td>${row[header]}</td>`;
            }
        });
        return `<tr>${cells.join('')}</tr>`;
    });

    document.getElementById(containerId).innerHTML = `<table>${headerRow}${bodyRows.join('')}</table>`;
};

// Load and display brewery, beer, and pizzeria tables if those elements exist
(async function() {
    if (document.getElementById('breweryTable')) {
        const breweryData = await fetchJsonData(breweryJsonUrl);
        buildHtmlTable(breweryData, 'breweryTable', 'Logo');
    }

    if (document.getElementById('beerTable')) {
        const beerData = await fetchJsonData(beerJsonUrl);
        buildHtmlTable(beerData, 'beerTable', 'Label');
    }

    if (document.getElementById('pizzeriaTable')) {
        const pizzaDataGeoJson = await fetchJsonData(pizzaGeoJsonUrl);
        if (pizzaDataGeoJson && pizzaDataGeoJson.features) {
            const pizzaData = pizzaDataGeoJson.features.map(feature => {
                return {
                    ...feature.properties,
                    Image: `../images/${feature.properties.Image}`
                };
            });
            buildHtmlTable(pizzaData, 'pizzeriaTable', 'Image');
        }
    }
    if (document.getElementById('pizzeria-count')) {
        const pizzaDataGeoJson = await fetchJsonData(pizzaGeoJsonUrl);
        if (pizzaDataGeoJson && pizzaDataGeoJson.features) {
          const pizzeriaContainer = document.getElementById('pizzeria-count');
          pizzeriaContainer.innerHTML = ''; // clear previous content
          for (let i = 0; i < pizzaDataGeoJson.features.length; i++) {
            const img = document.createElement('img');
            img.src = '../images/icon_pizza.png';
            img.alt = 'Pizza Icon';
            // Set image size and reduce spacing between icons
            img.style.width = '25px';
            img.style.height = 'auto';
            img.style.margin = '2px';
            pizzeriaContainer.appendChild(img);
          }
        }
      }
      
      if (document.getElementById('beer-count')) {
        const beerData = await fetchJsonData(beerJsonUrl);
        if (beerData) {
          const beerContainer = document.getElementById('beer-count');
          beerContainer.innerHTML = ''; // clear previous content
          for (let i = 0; i < beerData.length; i++) {
            const img = document.createElement('img');
            img.src = '../images/icon_beer.png';
            img.alt = 'Beer Icon';
            // Set image size and reduce spacing between icons
            img.style.width = '25px';
            img.style.height = 'auto';
            img.style.margin = '2px';
            beerContainer.appendChild(img);
          }
        }
      }
      
      
      
    // if (document.getElementById('pizzeria-count')) {
    //     const pizzaDataGeoJson = await fetchJsonData(pizzaGeoJsonUrl);
    //     if (pizzaDataGeoJson && pizzaDataGeoJson.features) {
    //         document.getElementById('pizzeria-count').textContent = pizzaDataGeoJson.features.length;
    //     }
    // }

    // if (document.getElementById('beer-count')) {
    //     const beerData = await fetchJsonData(beerJsonUrl);
    //     if (beerData) {
    //         document.getElementById('beer-count').textContent = beerData.length;
    //     }
    // }
})();

// Map-related code only runs if the page has an element with the id "map"
if (document.getElementById('map')) {

    // Initialize Leaflet map
    var map = L.map('map', { zoomControl: false, maxZoom: 16 });
    L.tileLayer('http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}').addTo(map);
    // Center the map on the continental U.S.
    map.setView([34.8, -96], 4); // Latitude, Longitude, Zoom Level

    // Custom icons
    var customIconPizza = L.icon({ iconUrl: '../images/icon_pizza.png', iconSize: [32, 32], iconAnchor: [32, 32] });
    var customIconBeer = L.icon({ iconUrl: '../images/icon_beer.png', iconSize: [32, 32], iconAnchor: [32, 32] });

    // Create marker clusters for pizzerias and breweries
    var pizzeriaCluster = L.markerClusterGroup({
        maxClusterRadius: 25,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: false,
        iconCreateFunction: function(cluster) {
            return L.icon({
                iconUrl: '../images/icon_pizza.png',
                iconSize: [32, 32],
                iconAnchor: [32, 32]
            });
        }
    });

    var breweryCluster = L.markerClusterGroup({
        maxClusterRadius: 25,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: false,
        iconCreateFunction: function(cluster) {
            return L.icon({
                iconUrl: '../images/icon_beer.png',
                iconSize: [32, 32],
                iconAnchor: [32, 32]
            });
        }
    });

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

        // Function to create a pizzeria marker and pop-up
        const createPizzeriaMarker = (feature) => {
            if (!feature.geometry || !feature.geometry.coordinates) {
                console.warn("Skipping invalid pizzeria feature:", feature);
                return;
            }

            const latlng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]; // Flip lat/lng
            const imageUrl = feature.properties.Image ? `../images/${feature.properties.Image}` : '';
            const notes = feature.properties.Notes ? `<p style="margin: 5px 0;">Notes: ${feature.properties.Notes}</p>` : '';

            const popupContent = `
                <div style="min-width: 250px; max-width: 300px; text-align: left; max-height: 300px; overflow-y: auto; padding-right: 5px;">
                    <h2 style="margin: 0;">${feature.properties.Pizzeria}</h2>
                    <p style="margin: 5px 0;">Rating: ${feature.properties.Rating}</p>
                    ${notes}
                    ${imageUrl ? `<img src="${imageUrl}" alt="${feature.properties.Pizzeria}" style="width: 100%; min-width: 250px; max-width: 300px; height: auto; object-fit: cover; margin-top: 10px;" onerror="this.style.display='none';">` : ''}
                </div>
            `;

            const marker = L.marker(latlng, { icon: customIconPizza }).bindPopup(popupContent);
            pizzeriaCluster.addLayer(marker);
        };

        // Function to create a brewery marker and pop-up
        const createBreweryMarker = (feature) => {
            if (!feature.geometry || !feature.geometry.coordinates) {
                console.warn("Skipping invalid brewery feature:", feature);
                return;
            }

            const latlng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]; // Flip lat/lng
            const breweryName = feature.properties['Brewery Name'];
            const beers = beerData.filter(beer => beer.Brewery === breweryName);

            const beerList = beers.map(beer => `
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${beer.Label ? `<img src="${beer.Label}" alt="${beer.Beer}" style="width: 50px; height: auto; object-fit: contain;" onerror="this.style.display='none';">` : ''}
                    <div>
                        <strong>${beer.Beer}</strong> (${beer['My Rating']})
                    </div>
                </div>
            `).join('');

            const popupContent = `
                <h2>${breweryName}</h2>
                <div style="max-height: 300px; overflow-y: auto; padding-right: 5px;">
                    ${beerList}
                </div>
            `;

            const marker = L.marker(latlng, { icon: customIconBeer }).bindPopup(popupContent);
            breweryCluster.addLayer(marker);
        };

        // Add pizzeria markers to cluster group
        if (pizzaData && pizzaData.features) {
            pizzaData.features.forEach(createPizzeriaMarker);
        }

        // Add brewery markers to cluster group
        if (breweryData && breweryData.features) {
            breweryData.features.forEach(createBreweryMarker);
        }

        // Cluster click events to zoom in
        breweryCluster.on('clusterclick', function (event) {
            map.flyTo(event.latlng, Math.min(map.getZoom() + 2, 14), {
                duration: 0.5, 
                easeLinearity: 0.1
            });
        });
        
        pizzeriaCluster.on('clusterclick', function (event) {
            map.flyTo(event.latlng, Math.min(map.getZoom() + 2, 14), {
                duration: 0.5, 
                easeLinearity: 0.1
            });
        });

        // Add clusters to map
        map.addLayer(pizzeriaCluster);
        map.addLayer(breweryCluster);

        // Checkbox event listeners to toggle layers
        const pizzeriaCheckbox = document.getElementById('pizzeria-checkbox');
        const breweryCheckbox = document.getElementById('brewery-checkbox');

        if (pizzeriaCheckbox) {
            pizzeriaCheckbox.addEventListener('change', function() {
                this.checked ? map.addLayer(pizzeriaCluster) : map.removeLayer(pizzeriaCluster);
            });
        }

        if (breweryCheckbox) {
            breweryCheckbox.addEventListener('change', function() {
                this.checked ? map.addLayer(breweryCluster) : map.removeLayer(breweryCluster);
            });
        }
    })();
}
