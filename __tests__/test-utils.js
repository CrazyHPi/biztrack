function installDomMocks(tOverrides = {}) {
  global.alert = jest.fn();

  global.t = (key) => {
    const dictionary = {
      update: "Update",
      add: "Add",
      totalRevenue: "Total Revenue",
      totalExpenses: "Total Expenses",
      revenue: "Revenue",
      expenses: "Expenses",
      balance: "Balance",
      orders: "Orders",
      "chart.totalSales": "Total Sales",
      "chart.yAxis.sales": "Sales",
      "alert.duplicateProductID": "Duplicate Product ID",
      "alert.duplicateOrderID": "Duplicate Order ID",
      ...tOverrides
    };

    return dictionary[key] || key;
  };

  Object.defineProperty(window.HTMLElement.prototype, "innerText", {
    configurable: true,
    get() {
      return this.textContent;
    },
    set(value) {
      this.textContent = value;
    }
  });

  Object.defineProperty(global.URL, "createObjectURL", {
    configurable: true,
    writable: true,
    value: jest.fn(() => "blob:mock-url")
  });

  Object.defineProperty(global.URL, "revokeObjectURL", {
    configurable: true,
    writable: true,
    value: jest.fn()
  });

  if (!window.HTMLAnchorElement.prototype.click._isMockFunction) {
    window.HTMLAnchorElement.prototype.click = jest.fn();
  }
}

function resetDom(tOverrides) {
  jest.restoreAllMocks();
  jest.resetModules();
  localStorage.clear();
  document.body.innerHTML = "";
  installDomMocks(tOverrides);
  jest.spyOn(console, "error").mockImplementation(() => {});
}

module.exports = {
  resetDom
};
