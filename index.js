import XLSX from "./node_modules/xlsx/xlsx.mjs";

document.addEventListener("click", function (event) {
  if (
    event.target.classList.contains("username") ||
    event.target.classList.contains("dialog-number")
  ) {
    const toggleRow = event.target.closest(".toggle-row");
    const showTotal = toggleRow.getAttribute("data-show-total") === "true";
    const dialogNumber = toggleRow.querySelector(".dialog-number");

    if (showTotal) {
      dialogNumber.style.display = "none";
    } else {
      dialogNumber.style.display = "inline";
    }

    toggleRow.setAttribute("data-show-total", !showTotal); // Toggle the data-show-total attribute value
  }
});

document.getElementById("read-button").addEventListener("click", function () {
  const fileInput = document.getElementById("file-input");
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });

      // Assuming there is only one sheet in the Excel file
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert sheet data to JSON format
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      // Generate HTML table from the JSON data
      const table = generateHTMLTable(jsonData);
      document.getElementById("table-container").innerHTML = table;

      // Calculate user totals and display them
      const userTotals = calculateTotalDialogNumbers(jsonData);
      const userTotalsHTML = generateUserTotalsHTML(userTotals);
      document.getElementById("user-totals").innerHTML = userTotalsHTML;
      const sortedUserTotals = sortUserTotalsByDialogNumbers(userTotals);

      console.log(jsonData);
    };

    reader.readAsBinaryString(file);
  } else {
    console.log("Please select an Excel file.");
  }
});

function sortUserTotalsByDialogNumbers(userTotals) {
  // Convert userTotals to an array of objects with username and total dialog number properties
  const userTotalsArray = Object.entries(userTotals).map(
    ([username, totalDialogNumber]) => ({
      username,
      totalDialogNumber,
    })
  );

  // Sort the array based on totalDialogNumber in ascending order
  userTotalsArray.sort((a, b) => a.totalDialogNumber - b.totalDialogNumber);

  return userTotalsArray;
}
/*
function generateHTMLTable(data) {
  let tableHTML = "<table border='1'>";
  if (data.length > 0) {
    tableHTML += "<tr>";
    for (let key in data[0]) {
      tableHTML += `<th>${key}</th>`;
    }
    tableHTML += "</tr>";

    // Group rows based on usernames
    const groupedRows = groupRowsByUserName(data);

    for (let username in groupedRows) {
      const rows = groupedRows[username];
      let showTotal = false; // Initially set to false to hide the total dialog number row
      let totalDialogNumber = 0;

      for (let item of rows) {
        tableHTML += "<tr>";
        for (let key in item) {
          tableHTML += `<td>${item[key]}</td>`;
        }
        tableHTML += "</tr>";
        totalDialogNumber += item["Diyalog Sayıları"];
      }

      // Add a row to display the total dialog number and set a class for toggling
      tableHTML += `
          <tr class="toggle-row" data-show-total="${showTotal}" id="${username}">
            <td colspan="${Object.keys(data[0]).length}">
              <span class="username">${username}</span>:
              <span class="dialog-number" style="display: none">${totalDialogNumber}</span>
              (${rows.length} program veya işlem kodu)
            </td>
          </tr>
        `;
    }
  }
  tableHTML += "</table>";
  return tableHTML;
}

function groupRowsByUserName(data) {
  const groupedRows = {};

  for (let item of data) {
    const username = item["Kullanıcı Adı"];
    if (!groupedRows[username]) {
      groupedRows[username] = [item];
    } else {
      groupedRows[username].push(item);
    }
  }

  return groupedRows;
}
*/
function generateHTMLTable(data) {
  let tableHTML = "<table border='1'>";
  if (data.length > 0) {
    tableHTML += "<tr>";
    for (let key in data[0]) {
      tableHTML += `<th>${key}</th>`;
    }
    tableHTML += "</tr>";

    // Group rows based on usernames
    const groupedRows = groupRowsByUserName(data);

    for (let username in groupedRows) {
      const rows = groupedRows[username];
      let showTotal = false; // Initially set to false to hide the total dialog number row
      let totalDialogNumber = 0;

      for (let item of rows) {
        tableHTML += "<tr>";
        for (let key in item) {
          tableHTML += `<td>${item[key]}</td>`;
        }
        tableHTML += "</tr>";
        totalDialogNumber += item["Diyalog Sayıları"];
      }

      // Add a row to display the total dialog number and set a class for toggling
      tableHTML += `
          <tr class="toggle-row" data-show-total="${showTotal}">
            <td colspan="${Object.keys(data[0]).length}">
              <span class="username">${username}</span>:
              <span class="dialog-number" style="display: none">${totalDialogNumber}</span>
              (${rows.length} rows)
            </td>
          </tr>
        `;
    }
  }
  tableHTML += "</table>";
  return tableHTML;
}

// Helper function to group rows by username
function groupRowsByUserName(data) {
  const groupedRows = {};
  for (let item of data) {
    const username = item["Kullanıcı Adı"];
    if (!groupedRows[username]) {
      groupedRows[username] = [item];
    } else {
      groupedRows[username].push(item);
    }
  }
  return groupedRows;
}

// Event listener for toggling the dialog numbers
document
  .getElementById("table-container")
  .addEventListener("click", function (event) {
    const target = event.target;
    if (
      target.classList.contains("username") ||
      target.classList.contains("dialog-number")
    ) {
      const row = target.closest(".toggle-row");
      const showTotal = row.getAttribute("data-show-total") === "true";
      const dialogNumber = row.querySelector(".dialog-number");
      const rowsAbove = getRowsAbove(row);
      if (showTotal) {
        dialogNumber.style.display = "none";
        row.setAttribute("data-show-total", "false");
        rowsAbove.forEach((row) => (row.style.display = "table-row"));
      } else {
        dialogNumber.style.display = "inline";
        row.setAttribute("data-show-total", "true");
        rowsAbove.forEach((row) => (row.style.display = "none"));
      }
    }
  });

// Helper function to get all rows above a given row
function getRowsAbove(row) {
  const rowsAbove = [];
  let prevRow = row.previousElementSibling;
  while (prevRow) {
    rowsAbove.push(prevRow);
    prevRow = prevRow.previousElementSibling;
  }
  return rowsAbove;
}

function calculateTotalDialogNumbers(data) {
  const userTotals = {};

  for (let item of data) {
    const username = item["Kullanıcı Adı"];
    const dialogNumber = item["Diyalog Sayıları"];
    if (!userTotals[username]) {
      userTotals[username] = dialogNumber;
    } else {
      userTotals[username] += dialogNumber;
    }
  }

  return userTotals;
}

function generateUserTotalsHTML(userTotals) {
  let totalsHTML = "<h3>User Totals</h3><ul>";
  for (let username in userTotals) {
    totalsHTML += `<li>${username}: ${userTotals[username]}</li>`;
  }
  totalsHTML += "</ul>";
  return totalsHTML;
}
