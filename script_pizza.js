// URL to your JSON file on GitHub
const pizzaUrl = 'https://raw.githubusercontent.com/jfebersole/jebersole/main/pizzerias.geojson';

var pizzaObject;
var sortingDirections = {}; // Store sorting directions for each column

// Function to fetch JSON data
async function fetchJsonData(url) {
    try {
        const response = await fetch(url);
        const geoJsonObject = await response.json();
        pizzaObject = geoJsonObject.features; // Extract features array
    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }
}


// // Function to build an HTML table from GeoJSON data
// function buildTable(data) {
//     // Check if data is empty or undefined
//     if (!data || data.length === 0) {
//         return '<p>No data available</p>';
//     }

//     // Specify the columns you want to display
//     const desiredColumns = ['Pizzeria', 'Style', 'Rating', 'State', 'Notes'];

//     // Build the table header
//     const headerRow = `<tr>${desiredColumns.map(header => `<th class="sortable">${header}</th>`).join('')}</tr>`;

//     // Build the table body
//     const bodyRows = data.map(feature => {
//         const cells = desiredColumns.map(header => {
//             return `<td>${feature.properties[header]}</td>`;
//         });
//         return `<tr>${cells.join('')}</tr>`;
//     });

//     // Combine header and body to create the HTML table
//     return `<table>${headerRow}${bodyRows.join('')}</table>`;
// }

// Function to build an HTML table from GeoJSON data
function buildTable(data) {
    // Check if data is empty or undefined
    if (!data || data.length === 0) {
        return '<p>No data available</p>';
    }

    // Specify the columns you want to display
    const desiredColumns = ['Pizzeria', 'Style', 'Rating', 'State', 'Notes', 'Image'];

    // Build the table header
    const headerRow = `<tr>${desiredColumns.map(header => `<th class="sortable">${header}</th>`).join('')}</tr>`;

    // Build the table body
    const bodyRows = data.map(feature => {
        const cells = desiredColumns.map(header => {
            if (header === 'Image') {
                // Display image in the "Image" column
                return `<td><img src="${feature.properties[header]}" alt="${feature.properties['Pizzeria']} Image"></td>`;
            } else {
                return `<td>${feature.properties[header]}</td>`;
            }
        });
        return `<tr>${cells.join('')}</tr>`;
    });

    // Combine header and body to create the HTML table
    return `<table>${headerRow}${bodyRows.join('')}</table>`;
}


// Fetch JSON data and display the table
fetchJsonData(pizzaUrl)
    .then(() => {
        // Build the table once the JSON data is fetched
        const tableHtml = buildTable(pizzaObject);

        // Display the table in the specified container
        document.getElementById('pizza-container').innerHTML = tableHtml;

        // Set up event listeners for sorting
        var sortableHeaders = document.querySelectorAll(".sortable");
        for (var i = 0; i < sortableHeaders.length; i++) {
            sortableHeaders[i].addEventListener("click", function () {
                var column = this.cellIndex;
                sortTable(column);
            });
        }
    });







