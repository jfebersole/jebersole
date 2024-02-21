// URL to your JSON file on GitHub
const jsonUrl = 'https://raw.githubusercontent.com/jfebersole/jebersole/main/VORB_data.json';

var breweryObject;

// Function to fetch JSON data
async function fetchJsonData(url) {
    try {
        const response = await fetch(url);
        breweryObject = await response.json();
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
            const cellContent = (header === 'Logo') ? `<img src="${row[header]}" alt="Image" style="height: 80px;">` : row[header];
            return `<td>${cellContent}</td>`;
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
        const tableHtml = buildTable(breweryObject);

        // Display the table in the specified container
        document.getElementById('brewery-container').innerHTML = tableHtml;
    });
