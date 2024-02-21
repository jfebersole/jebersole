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
            const cellContent = (header === 'Logo') ? `<img src="${row[header]}" alt="Image" style="width: 80; height: 80;">` : row[header];
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
        const tableHtml = buildTable(breweryObject);

        // Display the table in the specified container
        document.getElementById('brewery-container').innerHTML = tableHtml;

        // Set up event listeners for sorting
        var sortableHeaders = document.querySelectorAll(".sortable");
        for (var i = 0; i < sortableHeaders.length; i++) {
            sortableHeaders[i].addEventListener("click", function () {
                var column = this.cellIndex;
                sortTable(column);
            });
        }
    });

// var sortingDirections = {}; // Store sorting directions for each column

// function sortTable(column) {
//     var table, rows, switching, i, x, y, shouldSwitch;
//     table = document.getElementById("breweryTable");
//     switching = true;

//     // Determine the sorting direction for this column
//     if (!sortingDirections[column]) {
//         // if column is brewry rating, sort descending
//         if (column === 2) {
//             sortingDirections[column] = "desc";
//         } else {
//             sortingDirections[column] = "asc";
//         } 
//     } else {
//         sortingDirections[column] = sortingDirections[column] === "asc" ? "desc" : "asc";
//     }

//     while (switching) {
//         switching = false;
//         rows = table.rows;

//         for (i = 0; i < rows.length - 1; i++) {
//             shouldSwitch = false;

//             x = rows[i].getElementsByTagName("td")[column];
//             y = rows[i + 1].getElementsByTagName("td")[column];

//             var shouldSortAsNumber = x.dataset.sort === "number";

//             var xValue = shouldSortAsNumber ? parseFloat(x.textContent) : x.textContent.toLowerCase();
//             var yValue = shouldSortAsNumber ? parseFloat(y.textContent) : y.textContent.toLowerCase();

//             // Check if the rows should be switched
//             if (
//                 (sortingDirections[column] === "asc" && xValue > yValue) ||
//                 (sortingDirections[column] === "desc" && xValue < yValue)
//             ) {
//                 shouldSwitch = true;
//                 break;
//             }
            
//             // If Ranking values are equal, sort by brewery (ascending)
//             if (xValue === yValue && column === 2) {
//                 var breweryX = rows[i].getElementsByTagName("td")[0].textContent;
//                 var breweryY = rows[i + 1].getElementsByTagName("td")[0].textContent;

//                 if (breweryX > breweryY) {
//                     shouldSwitch = true;
//                     break;
//                 }
//             }
//         }

//         if (shouldSwitch) {
//             rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
//             switching = true;
//         }
//     }

//     // Reset sorting indicators
//     var headers = document.querySelectorAll(".sortable");
//     for (var i = 0; i < headers.length; i++) {
//         headers[i].classList.remove("asc", "desc");
//     }

//     // Set the sorting indicator on the clicked column
//     var header = headers[column];
//     header.classList.toggle(sortingDirections[column]);
// }

// var sortableHeaders = document.querySelectorAll(".sortable");

// for (var i = 0; i < sortableHeaders.length; i++) {
//     sortableHeaders[i].addEventListener("click", function () {
//         var column = this.cellIndex;
//         sortTable(column);
//     });
// }




