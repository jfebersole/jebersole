// create JSON object with beer data
var beerObject = require('./beer_data_test.json');


  var sortingDirections = {}; // Store sorting directions for each column

  function sortTable(column) {
      var table, rows, switching, i, x, y, shouldSwitch;
      table = document.getElementById("beerTable");
      switching = true;
  
    // Determine the sorting direction for this column
    if (!sortingDirections[column]) {
        // if column is My Rating, Global Rating, or ABV, sort descending
        if (column === 5 || column === 6 || column === 4) {
            sortingDirections[column] = "desc";
        } else {
            sortingDirections[column] = "asc";
        }
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

            var xValue = shouldSortAsNumber ? parseFloat(x.getAttribute ) : x.textContent.toLowerCase();
            var yValue = shouldSortAsNumber ? parseFloat(y.textContent) : y.textContent.toLowerCase();
            
            // if ABV column, sort by data-abv attribute
            if (column === 4) {
                xValue = shouldSortAsNumber ? parseFloat(x.getAttribute("data-abv")) : parseFloat(x.getAttribute("data-abv"));
                yValue = shouldSortAsNumber ? parseFloat(y.getAttribute("data-abv")) : parseFloat(y.getAttribute("data-abv"));
            }

            // Check if the rows should be switched
            if (
                (sortingDirections[column] === "asc" && xValue > yValue) ||
                (sortingDirections[column] === "desc" && xValue < yValue)
            ) {
                shouldSwitch = true;
                break;
            }
            
            // If Ranking values are equal, sort by beer (ascending)
            if (xValue === yValue && column === 2) {
                var beerX = rows[i].getElementsByTagName("td")[0].textContent;
                var beerY = rows[i + 1].getElementsByTagName("td")[0].textContent;

                if (beerX > beerY) {
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
  
// Populate the table with beer data
var beerTableBody = document.getElementById("beerTable");

for (var i = 0; i < beerObject.length; i++) {
    var beer = beerObject[i];
    var row = document.createElement("tr");

    // add Image URL
    var imageUrlCell = document.createElement("td");
    var image = document.createElement("img");
    image.src = beer['Image URL']; // Set the src attribute to the URL
    imageUrlCell.appendChild(image);
    row.appendChild(imageUrlCell);

    // add columns Beer Brewery Name Style ABV My Rating Global Rating
    var beerNameCell = document.createElement("td");
    beerNameCell.textContent = beer['Beer Name'];
    row.appendChild(beerNameCell);

    var breweryNameCell = document.createElement("td");
    breweryNameCell.textContent = beer['Brewery Name'];
    row.appendChild(breweryNameCell);

    var styleCell = document.createElement("td");
    styleCell.textContent = beer['Style'];
    row.appendChild(styleCell);

    // var abvCell = document.createElement("td");
    // // Strip % from ABV  and store as data attribute
    // var abv = beer['ABV'].replace('%', '');
    // abvCell.setAttribute("data-abv", abv);
    // // Format and display the percentage in the cell
    // // abvCell.textContent = (beer['ABV'] * 100).toFixed(2) + '%';
    // abvCell.textContent = beer['ABV'];
    // row.appendChild(abvCell);

    // Create a table cell for ABV
    var abvCell = document.createElement("td");
    var abvString = beer['ABV'];
    var abvNumber = parseFloat(abvString.replace('%', '')); // Remove '%' and parse the string as a number
    abvCell.textContent = abvString;
    abvCell.setAttribute('data-abv', abvNumber); // Store the parsed number for sorting
    row.appendChild(abvCell);

    var myRatingCell = document.createElement("td");
    myRatingCell.textContent = beer['My Rating'];
    row.appendChild(myRatingCell);

    var globalRatingCell = document.createElement("td");
    globalRatingCell.textContent = beer['Global Rating'];
    row.appendChild(globalRatingCell);

    beerTableBody.appendChild(row);
}

