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
  const form = document.getElementById("order-form");
  if (form) {
    form.style.display = form.style.display === "block" ? "none" : "block";
  }
}

function closeForm() {
  const form = document.getElementById("order-form");
  if (form) {
    form.style.display = "none";
  }
}

let orders = [];

function initOrders() {
  const storedOrders = localStorage.getItem("bizTrackOrders");

  if (storedOrders) {
    try {
      orders = JSON.parse(storedOrders) || [];
    } catch (error) {
      console.error("Unable to parse stored orders:", error);
      orders = [];
    }
  } else {
    orders = [
      {
        orderID: "1001",
        orderDate: "2024-01-05",
        itemName: "Baseball caps",
        itemPrice: 25.00,
        qtyBought: 2,
        shipping: 2.50,
        taxes: 9.00,
        orderTotal: 61.50,
        orderStatus: "Pending",
      },
      {
        orderID: "1002",
        orderDate: "2024-03-05",
        itemName: "Water bottles",
        itemPrice: 17.00,
        qtyBought: 3,
        shipping: 3.50,
        taxes: 6.00,
        orderTotal: 60.50,
        orderStatus: "Processing",
      },
      {
        orderID: "1003",
        orderDate: "2024-02-05",
        itemName: "Tote bags",
        itemPrice: 20.00,
        qtyBought: 4,
        shipping: 2.50,
        taxes: 2.00,
        orderTotal: 84.50,
        orderStatus: "Shipped",
      },
      {
        orderID: "1004",
        orderDate: "2023-01-05",
        itemName: "Canvas prints",
        itemPrice: 55.00,
        qtyBought: 1,
        shipping: 2.50,
        taxes: 19.00,
        orderTotal: 76.50,
        orderStatus: "Delivered",
      },
      {
        orderID: "1005",
        orderDate: "2024-01-15",
        itemName: "Beanies",
        itemPrice: 15.00,
        qtyBought: 2,
        shipping: 3.90,
        taxes: 4.00,
        orderTotal: 37.90,
        orderStatus: "Pending",
      },
    ];

    localStorage.setItem("bizTrackOrders", JSON.stringify(orders));
  }

  renderOrders(orders);
}

function addOrUpdate(event) {
  const submitBtn = document.getElementById("submitBtn");
  const type = submitBtn ? submitBtn.textContent.trim() : "Add";

  if (type === "Add") {
    newOrder(event);
  } else if (type === "Update") {
    const orderID = document.getElementById("order-id").value;
    updateOrder(orderID);
  }
}

function newOrder(event) {
  event.preventDefault();

  const orderID = document.getElementById("order-id").value.trim();
  const orderDate = document.getElementById("order-date").value;
  const itemName = document.getElementById("item-name").value.trim();
  const itemPrice = parseFloat(document.getElementById("item-price").value);
  const qtyBought = parseInt(document.getElementById("qty-bought").value, 10);
  const shipping = parseFloat(document.getElementById("shipping").value);
  const taxes = parseFloat(document.getElementById("taxes").value);
  const orderTotal = itemPrice * qtyBought + shipping + taxes;
  const orderStatus = document.getElementById("order-status").value;

  if (isDuplicateID(orderID, null)) {
    alert("Order ID already exists. Please use a unique ID.");
    return;
  }

  const order = {
    orderID,
    orderDate,
    itemName,
    itemPrice,
    qtyBought,
    shipping,
    taxes,
    orderTotal,
    orderStatus,
  };

  orders.push(order);
  localStorage.setItem("bizTrackOrders", JSON.stringify(orders));
  renderOrders(orders);
  document.getElementById("order-form").reset();
}

function renderOrders(ordersToRender) {
  const orderTableBody = document.getElementById("tableBody");
  if (!orderTableBody) {
    return;
  }

  orderTableBody.innerHTML = "";

  const statusMap = {
    Pending: "pending",
    Processing: "processing",
    Shipped: "shipped",
    Delivered: "delivered",
  };

  ordersToRender.forEach((order) => {
    const orderRow = document.createElement("tr");
    orderRow.className = "order-row";

    orderRow.dataset.orderID = order.orderID;
    orderRow.dataset.orderDate = order.orderDate;
    orderRow.dataset.itemName = order.itemName;
    orderRow.dataset.itemPrice = order.itemPrice;
    orderRow.dataset.qtyBought = order.qtyBought;
    orderRow.dataset.shipping = order.shipping;
    orderRow.dataset.taxes = order.taxes;
    orderRow.dataset.orderTotal = order.orderTotal;
    orderRow.dataset.orderStatus = order.orderStatus;

    appendCell(orderRow, order.orderID);
    appendCell(orderRow, order.orderDate);
    appendCell(orderRow, order.itemName);
    appendCell(orderRow, `$${formatDecimalForDisplay(order.itemPrice)}`);
    appendCell(orderRow, order.qtyBought);
    appendCell(orderRow, `$${formatDecimalForDisplay(order.shipping)}`);
    appendCell(orderRow, `$${formatDecimalForDisplay(order.taxes)}`);

    const totalCell = appendCell(orderRow, `$${formatDecimalForDisplay(order.orderTotal)}`);
    totalCell.className = "order-total";

    const statusCell = document.createElement("td");
    const statusDiv = document.createElement("div");
    statusDiv.className = `status ${statusMap[order.orderStatus] || ""}`;
    const statusSpan = document.createElement("span");
    statusSpan.textContent = order.orderStatus;
    statusDiv.appendChild(statusSpan);
    statusCell.appendChild(statusDiv);
    orderRow.appendChild(statusCell);

    const actionCell = document.createElement("td");
    actionCell.className = "action";

    const editIcon = document.createElement("i");
    editIcon.title = "Edit";
    editIcon.className = "edit-icon fa-solid fa-pen-to-square";
    editIcon.addEventListener("click", () => editRow(order.orderID));

    const deleteIcon = document.createElement("i");
    deleteIcon.className = "delete-icon fas fa-trash-alt";
    deleteIcon.addEventListener("click", () => deleteOrder(order.orderID));

    actionCell.appendChild(editIcon);
    actionCell.appendChild(deleteIcon);
    orderRow.appendChild(actionCell);

    orderTableBody.appendChild(orderRow);
  });

  displayRevenue();
}

function displayRevenue() {
  const resultElement = document.getElementById("total-revenue");
  if (!resultElement) {
    return;
  }

  const totalRevenue = orders.reduce((total, order) => total + Number(order.orderTotal || 0), 0);
  resultElement.innerHTML = `<span>Total Revenue: $${totalRevenue.toFixed(2)}</span>`;
}

function editRow(orderID) {
  const orderToEdit = orders.find((order) => order.orderID === orderID);

  if (!orderToEdit) {
    return;
  }

  document.getElementById("order-id").value = orderToEdit.orderID;
  document.getElementById("order-date").value = orderToEdit.orderDate;
  document.getElementById("item-name").value = orderToEdit.itemName;
  document.getElementById("item-price").value = orderToEdit.itemPrice;
  document.getElementById("qty-bought").value = orderToEdit.qtyBought;
  document.getElementById("shipping").value = orderToEdit.shipping;
  document.getElementById("taxes").value = orderToEdit.taxes;

  const orderTotalField = document.getElementById("order-total");
  if (orderTotalField) {
    orderTotalField.value = orderToEdit.orderTotal;
  }

  document.getElementById("order-status").value = orderToEdit.orderStatus;
  document.getElementById("submitBtn").textContent = "Update";
  document.getElementById("order-form").style.display = "block";
}

function deleteOrder(orderID) {
  const indexToDelete = orders.findIndex((order) => order.orderID === orderID);

  if (indexToDelete !== -1) {
    orders.splice(indexToDelete, 1);
    localStorage.setItem("bizTrackOrders", JSON.stringify(orders));
    renderOrders(orders);
  }
}

function updateOrder(orderID) {
  const indexToUpdate = orders.findIndex((order) => order.orderID === orderID);

  if (indexToUpdate !== -1) {
    const itemPrice = parseFloat(document.getElementById("item-price").value);
    const qtyBought = parseInt(document.getElementById("qty-bought").value, 10);
    const shipping = parseFloat(document.getElementById("shipping").value);
    const taxes = parseFloat(document.getElementById("taxes").value);

    const updatedOrder = {
      orderID: document.getElementById("order-id").value.trim(),
      orderDate: document.getElementById("order-date").value,
      itemName: document.getElementById("item-name").value.trim(),
      itemPrice,
      qtyBought,
      shipping,
      taxes,
      orderTotal: itemPrice * qtyBought + shipping + taxes,
      orderStatus: document.getElementById("order-status").value,
    };

    if (isDuplicateID(updatedOrder.orderID, orderID)) {
      alert("Order ID already exists. Please use a unique ID.");
      return;
    }

    orders[indexToUpdate] = updatedOrder;
    localStorage.setItem("bizTrackOrders", JSON.stringify(orders));
    renderOrders(orders);
    document.getElementById("order-form").reset();
    document.getElementById("submitBtn").textContent = "Add";
  }
}

function isDuplicateID(orderID, currentID) {
  return orders.some((order) => order.orderID === orderID && order.orderID !== currentID);
}

function sortTable(column) {
  const tbody = document.getElementById("tableBody");
  if (!tbody) {
    return;
  }

  const rows = Array.from(tbody.querySelectorAll("tr"));
  const isNumeric =
    column === "itemPrice" ||
    column === "qtyBought" ||
    column === "shipping" ||
    column === "taxes" ||
    column === "orderTotal";

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
  const rows = document.querySelectorAll(".order-row");

  rows.forEach((row) => {
    const visible = row.innerText.toLowerCase().includes(searchInput);
    row.style.display = visible ? "table-row" : "none";
  });
}

function exportToCSV() {
  const columns = [
    { key: "orderID", header: "orderID" },
    { key: "orderDate", header: "orderDate" },
    { key: "itemName", header: "itemName" },
    { key: "itemPrice", header: "itemPrice" },
    { key: "qtyBought", header: "qtyBought" },
    { key: "shipping", header: "shipping" },
    { key: "taxes", header: "taxes" },
    { key: "orderTotal", header: "orderTotal" },
    { key: "orderStatus", header: "orderStatus" },
  ];

  const ordersToExport = orders.map((order) => ({
    orderID: order.orderID,
    orderDate: order.orderDate,
    itemName: order.itemName,
    itemPrice: formatDecimalForCSV(order.itemPrice),
    qtyBought: order.qtyBought,
    shipping: formatDecimalForCSV(order.shipping),
    taxes: formatDecimalForCSV(order.taxes),
    orderTotal: formatDecimalForCSV(order.orderTotal),
    orderStatus: order.orderStatus,
  }));

  const csvContent = "\uFEFF" + generateCSV(ordersToExport, columns);
  downloadCSV(csvContent, "biztrack_order_table.csv");
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

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        performSearch();
      }
    });
  }

  initOrders();
});
