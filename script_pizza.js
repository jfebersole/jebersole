// URL to your JSON file on GitHub
const jsonUrl = 'https://raw.githubusercontent.com/jfebersole/jebersole/main/pizzerias.geojson';

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


// Function to build an HTML table from GeoJSON data
function buildTable(data) {
    // Check if data is empty or undefined
    if (!data || data.length === 0) {
        return '<p>No data available</p>';
    }

    // Specify the columns you want to display
    const desiredColumns = ['Pizzeria', 'Style', 'Rating', 'Notes', 'State'];

    // Build the table header
    const headerRow = `<tr>${desiredColumns.map(header => `<th class="sortable">${header}</th>`).join('')}</tr>`;

    // Build the table body
    const bodyRows = data.map(feature => {
        const cells = desiredColumns.map(header => {
            return `<td>${feature.properties[header]}</td>`;
        });
        return `<tr>${cells.join('')}</tr>`;
    });

    // Combine header and body to create the HTML table
    return `<table>${headerRow}${bodyRows.join('')}</table>`;
}


// Fetch JSON data and display the table
fetchJsonData(jsonUrl)
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

function sortTable(column) {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById("pizzeriaTable");
    switching = true;

    // Determine the sorting direction for this column
    if (!sortingDirections[column]) {
        // if rating column, set to "desc" on first click
        sortingDirections[column] = column === 2 ? "desc" : "asc";
    } else {
        sortingDirections[column] = sortingDirections[column] === "asc" ? "desc" : "asc";
    }

    while (switching) {
        switching = false;
        rows = table.rows;

        for (i = 0; i < rows.length - 1; i++) {
            shouldSwitch = false;

            x = rows[i].getElementsByTagName("td")[column];
            y = rows[i + 1].getElementsByTagName("td")[column];

            var shouldSortAsNumber = x.dataset.sort === "number";

            var xValue = shouldSortAsNumber ? parseFloat(x.textContent) : x.textContent.toLowerCase();
            var yValue = shouldSortAsNumber ? parseFloat(y.textContent) : y.textContent.toLowerCase();

            // Check if the rows should be switched
            if (
                (sortingDirections[column] === "asc" && xValue > yValue) ||
                (sortingDirections[column] === "desc" && xValue < yValue)
            ) {
                shouldSwitch = true;
                break;
            }
            
            // If Ranking values are equal, sort by Pizzeria (ascending)
            if (xValue === yValue && column === 2) {
                var pizzeriaX = rows[i].getElementsByTagName("td")[0].textContent;
                var pizzeriaY = rows[i + 1].getElementsByTagName("td")[0].textContent;

                if (pizzeriaX > pizzeriaY) {
                    shouldSwitch = true;
                    break;
                }
            }
        }

        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }

    // Reset sorting indicators
    var headers = document.querySelectorAll(".sortable");
    for (var i = 0; i < headers.length; i++) {
        headers[i].classList.remove("asc", "desc");
    }

    // Set the sorting indicator on the clicked column
    var header = headers[column];
    header.classList.toggle(sortingDirections[column]);
}

var sortableHeaders = document.querySelectorAll(".sortable");

for (var i = 0; i < sortableHeaders.length; i++) {
    sortableHeaders[i].addEventListener("click", function () {
        var column = this.cellIndex;
        sortTable(column);
    });
}









