// URL to your JSON file on GitHub
const jsonUrl = 'https://raw.githubusercontent.com/jfebersole/jebersole/main/beer_data3.json';

var sortingDirections = {}; // Store sorting directions for each column
var beerObject;

// Function to fetch JSON data
async function fetchJsonData(url) {
    try {
        const response = await fetch(url);
        beerObject = await response.json();
    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }
}

// Function to build an HTML table from JSON data
function buildTable(data) {
    // Assuming data is an array of objects, and the keys represent column headers
    const headers = Object.keys(data[0]);

    // Build the table header
    const headerRow = `<tr>${headers.map(header => `<th class="sortable">${header}</th>`).join('')}</tr>`;

    // Build the table body
    const bodyRows = data.map(row => {
        const cells = headers.map(header => {
            const cellContent = (header === 'Image URL') ? `<img src="${row[header]}" alt="Image">` : row[header];
            return `<td>${cellContent}</td>`;
        });
        return `<tr>${cells.join('')}</tr>`;
    });

    // Combine header and body to create the HTML table
    return `<table>${headerRow}${bodyRows.join('')}</table>`;
}


// Function to sort the table
function sortTable(column) {
    // ... (Your existing sorting logic)
}

// Fetch JSON data and display the table
fetchJsonData(jsonUrl)
    .then(() => {
        // Build the table once the JSON data is fetched
        const tableHtml = buildTable(beerObject);

        // Display the table in the specified container
        document.getElementById('beer-container').innerHTML = tableHtml;

        // Set up event listeners for sorting
        var sortableHeaders = document.querySelectorAll(".sortable");
        for (var i = 0; i < sortableHeaders.length; i++) {
            sortableHeaders[i].addEventListener("click", function () {
                var column = this.cellIndex;
                sortTable(column);
            });
        }
    });
