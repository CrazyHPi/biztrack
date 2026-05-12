const { resetDom } = require("./test-utils");

function setupOrderDom() {
  document.body.innerHTML = `
    <div id="sidebar" style="display: none"></div>
    <form id="order-form" style="display: none">
      <input id="order-id" />
      <input id="order-date" />
      <input id="item-name" />
      <input id="item-price" />
      <input id="qty-bought" />
      <input id="shipping" />
      <input id="taxes" />
      <input id="order-total" />
      <select id="order-status">
        <option value="Pending">Pending</option>
        <option value="Processing">Processing</option>
        <option value="Shipped">Shipped</option>
        <option value="Delivered">Delivered</option>
      </select>
      <button id="submitBtn" type="button">Add</button>
    </form>
    <input id="searchInput" />
    <div id="total-revenue"></div>
    <table>
      <tbody id="tableBody"></tbody>
    </table>
  `;
}

describe("orders.js", () => {
  beforeEach(() => {
    resetDom();
    setupOrderDom();
  });

  test("validates order numeric input", () => {
    const orders = require("../orders.js");

    expect(orders.validateOrderInput(10, 1, 0, 0)).toBe(true);
    expect(orders.validateOrderInput(-1, 1, 0, 0)).toBe(false);
    expect(orders.validateOrderInput(10, 0, 0, 0)).toBe(false);
    expect(orders.validateOrderInput(10, 1.5, 0, 0)).toBe(false);
    expect(orders.validateOrderInput(10, 1, -1, 0)).toBe(false);
    expect(orders.validateOrderInput(10, 1, 0, Number.NaN)).toBe(false);
    expect(alert).toHaveBeenCalled();
  });

  test("toggles sidebar and order form", () => {
    const orders = require("../orders.js");

    orders.openSidebar();
    expect(document.getElementById("sidebar").style.display).toBe("block");

    orders.openSidebar();
    expect(document.getElementById("sidebar").style.display).toBe("none");

    orders.closeSidebar();
    expect(document.getElementById("sidebar").style.display).toBe("none");

    orders.openForm();
    expect(document.getElementById("order-form").style.display).toBe("block");

    orders.closeForm();
    expect(document.getElementById("order-form").style.display).toBe("none");
  });

  test("initializes default orders and displays total revenue", () => {
    const orders = require("../orders.js");

    orders.initOrders();

    expect(document.querySelectorAll(".order-row")).toHaveLength(5);
    expect(localStorage.getItem("bizTrackOrders")).toContain("1001");
    expect(document.getElementById("total-revenue").textContent).toContain("$320.90");
  });

  test("initializes app on DOMContentLoaded event", () => {
    require("../orders.js");
    document.dispatchEvent(new Event("DOMContentLoaded"));
    expect(document.getElementById("total-revenue").textContent).not.toBe("");
  });

  test("adds new order, calculates total, and blocks duplicate ID", () => {
    const orders = require("../orders.js");
    orders.initOrders();

    document.getElementById("order-id").value = "9999";
    document.getElementById("order-date").value = "2024-05-10";
    document.getElementById("item-name").value = "Test Item";
    document.getElementById("item-price").value = "10";
    document.getElementById("qty-bought").value = "2";
    document.getElementById("shipping").value = "3";
    document.getElementById("taxes").value = "1";
    document.getElementById("order-status").value = "Pending";

    orders.newOrder({ preventDefault: jest.fn() });

    let stored = JSON.parse(localStorage.getItem("bizTrackOrders"));
    expect(stored.find((order) => order.orderID === "9999").orderTotal).toBe(24);
    expect(document.body.textContent).toContain("9999");

    document.getElementById("order-id").value = "1001";
    document.getElementById("order-date").value = "2024-05-10";
    document.getElementById("item-name").value = "Duplicate";
    document.getElementById("item-price").value = "1";
    document.getElementById("qty-bought").value = "1";
    document.getElementById("shipping").value = "0";
    document.getElementById("taxes").value = "0";

    orders.newOrder({ preventDefault: jest.fn() });

    stored = JSON.parse(localStorage.getItem("bizTrackOrders"));
    expect(stored.filter((order) => order.orderID === "1001")).toHaveLength(1);
    expect(alert).toHaveBeenCalledWith("Duplicate Order ID");
  });

  test("edits, updates, deletes, sorts, and searches orders", () => {
    const orders = require("../orders.js");
    orders.initOrders();

    orders.editRow("1001");

    expect(document.getElementById("order-id").value).toBe("1001");
    expect(document.getElementById("submitBtn").textContent).toBe("Update");

    document.getElementById("item-name").value = "Updated Order Item";
    document.getElementById("item-price").value = "30";
    document.getElementById("qty-bought").value = "2";
    document.getElementById("shipping").value = "5";
    document.getElementById("taxes").value = "1";
    document.getElementById("order-status").value = "Delivered";

    orders.updateOrder("1001");

    let stored = JSON.parse(localStorage.getItem("bizTrackOrders"));
    expect(stored.find((order) => order.orderID === "1001").orderTotal).toBe(66);
    expect(document.getElementById("submitBtn").textContent).toBe("Add");

    orders.deleteOrder("1002");

    stored = JSON.parse(localStorage.getItem("bizTrackOrders"));
    expect(stored.find((order) => order.orderID === "1002")).toBeUndefined();

    orders.sortTable("orderTotal");
    expect(document.querySelector(".order-row").dataset.orderID).toBe("1005");

    document.getElementById("searchInput").value = "beanies";
    orders.performSearch();

    const visibleRows = [...document.querySelectorAll(".order-row")]
      .filter((row) => row.style.display !== "none");

    expect(visibleRows).toHaveLength(1);
    expect(visibleRows[0].textContent).toContain("Beanies");
  });

  test("cancels deletion when confirm dialog returns false", () => {
    global.confirm.mockReturnValueOnce(false);
    const orders = require("../orders.js");
    orders.initOrders();
    
    orders.deleteOrder("1001");
    const stored = JSON.parse(localStorage.getItem("bizTrackOrders"));
    expect(stored.find((order) => order.orderID === "1001")).toBeDefined();
  });

  test("sorts by various columns and toggles sort direction", () => {
    const orders = require("../orders.js");
    orders.initOrders();

    // Numeric sort asc and desc
    orders.sortTable("orderTotal");
    orders.sortTable("orderTotal"); 

    // Date sort asc and desc
    orders.sortTable("orderDate");
    orders.sortTable("orderDate"); 

    // String sort asc and desc
    orders.sortTable("itemName");
    orders.sortTable("itemName"); 
  });

  test("search with empty query restores all rows", () => {
    const orders = require("../orders.js");
    orders.initOrders();
    
    document.getElementById("searchInput").value = "";
    orders.performSearch();
    
    const visibleRows = [...document.querySelectorAll(".order-row")]
      .filter((row) => row.style.display !== "none");
    expect(visibleRows.length).toBeGreaterThan(0);
  });

  test("generates and downloads safe order CSV", () => {
    const orders = require("../orders.js");
    orders.initOrders();

    expect(orders.formatDecimalForCSV(3)).toBe("3.00");
    expect(orders.formatDecimalForDisplay("bad")).toBe("0.00");

    const csv = orders.generateCSV(
      [{ id: "+danger", text: 'Hello "CSV"', missing: undefined }],
      [
        { key: "id", header: "id" },
        { key: "text", header: "text" },
        { key: "missing", header: "missing" }
      ]
    );

    expect(csv).toContain("\"'+danger\"");
    expect(csv).toContain('"Hello ""CSV"""');
    expect(csv).toContain('""');

    orders.exportToCSV();

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(window.HTMLAnchorElement.prototype.click).toHaveBeenCalled();
  });
});

test("does not add order when validation fails", () => {
  const orders = require("../orders.js");
  orders.initOrders();

  const before = JSON.parse(localStorage.getItem("bizTrackOrders")).length;

  document.getElementById("order-id").value = "9998";
  document.getElementById("order-date").value = "2024-05-10";
  document.getElementById("item-name").value = "Invalid Order";
  document.getElementById("item-price").value = "-1";
  document.getElementById("qty-bought").value = "1";
  document.getElementById("shipping").value = "0";
  document.getElementById("taxes").value = "0";
  document.getElementById("order-status").value = "Pending";

  orders.newOrder({ preventDefault: jest.fn() });

  const after = JSON.parse(localStorage.getItem("bizTrackOrders")).length;

  expect(after).toBe(before);
  expect(alert).toHaveBeenCalled();
});

test("does not update order when validation fails", () => {
  const orders = require("../orders.js");
  orders.initOrders();

  orders.editRow("1001");

  document.getElementById("item-price").value = "20";
  document.getElementById("qty-bought").value = "0";
  document.getElementById("shipping").value = "0";
  document.getElementById("taxes").value = "0";

  orders.updateOrder("1001");

  const stored = JSON.parse(localStorage.getItem("bizTrackOrders"));
  const order = stored.find((item) => item.orderID === "1001");

  expect(order.qtyBought).not.toBe(0);
  expect(alert).toHaveBeenCalled();
});

test("handles missing order when editing, updating, or deleting", () => {
  const orders = require("../orders.js");
  orders.initOrders();

  const before = JSON.parse(localStorage.getItem("bizTrackOrders")).length;

  expect(() => orders.editRow("UNKNOWN_ORDER")).not.toThrow();
  expect(() => orders.updateOrder("UNKNOWN_ORDER")).not.toThrow();
  expect(() => orders.deleteOrder("UNKNOWN_ORDER")).not.toThrow();

  const after = JSON.parse(localStorage.getItem("bizTrackOrders")).length;

  expect(after).toBe(before);
});

test("search hides all orders when there is no match", () => {
  const orders = require("../orders.js");
  orders.initOrders();

  document.getElementById("searchInput").value = "no-order-should-match-this";
  orders.performSearch();

  const visibleRows = [...document.querySelectorAll(".order-row")]
    .filter((row) => row.style.display !== "none");

  expect(visibleRows).toHaveLength(0);
});

test("sortTable handles unsupported order key without crashing", () => {
  const orders = require("../orders.js");
  orders.initOrders();

  expect(() => orders.sortTable("unknownKey")).not.toThrow();
});
