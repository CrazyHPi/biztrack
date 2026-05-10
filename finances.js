function openSidebar() {
  const side = document.getElementById("sidebar");
  if (side) {
    if (window.getComputedStyle(side).display === "none") {
      side.style.display = "block";
    } else {
      side.style.display = "none";
    }
  }
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.style.display = "none";
  }
}

function openForm() {
  const form = document.getElementById("transaction-form");
  if (form) {
    form.style.display = form.style.display === "block" ? "none" : "block";
  }
}

function closeForm() {
  const form = document.getElementById("transaction-form");
  if (form) {
    form.style.display = "none";
  }
}

let transactions = [];
let serialNumberCounter = 1;

function initTransactions() {
  const storedTransactions = localStorage.getItem("bizTrackTransactions");

  if (storedTransactions) {
      try {
          transactions = JSON.parse(storedTransactions) || [];
      } catch (error) {
          console.error("Unable to parse stored transactions:", error);
          transactions = [];
      }
  } else {
    transactions = [
      {
        trID: 1,
        trDate: "2024-01-05",
        trCategory: "Rent",
        trAmount: 100.00,
        trNotes: "January Rent",
      },
      {
        trID: 2,
        trDate: "2024-01-15",
        trCategory: "Order Fulfillment",
        trAmount: 35.00,
        trNotes: "Order #1005",
      },
      {
        trID: 3,
        trDate: "2024-01-08",
        trCategory: "Utilities",
        trAmount: 120.00,
        trNotes: "Internet",
      },
      {
        trID: 4,
        trDate: "2024-02-05",
        trCategory: "Supplies",
        trAmount: 180.00,
        trNotes: "Embroidery Machine",
      },
      {
        trID: 5,
        trDate: "2024-01-25",
        trCategory: "Miscellaneous",
        trAmount: 20.00,
        trNotes: "Pizza",
      },
    ];

        try {
            localStorage.setItem("bizTrackTransactions", JSON.stringify(transactions));
        } catch (e) {
            console.error("Failed to save default transactions to localStorage", e);
        }
    }

  serialNumberCounter = getNextTransactionId();
  renderTransactions(transactions);
}

function addOrUpdate(event) {
  const submitBtn = document.getElementById("submitBtn");
  const type = submitBtn ? submitBtn.textContent.trim() : "Add";

  if (type === "Add") {
    newTransaction(event);
  } else if (type === "Update") {
    const trId = document.getElementById("tr-id").value;
    updateTransaction(Number(trId));
  }
}

function newTransaction(event) {
  event.preventDefault();

  const trDate = document.getElementById("tr-date").value;
  const trCategory = document.getElementById("tr-category").value.trim();
  const trAmount = parseFloat(document.getElementById("tr-amount").value);
  const trNotes = document.getElementById("tr-notes").value.trim();

  serialNumberCounter = getNextTransactionId();

  const transaction = {
    trID: serialNumberCounter,
    trDate,
    trCategory,
    trAmount,
    trNotes,
  };

  transactions.push(transaction);
  localStorage.setItem("bizTrackTransactions", JSON.stringify(transactions));
  serialNumberCounter = getNextTransactionId();
  renderTransactions(transactions);
    try {
        localStorage.setItem("bizTrackTransactions", JSON.stringify(transactions));
    } catch (e) {
        console.error("Failed to save transactions to localStorage", e);
    }

    serialNumberCounter++;
    displayExpenses();
  
  document.getElementById("transaction-form").reset();
}

function renderTransactions(transactionsToRender) {
  const transactionTableBody = document.getElementById("tableBody");
  if (!transactionTableBody) {
    return;
  }

  transactionTableBody.innerHTML = "";

  transactionsToRender.forEach((transaction) => {
    const transactionRow = document.createElement("tr");
    transactionRow.className = "transaction-row";

    transactionRow.dataset.trID = transaction.trID;
    transactionRow.dataset.trDate = transaction.trDate;
    transactionRow.dataset.trCategory = transaction.trCategory;
    transactionRow.dataset.trAmount = transaction.trAmount;
    transactionRow.dataset.trNotes = transaction.trNotes;

    appendCell(transactionRow, transaction.trID);
    appendCell(transactionRow, transaction.trDate);
    appendCell(transactionRow, transaction.trCategory);

    const amountCell = appendCell(transactionRow, `$${formatDecimalForDisplay(transaction.trAmount)}`);
    amountCell.className = "tr-amount";

    appendCell(transactionRow, transaction.trNotes);

    const actionCell = document.createElement("td");
    actionCell.className = "action";

    const editIcon = document.createElement("i");
    editIcon.title = "Edit";
    editIcon.className = "edit-icon fa-solid fa-pen-to-square";
    editIcon.addEventListener("click", () => editRow(transaction.trID));

    const deleteIcon = document.createElement("i");
    deleteIcon.className = "delete-icon fas fa-trash-alt";
    deleteIcon.addEventListener("click", () => deleteTransaction(transaction.trID));

    actionCell.appendChild(editIcon);
    actionCell.appendChild(deleteIcon);
    transactionRow.appendChild(actionCell);

    transactionTableBody.appendChild(transactionRow);
  });

  displayExpenses();
}

function displayExpenses() {
  const resultElement = document.getElementById("total-expenses");
  if (!resultElement) {
    return;
  }

  const totalExpenses = transactions.reduce(
    (total, transaction) => total + Number(transaction.trAmount || 0),
    0
  );

  resultElement.innerHTML = `<span>Total Expenses: $${totalExpenses.toFixed(2)}</span>`;
}

function editRow(trID) {
  const trToEdit = transactions.find((transaction) => Number(transaction.trID) === Number(trID));

  if (!trToEdit) {
    return;
  }

  document.getElementById("tr-id").value = trToEdit.trID;
  document.getElementById("tr-date").value = trToEdit.trDate;
  document.getElementById("tr-category").value = trToEdit.trCategory;
  document.getElementById("tr-amount").value = trToEdit.trAmount;
  document.getElementById("tr-notes").value = trToEdit.trNotes;
  document.getElementById("submitBtn").textContent = "Update";
  document.getElementById("transaction-form").style.display = "block";
}

function deleteTransaction(trID) {
  const indexToDelete = transactions.findIndex(
    (transaction) => Number(transaction.trID) === Number(trID)
  );

  if (indexToDelete !== -1) {
      transactions.splice(indexToDelete, 1);

      try {
          localStorage.setItem("bizTrackTransactions", JSON.stringify(transactions));
      } catch (e) {
          console.error("Failed to update localStorage after delete", e);
      }

      serialNumberCounter = getNextTransactionId();
      renderTransactions(transactions);
  }
}

function updateTransaction(trID) {
  const indexToUpdate = transactions.findIndex(
    (transaction) => Number(transaction.trID) === Number(trID)
  );

    if (indexToUpdate !== -1) {
        const updatedTransaction = {
            trID,
            trDate: document.getElementById("tr-date").value,
            trCategory: document.getElementById("tr-category").value.trim(),
            trAmount: parseFloat(document.getElementById("tr-amount").value),
            trNotes: document.getElementById("tr-notes").value.trim(),
        };

        transactions[indexToUpdate] = updatedTransaction;

        try {
            localStorage.setItem("bizTrackTransactions", JSON.stringify(transactions));
        } catch (e) {
            console.error("Failed to save updated transaction", e);
        }

        renderTransactions(transactions);
        document.getElementById("transaction-form").reset();
        document.getElementById("submitBtn").textContent = "Add";
    }
}

function sortTable(column) {
  const tbody = document.getElementById("tableBody");
  if (!tbody) {
    return;
  }

  const rows = Array.from(tbody.querySelectorAll("tr"));
  const isNumeric = column === "trID" || column === "trAmount";

  const sortedRows = rows.sort((a, b) => {
    const aValue = isNumeric ? parseFloat(a.dataset[column]) : a.dataset[column];
    const bValue = isNumeric ? parseFloat(b.dataset[column]) : b.dataset[column];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue, undefined, { sensitivity: "base" });
    }

    return aValue - bValue;
  });

  rows.forEach((row) => tbody.removeChild(row));
  sortedRows.forEach((row) => tbody.appendChild(row));
}

function performSearch() {
  const searchInput = document.getElementById("searchInput").value.toLowerCase();
  const rows = document.querySelectorAll(".transaction-row");

  rows.forEach((row) => {
    const visible = row.innerText.toLowerCase().includes(searchInput);
    row.style.display = visible ? "table-row" : "none";
  });
}

function exportToCSV() {
  const columns = [
    { key: "trID", header: "trID" },
    { key: "trDate", header: "trDate" },
    { key: "trCategory", header: "trCategory" },
    { key: "trAmount", header: "trAmount" },
    { key: "trNotes", header: "trNotes" },
  ];

  const transactionsToExport = transactions.map((transaction) => ({
    trID: transaction.trID,
    trDate: transaction.trDate,
    trCategory: transaction.trCategory,
    trAmount: formatDecimalForCSV(transaction.trAmount),
    trNotes: transaction.trNotes,
  }));

  const csvContent = "\uFEFF" + generateCSV(transactionsToExport, columns);
  downloadCSV(csvContent, "biztrack_expense_table.csv");
}

function generateCSV(data, columns) {
  const headerRow = columns.map((column) => escapeCSVCell(column.header)).join(",");
  const dataRows = data.map((row) =>
    columns.map((column) => escapeCSVCell(row[column.key])).join(",")
  );

  return [headerRow, ...dataRows].join("\r\n");
}

function escapeCSVCell(value) {
  if (value === null || value === undefined) {
    return '""';
  }

  let cell = String(value);

  if (/^[=+\-@\t\r\n\uFF1D\uFF0B\uFF0D\uFF20]/.test(cell)) {
    cell = "'" + cell;
  }

  return `"${cell.replace(/"/g, '""')}"`;
}

function formatDecimalForCSV(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(2) : "";
}

function formatDecimalForDisplay(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(2) : "0.00";
}

function appendCell(row, value) {
  const cell = document.createElement("td");
  cell.textContent = value === null || value === undefined ? "" : String(value);
  row.appendChild(cell);
  return cell;
}

function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function getNextTransactionId() {
  if (!transactions.length) {
    return 1;
  }

  const maxId = transactions.reduce((max, transaction) => {
    const id = Number(transaction.trID);
    return Number.isFinite(id) && id > max ? id : max;
  }, 0);

  return maxId + 1;
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        performSearch();
      }
    });
  }

  initTransactions();
});
