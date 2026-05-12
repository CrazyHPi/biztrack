const { resetDom } = require("./test-utils");

function setupDashboardDom() {
  document.body.innerHTML = `
    <div id="sidebar" style="display: none"></div>
    <div id="rev-amount"></div>
    <div id="exp-amount"></div>
    <div id="balance"></div>
    <div id="num-orders"></div>
    <div id="bar-chart"></div>
    <div id="donut-chart"></div>
  `;

  global.ApexCharts = jest.fn().mockImplementation(function ApexChartsMock(element, options) {
    this.element = element;
    this.options = options;
    this.render = jest.fn();
    this.destroy = jest.fn();
  });

  window.ApexCharts = global.ApexCharts;
}

function seedDashboardData() {
  localStorage.setItem(
    "bizTrackOrders",
    JSON.stringify([
      { orderID: "1", orderTotal: 30 },
      { orderID: "2", orderTotal: 20 }
    ])
  );

  localStorage.setItem(
    "bizTrackTransactions",
    JSON.stringify([
      { trID: 1, trCategory: "Rent", trAmount: 5 },
      { trID: 2, trCategory: "Supplies", trAmount: 15 }
    ])
  );

  localStorage.setItem(
    "bizTrackProducts",
    JSON.stringify([
      { prodID: "P1", prodCat: "Hats", prodPrice: 10, prodSold: 2 },
      { prodID: "P2", prodCat: "Hats", prodPrice: 5, prodSold: 4 },
      { prodID: "P3", prodCat: "Drinkware", prodPrice: 3, prodSold: 10 }
    ])
  );
}

describe("script.js dashboard", () => {
  beforeEach(() => {
    resetDom();
    setupDashboardDom();
    seedDashboardData();
  });

  test("calculates totals and renders summary cards", () => {
    const dashboard = require("../script.js");

    expect(dashboard.calculateExpTotal([{ trAmount: 5 }, { trAmount: 15 }])).toBe(20);
    expect(dashboard.calculateRevTotal([{ orderTotal: 30 }, { orderTotal: 20 }])).toBe(50);
    expect(dashboard.calculateCategorySales([
      { prodCat: "A", prodPrice: 2, prodSold: 3 },
      { prodCat: "A", prodPrice: 4, prodSold: 1 },
      { prodCat: "B", prodPrice: 1, prodSold: 10 }
    ])).toEqual({ A: 10, B: 10 });

    dashboard.renderSummaryCards();

    expect(document.getElementById("rev-amount").textContent).toContain("$50.00");
    expect(document.getElementById("exp-amount").textContent).toContain("$20.00");
    expect(document.getElementById("balance").textContent).toContain("$30.00");
    expect(document.getElementById("num-orders").textContent).toContain("2");
  });

  test("initializes charts and destroys previous chart instances on rerender", () => {
    const dashboard = require("../script.js");

    expect(global.ApexCharts).toHaveBeenCalledTimes(2);
    expect(window.barChart.render).toHaveBeenCalled();
    expect(window.donutChart.render).toHaveBeenCalled();

    const previousBarChart = window.barChart;
    const previousDonutChart = window.donutChart;

    dashboard.initializeChart();

    expect(previousBarChart.destroy).toHaveBeenCalled();
    expect(previousDonutChart.destroy).toHaveBeenCalled();
    expect(global.ApexCharts).toHaveBeenCalledTimes(4);
  });

  test("toggles dashboard sidebar", () => {
    const dashboard = require("../script.js");

    dashboard.openSidebar();
    expect(document.getElementById("sidebar").style.display).toBe("block");

    dashboard.openSidebar();
    expect(document.getElementById("sidebar").style.display).toBe("none");

    dashboard.closeSidebar();
    expect(document.getElementById("sidebar").style.display).toBe("none");
  });

  test("falls back to defaults when dashboard storage is invalid", () => {
    localStorage.setItem("bizTrackOrders", "{bad-json");
    localStorage.setItem("bizTrackTransactions", "{bad-json");
    localStorage.setItem("bizTrackProducts", "{bad-json");

    const dashboard = require("../script.js");

    dashboard.renderSummaryCards();

    expect(console.error).toHaveBeenCalled();
    expect(document.getElementById("rev-amount").textContent).toContain("$320.90");
    expect(document.getElementById("exp-amount").textContent).toContain("$455.00");
  });
});

test("calculate functions handle empty arrays and invalid data", () => {
  const dashboard = require("../script.js");

  expect(dashboard.calculateExpTotal([])).toBe(0);
  expect(dashboard.calculateRevTotal([])).toBe(0);
  expect(dashboard.calculateCategorySales([])).toEqual({});

  localStorage.removeItem("bizTrackProducts");
  dashboard.renderSummaryCards();
  expect(console.error).toHaveBeenCalled();  
});

test("calculate functions handle empty arrays and invalid data", () => {
  const dashboard = require("../script.js");

  expect(dashboard.calculateExpTotal([])).toBe(0);
  expect(dashboard.calculateRevTotal([])).toBe(0);
  expect(dashboard.calculateCategorySales([])).toEqual({});

  jest.spyOn(Storage.prototype, "getItem").mockReturnValueOnce("invalid json");
  jest.spyOn(console, "error").mockImplementation(() => {});
  dashboard.renderSummaryCards();
  expect(console.error).toHaveBeenCalled();
});
