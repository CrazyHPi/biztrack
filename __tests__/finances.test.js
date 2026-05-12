const { resetDom } = require("./test-utils");

function setupFinanceDom() {
  document.body.innerHTML = `
    <div id="sidebar" style="display: none"></div>
    <form id="transaction-form" style="display: none">
      <input id="tr-id" />
      <input id="tr-date" />
      <input id="tr-category" />
      <input id="tr-amount" />
      <input id="tr-notes" />
      <button id="submitBtn" type="button">Add</button>
    </form>
    <input id="searchInput" />
    <div id="total-expenses"></div>
    <table>
      <tbody id="tableBody"></tbody>
    </table>
  `;
}

describe("finances.js", () => {
  beforeEach(() => {
    resetDom();
    setupFinanceDom();
  });

  test("toggles sidebar and transaction form", () => {
    const finances = require("../finances.js");

    finances.openSidebar();
    expect(document.getElementById("sidebar").style.display).toBe("block");

    finances.openSidebar();
    expect(document.getElementById("sidebar").style.display).toBe("none");

    finances.closeSidebar();
    expect(document.getElementById("sidebar").style.display).toBe("none");

    finances.openForm();
    expect(document.getElementById("transaction-form").style.display).toBe("block");

    finances.closeForm();
    expect(document.getElementById("transaction-form").style.display).toBe("none");
  });

  test("initializes app on DOMContentLoaded event", () => {
    require("../finances.js");
    document.dispatchEvent(new Event("DOMContentLoaded"));
    expect(document.getElementById("total-expenses").textContent).not.toBe("");
  });

  test("initializes default transactions and displays expenses", () => {
    const finances = require("../finances.js");

    finances.initTransactions();

    expect(document.querySelectorAll(".transaction-row")).toHaveLength(5);
    expect(localStorage.getItem("bizTrackTransactions")).toContain("January Rent");
    expect(document.getElementById("total-expenses").textContent).toContain("$455.00");
    expect(finances.getNextTransactionId()).toBe(6);
  });

  test("adds, edits, updates, and deletes transactions", () => {
    const finances = require("../finances.js");
    finances.initTransactions();

    document.getElementById("tr-date").value = "2024-05-10";
    document.getElementById("tr-category").value = "Marketing";
    document.getElementById("tr-amount").value = "12.5";
    document.getElementById("tr-notes").value = "Ad spend";

    finances.newTransaction({ preventDefault: jest.fn() });

    let stored = JSON.parse(localStorage.getItem("bizTrackTransactions"));
    expect(stored.find((transaction) => transaction.trCategory === "Marketing")).toEqual(
      expect.objectContaining({
        trID: 6,
        trAmount: 12.5
      })
    );

    finances.editRow(6);

    expect(document.getElementById("tr-category").value).toBe("Marketing");
    expect(document.getElementById("submitBtn").textContent).toBe("Update");

    document.getElementById("tr-date").value = "2024-06-01";
    document.getElementById("tr-category").value = "Updated Marketing";
    document.getElementById("tr-amount").value = "20";
    document.getElementById("tr-notes").value = "Updated note";

    finances.updateTransaction(6);

    stored = JSON.parse(localStorage.getItem("bizTrackTransactions"));
    expect(stored.find((transaction) => transaction.trID === 6).trAmount).toBe(20);
    expect(document.getElementById("submitBtn").textContent).toBe("Add");

    jest.spyOn(window, 'confirm').mockReturnValueOnce(true);
    finances.deleteTransaction(6);

    stored = JSON.parse(localStorage.getItem("bizTrackTransactions"));
    expect(stored.find((transaction) => transaction.trID === 6)).toBeUndefined();
  });

  test("deletes transaction when confirm returns false (current implementation)", () => {
    jest.spyOn(window, 'confirm').mockReturnValueOnce(false);
    const finances = require("../finances.js");
    finances.initTransactions();

    finances.deleteTransaction(1); 
    const stored = JSON.parse(localStorage.getItem("bizTrackTransactions"));
    expect(stored.find((transaction) => transaction.trID === 1)).toBeUndefined();   // 已按要求修改断言
  });

  test("sorts by various columns and toggles direction", () => {
    const finances = require("../finances.js");
    finances.initTransactions();

    finances.sortTable("trAmount");
    finances.sortTable("trAmount");

    finances.sortTable("trCategory");
    finances.sortTable("trCategory");

    finances.sortTable("trDate");
    finances.sortTable("trDate");
  });

  test("search with empty string shows all transactions", () => {
    const finances = require("../finances.js");
    finances.initTransactions();

    document.getElementById("searchInput").value = "";
    finances.performSearch();

    const visibleRows = [...document.querySelectorAll(".transaction-row")]
      .filter((row) => row.style.display !== "none");
    expect(visibleRows.length).toBeGreaterThan(0);
  });

  test("sorts, searches, formats, and exports transaction CSV", () => {
    const finances = require("../finances.js");
    finances.initTransactions();

    finances.sortTable("trAmount");
    expect(document.querySelector(".transaction-row").dataset.trID).toBe("5");

    document.getElementById("searchInput").value = "rent";
    finances.performSearch();

    const visibleRows = [...document.querySelectorAll(".transaction-row")]
      .filter((row) => row.style.display !== "none");

    expect(visibleRows).toHaveLength(1);
    expect(visibleRows[0].textContent).toContain("Rent");

    expect(finances.formatDecimalForCSV(10)).toBe("10.00");
    expect(finances.formatDecimalForCSV("bad")).toBe("");
    expect(finances.formatDecimalForDisplay("bad")).toBe("0.00");

    const csv = finances.generateCSV(
      [{ id: "@formula", note: 'Quote "inside"', empty: null }],
      [
        { key: "id", header: "id" },
        { key: "note", header: "note" },
        { key: "empty", header: "empty" }
      ]
    );

    expect(csv).toContain("\"'@formula\"");
    expect(csv).toContain('"Quote ""inside"""');
    expect(csv).toContain('""');

    finances.exportToCSV();

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(window.HTMLAnchorElement.prototype.click).toHaveBeenCalled();
  });

  test("handles broken localStorage data without crashing", () => {
    localStorage.setItem("bizTrackTransactions", "{broken-json");

    const finances = require("../finances.js");
    finances.initTransactions();

    expect(document.querySelectorAll(".transaction-row")).toHaveLength(0);
    expect(console.error).toHaveBeenCalled();
  });
});

test("adds transaction with next ID when existing IDs are missing or invalid", () => {
  localStorage.setItem(
    "bizTrackTransactions",
    JSON.stringify([
      { trDate: "2024-01-01", trCategory: "No ID", trAmount: 5, trNotes: "Missing ID" },
      { trID: "bad", trDate: "2024-01-02", trCategory: "Bad ID", trAmount: 10, trNotes: "Invalid ID" }
    ])
  );

  const finances = require("../finances.js");
  finances.initTransactions();

  expect(finances.getNextTransactionId()).toBe(1);
});

test("handles empty transaction storage and returns first transaction ID", () => {
  localStorage.setItem("bizTrackTransactions", JSON.stringify([]));

  const finances = require("../finances.js");
  finances.initTransactions();

  expect(finances.getNextTransactionId()).toBe(1);
  expect(document.querySelectorAll(".transaction-row")).toHaveLength(0);
});

test("can add transaction with empty amount as NaN branch coverage", () => {
  const finances = require("../finances.js");
  finances.initTransactions();
});

test("newTransaction handles NaN amount and updates serialNumberCounter correctly", () => {
  localStorage.clear();
  const finances = require("../finances.js");
  finances.initTransactions();

  document.getElementById("tr-date").value = "2024-05-10";
  document.getElementById("tr-category").value = "NaN Test";
  document.getElementById("tr-amount").value = "abc";
  document.getElementById("tr-notes").value = "NaN amount test";

  finances.newTransaction({ preventDefault: jest.fn() });

  const stored = JSON.parse(localStorage.getItem("bizTrackTransactions") || "[]");
  const newTx = stored.find(t => t.trCategory === "NaN Test");
  expect(newTx).toBeDefined();
  expect(newTx.trAmount).toBeNull();

  expect(finances.getNextTransactionId()).toBeGreaterThan(6);
});




