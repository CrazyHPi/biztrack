function validateProductInput(prodPrice, prodSold) {
  if (!Number.isFinite(prodPrice) || prodPrice < 0) {
    alert("Product price must be a valid non-negative number.");
    return false;
  }

  if (!Number.isInteger(prodSold) || prodSold < 0) {
    alert("Units sold must be a whole number of 0 or more.");
    return false;
  }

  return true;
}

function openSidebar() {
  const side = document.getElementById("sidebar");
  if (side) {
    side.style.display = side.style.display === "block" ? "none" : "block";
  }
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.style.display = "none";
  }
}

function openForm() {
  const form = document.getElementById("product-form");
  if (form) {
    form.style.display = form.style.display === "block" ? "none" : "block";
  }
}

function closeForm() {
  const form = document.getElementById("product-form");
  if (form) {
    form.style.display = "none";
  }
}

let products = [];

function init() {
  const storedProducts = localStorage.getItem("bizTrackProducts");

    if (storedProducts) {
        try {
            products = JSON.parse(storedProducts) || [];
        } catch (error) {
            console.error("Unable to parse stored products:", error);
            products = [];
        }
    } else {
    products = [
      {
        prodID: "PD001",
        prodName: "Baseball caps",
        prodDesc: "Peace embroidered cap",
        prodCat: "Hats",
        prodPrice: 25.00,
        prodSold: 20,
      },
      {
        prodID: "PD002",
        prodName: "Water bottles",
        prodDesc: "Floral lotus printed bottle",
        prodCat: "Drinkware",
        prodPrice: 48.50,
        prodSold: 10,
      },
      {
        prodID: "PD003",
        prodName: "Sweatshirts",
        prodDesc: "Palestine sweater",
        prodCat: "Clothing",
        prodPrice: 17.50,
        prodSold: 70,
      },
      {
        prodID: "PD004",
        prodName: "Posters",
        prodDesc: "Vibes printed poster",
        prodCat: "Home decor",
        prodPrice: 12.00,
        prodSold: 60,
      },
      {
        prodID: "PD005",
        prodName: "Pillow cases",
        prodDesc: "Morrocan print pillow case",
        prodCat: "Accessories",
        prodPrice: 17.00,
        prodSold: 40,
      },
    ];

      try {
          localStorage.setItem("bizTrackProducts", JSON.stringify(products));
      } catch (e) {
          console.error("Failed to save default products to localStorage", e);
      }
  }

  renderProducts(products);
};

function addOrUpdate(event) {
  const submitBtn = document.getElementById("submitBtn");
  const type = submitBtn ? submitBtn.textContent.trim() : "Add";

  if (type === "Add") {
    newProduct(event);
  } else if (type === "Update") {
    const prodID = document.getElementById("product-id").value;
    updateProduct(prodID);
  }
}

function newProduct(event) {
  event.preventDefault();

  const prodID = document.getElementById("product-id").value.trim();
  const prodName = document.getElementById("product-name").value.trim();
  const prodDesc = document.getElementById("product-desc").value.trim();
  const prodCat = document.getElementById("product-cat").value.trim();
  const prodPrice = Number(document.getElementById("product-price").value);
  const prodSold = Number(document.getElementById("product-sold").value, 10);

  if (!validateProductInput(prodPrice, prodSold)) {
    return;
  }

  if (isDuplicateID(prodID, null)) {
    alert(t('alert.duplicateProductID'));
    return;
  }

  const product = {
    prodID,
    prodName,
    prodDesc,
    prodCat,
    prodPrice,
    prodSold,
  };

  products.push(product);

  renderProducts(products);
  try {
      localStorage.setItem("bizTrackProducts", JSON.stringify(products));
  } catch (e) {
      console.error("Failed to save products to localStorage", e);
  }

  renderProducts(products);
  document.getElementById("product-form").reset();
}

function renderProducts(productsToRender) {
  const prodTableBody = document.getElementById("tableBody");
  if (!prodTableBody) {
    return;
  }

  prodTableBody.innerHTML = "";

  productsToRender.forEach((product) => {
    const prodRow = document.createElement("tr");
    prodRow.className = "product-row";

    prodRow.dataset.prodID = product.prodID;
    prodRow.dataset.prodName = product.prodName;
    prodRow.dataset.prodDesc = product.prodDesc;
    prodRow.dataset.prodCat = product.prodCat;
    prodRow.dataset.prodPrice = product.prodPrice;
    prodRow.dataset.prodSold = product.prodSold;

    appendCell(prodRow, product.prodID);
    appendCell(prodRow, product.prodName);
    appendCell(prodRow, product.prodDesc);
    appendCell(prodRow, product.prodCat);
    appendCell(prodRow, `$${formatDecimalForDisplay(product.prodPrice)}`);
    appendCell(prodRow, product.prodSold);

    const actionCell = document.createElement("td");
    actionCell.className = "action";

    const editIcon = document.createElement("i");
    editIcon.title = "Edit";
    editIcon.className = "edit-icon fa-solid fa-pen-to-square";
    editIcon.addEventListener("click", () => editRow(product.prodID));

    const deleteIcon = document.createElement("i");
    deleteIcon.className = "delete-icon fas fa-trash-alt";
    deleteIcon.addEventListener("click", () => deleteProduct(product.prodID));

    actionCell.appendChild(editIcon);
    actionCell.appendChild(deleteIcon);
    prodRow.appendChild(actionCell);

    prodTableBody.appendChild(prodRow);
  });
}

function editRow(prodID) {
  const productToEdit = products.find((product) => product.prodID === prodID);

  if (!productToEdit) {
    return;
  }

  document.getElementById("product-id").value = productToEdit.prodID;
  document.getElementById("product-name").value = productToEdit.prodName;
  document.getElementById("product-desc").value = productToEdit.prodDesc;
  document.getElementById("product-cat").value = productToEdit.prodCat;
  document.getElementById("product-price").value = productToEdit.prodPrice;
  document.getElementById("product-sold").value = productToEdit.prodSold;

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.textContent = t('update');
  submitBtn.dataset.mode = 'update';
  document.getElementById("product-form").style.display = "block";
}

function deleteProduct(prodID) {
  const indexToDelete = products.findIndex((product) => product.prodID === prodID);

  if (indexToDelete !== -1) {
    products.splice(indexToDelete, 1);

      try {
          localStorage.setItem("bizTrackProducts", JSON.stringify(products));
      } catch (e) {
          console.error("Failed to update localStorage after deleting product", e);
      }

    renderProducts(products);
  }
}

function updateProduct(prodID) {
  const indexToUpdate = products.findIndex((product) => product.prodID === prodID);

    if (indexToUpdate !== -1) {
        const prodPrice = parseFloat(document.getElementById("product-price").value);
        const prodSold = parseInt(document.getElementById("product-sold").value, 10);

        if (!validateProductInput(prodPrice, prodSold)) {
            return;
        }

        const updatedProduct = {
            prodID: document.getElementById("product-id").value.trim(),
            prodName: document.getElementById("product-name").value.trim(),
            prodDesc: document.getElementById("product-desc").value.trim(),
            prodCat: document.getElementById("product-cat").value.trim(),
            prodPrice: prodPrice,
            prodSold: prodSold,
        };

    if (isDuplicateID(updatedProduct.prodID, prodID)) {
            alert(t('alert.duplicateProductID'));
      return;
    }

    products[indexToUpdate] = updatedProduct;

        try {
            localStorage.setItem("bizTrackProducts", JSON.stringify(products));
        } catch (e) {
            console.error("Failed to save updated products", e);
        }

    renderProducts(products);

    document.getElementById("product-form").reset();
        const submitBtn = document.getElementById("submitBtn");
        submitBtn.textContent = t('add');
        submitBtn.dataset.mode = 'add';
  }
}

function isDuplicateID(prodID, currentID) {
  return products.some((product) => product.prodID === prodID && product.prodID !== currentID);
}

function sortTable(column) {
  const tbody = document.getElementById("tableBody");
  if (!tbody) {
    return;
  }

  const rows = Array.from(tbody.querySelectorAll("tr"));
  const isNumeric = column === "prodPrice" || column === "prodSold";

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
  const rows = document.querySelectorAll(".product-row");

  rows.forEach((row) => {
    const visible = row.innerText.toLowerCase().includes(searchInput);
    row.style.display = visible ? "table-row" : "none";
  });
}

function exportToCSV() {
  const columns = [
    { key: "prodID", header: "prodID" },
    { key: "prodName", header: "prodName" },
    { key: "prodDesc", header: "prodDesc" },
    { key: "prodCategory", header: "prodCategory" },
    { key: "prodPrice", header: "prodPrice" },
    { key: "QtySold", header: "QtySold" },
  ];

  const productsToExport = products.map((product) => ({
    prodID: product.prodID,
    prodName: product.prodName,
    prodDesc: product.prodDesc,
    prodCategory: product.prodCat,
    prodPrice: formatDecimalForCSV(product.prodPrice),
    QtySold: product.prodSold,
  }));

  const csvContent = "\uFEFF" + generateCSV(productsToExport, columns);
  downloadCSV(csvContent, "biztrack_product_table.csv");
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

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        performSearch();
      }
    });
  }

init();
});