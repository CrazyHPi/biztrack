const { resetDom } = require("./test-utils");

function setupProductDom() {
  document.body.innerHTML = `
    <div id="sidebar" style="display: none"></div>
    <form id="product-form" style="display: none">
      <input id="product-id" />
      <input id="product-name" />
      <input id="product-desc" />
      <input id="product-cat" />
      <input id="product-price" />
      <input id="product-sold" />
      <button id="submitBtn" type="button">Add</button>
    </form>
    <input id="searchInput" />
    <table>
      <tbody id="tableBody"></tbody>
    </table>
  `;
}

describe("products.js", () => {
  beforeEach(() => {
    resetDom();
    setupProductDom();
  });

  test("validates product price and units sold", () => {
    const products = require("../products.js");

    expect(products.validateProductInput(10, 2)).toBe(true);
    expect(products.validateProductInput(-1, 2)).toBe(false);
    expect(products.validateProductInput(Number.NaN, 2)).toBe(false);
    expect(products.validateProductInput(10, 2.5)).toBe(false);
    expect(products.validateProductInput(10, -1)).toBe(false);
    expect(alert).toHaveBeenCalled();
  });

  test("toggles sidebar and product form", () => {
    const products = require("../products.js");

    products.openSidebar();
    expect(document.getElementById("sidebar").style.display).toBe("block");

    products.openSidebar();
    expect(document.getElementById("sidebar").style.display).toBe("none");

    products.closeSidebar();
    expect(document.getElementById("sidebar").style.display).toBe("none");

    products.openForm();
    expect(document.getElementById("product-form").style.display).toBe("block");

    products.closeForm();
    expect(document.getElementById("product-form").style.display).toBe("none");
  });

  test("initializes default products and renders table rows", () => {
    const products = require("../products.js");

    products.init();

    expect(document.querySelectorAll(".product-row")).toHaveLength(5);
    expect(localStorage.getItem("bizTrackProducts")).toContain("PD001");
  });

  test("adds a new product and blocks duplicate IDs", () => {
    const products = require("../products.js");
    products.init();

    document.getElementById("product-id").value = "PD999";
    document.getElementById("product-name").value = "Test Mug";
    document.getElementById("product-desc").value = "Demo item";
    document.getElementById("product-cat").value = "Drinkware";
    document.getElementById("product-price").value = "12.5";
    document.getElementById("product-sold").value = "3";

    products.newProduct({ preventDefault: jest.fn() });

    let stored = JSON.parse(localStorage.getItem("bizTrackProducts"));
    expect(stored).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          prodID: "PD999",
          prodPrice: 12.5,
          prodSold: 3
        })
      ])
    );
    expect(document.body.textContent).toContain("PD999");

    document.getElementById("product-id").value = "PD001";
    document.getElementById("product-name").value = "Duplicate";
    document.getElementById("product-desc").value = "Duplicate item";
    document.getElementById("product-cat").value = "Hats";
    document.getElementById("product-price").value = "1";
    document.getElementById("product-sold").value = "1";

    products.newProduct({ preventDefault: jest.fn() });

    stored = JSON.parse(localStorage.getItem("bizTrackProducts"));
    expect(stored.filter((product) => product.prodID === "PD001")).toHaveLength(1);
    expect(alert).toHaveBeenCalledWith("Duplicate Product ID");
  });

  test("edits, updates, and deletes products", () => {
    const products = require("../products.js");
    products.init();

    products.editRow("PD001");

    expect(document.getElementById("product-id").value).toBe("PD001");
    expect(document.getElementById("submitBtn").textContent).toBe("Update");
    expect(document.getElementById("product-form").style.display).toBe("block");

    document.getElementById("product-name").value = "Updated Cap";
    document.getElementById("product-desc").value = "Updated description";
    document.getElementById("product-cat").value = "Hats";
    document.getElementById("product-price").value = "30";
    document.getElementById("product-sold").value = "4";

    products.updateProduct("PD001");

    let stored = JSON.parse(localStorage.getItem("bizTrackProducts"));
    expect(stored.find((product) => product.prodID === "PD001").prodName).toBe("Updated Cap");
    expect(document.getElementById("submitBtn").textContent).toBe("Add");

    products.deleteProduct("PD002");

    stored = JSON.parse(localStorage.getItem("bizTrackProducts"));
    expect(stored.find((product) => product.prodID === "PD002")).toBeUndefined();

    products.deleteProduct("DOES_NOT_EXIST");
    expect(JSON.parse(localStorage.getItem("bizTrackProducts"))).toHaveLength(stored.length);
  });

  test("sorts, searches, formats, and exports product CSV", () => {
    const products = require("../products.js");
    products.init();

    products.sortTable("prodPrice");
    expect(document.querySelector(".product-row").dataset.prodID).toBe("PD004");

    products.sortTable("prodName");
    expect(document.querySelector(".product-row").dataset.prodName).toBe("Baseball caps");

    document.getElementById("searchInput").value = "sweat";
    products.performSearch();

    const visibleRows = [...document.querySelectorAll(".product-row")]
      .filter((row) => row.style.display !== "none");

    expect(visibleRows).toHaveLength(1);
    expect(visibleRows[0].textContent).toContain("Sweatshirts");

    expect(products.formatDecimalForCSV(3)).toBe("3.00");
    expect(products.formatDecimalForCSV("bad")).toBe("");
    expect(products.formatDecimalForDisplay("bad")).toBe("0.00");

    const csv = products.generateCSV(
      [{ id: "=SUM(A1:A2)", name: 'A "quoted" value', empty: null }],
      [
        { key: "id", header: "id" },
        { key: "name", header: "name" },
        { key: "empty", header: "empty" }
      ]
    );

    expect(csv).toContain("\"'=SUM(A1:A2)\"");
    expect(csv).toContain('"A ""quoted"" value"');
    expect(csv).toContain('""');

    products.exportToCSV();

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(window.HTMLAnchorElement.prototype.click).toHaveBeenCalled();
  });
});

test("does not add product when input validation fails", () => {
  const products = require("../products.js");
  products.init();

  const before = JSON.parse(localStorage.getItem("bizTrackProducts")).length;

  document.getElementById("product-id").value = "PD998";
  document.getElementById("product-name").value = "Invalid Product";
  document.getElementById("product-desc").value = "Invalid";
  document.getElementById("product-cat").value = "Test";
  document.getElementById("product-price").value = "-10";
  document.getElementById("product-sold").value = "1";

  products.newProduct({ preventDefault: jest.fn() });

  const after = JSON.parse(localStorage.getItem("bizTrackProducts")).length;

  expect(after).toBe(before);
  expect(alert).toHaveBeenCalled();
});

test("does not update product when validation fails", () => {
  const products = require("../products.js");
  products.init();

  products.editRow("PD001");

  document.getElementById("product-price").value = "-5";
  document.getElementById("product-sold").value = "2";

  products.updateProduct("PD001");

  const stored = JSON.parse(localStorage.getItem("bizTrackProducts"));
  const product = stored.find((item) => item.prodID === "PD001");

  expect(product.prodPrice).not.toBe(-5);
  expect(alert).toHaveBeenCalled();
});

test("handles missing product when editing or updating", () => {
  const products = require("../products.js");
  products.init();

  expect(() => products.editRow("UNKNOWN_ID")).not.toThrow();
  expect(() => products.updateProduct("UNKNOWN_ID")).not.toThrow();
});

test("search hides all products when there is no match", () => {
  const products = require("../products.js");
  products.init();

  document.getElementById("searchInput").value = "no-product-should-match-this";
  products.performSearch();

  const visibleRows = [...document.querySelectorAll(".product-row")]
    .filter((row) => row.style.display !== "none");

  expect(visibleRows).toHaveLength(0);
});

test("sortTable handles unsupported product key without crashing", () => {
  const products = require("../products.js");
  products.init();

  expect(() => products.sortTable("unknownKey")).not.toThrow();
});

test("newProduct/updateProduct handles localStorage error and validation failure", () => {
  const products = require("../products.js");
  products.init();

  jest.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => { throw new Error("quota"); });

  document.getElementById("product-price").value = "-10";
  expect(() => products.newProduct({ preventDefault: jest.fn() })).not.toThrow();
  expect(alert).toHaveBeenCalled();
});

test("newProduct / updateProduct handles validation failure and localStorage error", () => {
  const products = require("../products.js");
  products.init();

  jest.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => { throw new Error("quota"); });
  jest.spyOn(console, "error").mockImplementation(() => {});

  document.getElementById("product-price").value = "-10";
  expect(() => products.newProduct({ preventDefault: jest.fn() })).not.toThrow();
  expect(alert).toHaveBeenCalled();
});
