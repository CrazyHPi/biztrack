const { resetDom } = require("./test-utils");

function setupI18nDom() {
  document.body.innerHTML = `
    <input id="search" placeholder="" data-i18n="searchPlaceholder" />
    <select>
      <optgroup id="group" data-i18n="groupLabel"></optgroup>
    </select>
    <button id="text" data-i18n="buttonText"></button>
    <span id="title" data-i18n-title="titleText"></span>

    <div class="language-switcher">
      <button id="langButton"></button>
      <div class="language-dropdown" style="display: none"></div>
    </div>
  `;
}

describe("i18n.js", () => {
  beforeEach(() => {
    resetDom();
    setupI18nDom();

    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        searchPlaceholder: "Search...",
        groupLabel: "Products",
        buttonText: "Save",
        titleText: "Translated title",
        nested: {
          value: "Nested value"
        }
      })
    });
  });

  test("loads language, translates keys, and updates DOM", async () => {
    const i18n = require("../i18n.js");

    await i18n.loadLanguage("en");

    expect(fetch).toHaveBeenCalledWith("locales/en.json");
    expect(localStorage.getItem("bizTrackLang")).toBe("en");
    expect(document.documentElement.lang).toBe("en");

    expect(i18n.t("buttonText")).toBe("Save");
    expect(i18n.t("nested.value")).toBe("Nested value");
    expect(i18n.t("missing.key")).toBe("missing.key");

    i18n.translatePage();

    expect(document.getElementById("search").placeholder).toBe("Search...");
    expect(document.getElementById("group").label).toBe("Products");
    expect(document.getElementById("text").textContent).toBe("Save");
    expect(document.getElementById("title").title).toBe("Translated title");
  });

  test("handles language dropdown behavior", async () => {
    const i18n = require("../i18n.js");
    await i18n.loadLanguage("en");

    const button = document.getElementById("langButton");
    const dropdown = document.querySelector(".language-dropdown");
    const switcher = document.querySelector(".language-switcher");

    i18n.toggleLanguageDropdown({
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      currentTarget: button
    });

    expect(dropdown.style.display).toBe("block");
    expect(switcher.classList.contains("open")).toBe(true);

    i18n.closeAllLanguageDropdowns();

    expect(dropdown.style.display).toBe("none");
    expect(switcher.classList.contains("open")).toBe(false);
  });

  test("re-renders dynamic content hooks when available", () => {
    global.renderProducts = jest.fn();
    global.renderOrders = jest.fn();
    global.renderTransactions = jest.fn();
    global.renderSummaryCards = jest.fn();
    global.initializeChart = jest.fn();
    global.displayRevenue = jest.fn();
    global.displayExpenses = jest.fn();

    global.products = [];
    global.orders = [];
    global.transactions = [];

    const i18n = require("../i18n.js");

    i18n.reRenderDynamicContent();

    expect(global.renderSummaryCards).toHaveBeenCalled();
    expect(global.initializeChart).toHaveBeenCalled();
    expect(global.displayRevenue).toHaveBeenCalled();
    expect(global.displayExpenses).toHaveBeenCalled();
  });

  test("logs errors when language loading fails", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network failed"));

    const i18n = require("../i18n.js");

    await i18n.loadLanguage("zh");

    expect(console.error).toHaveBeenCalled();
  });
});

test("selectLanguage and switchLanguage update language state", async () => {
  const i18n = require("../i18n.js");

  await i18n.loadLanguage("en");

  await i18n.selectLanguage("zh");

  expect(localStorage.getItem("bizTrackLang")).toBe("zh");
  expect(document.documentElement.lang).toBe("zh");
});

test("switchLanguage handles event target language dataset", async () => {
  const i18n = require("../i18n.js");

  await i18n.loadLanguage("en");

  const button = document.createElement("button");
  button.dataset.lang = "zh";

  await i18n.switchLanguage({
    preventDefault: jest.fn(),
    target: button
  });

  expect(localStorage.getItem("bizTrackLang")).toBe("zh");
});

// Enhanced tests for branch coverage
test("toggleLanguageDropdown handles both open and closed states", async () => {
  const i18n = require("../i18n.js");
  await i18n.loadLanguage("en");

  const button = document.getElementById("langButton");
  const dropdown = document.querySelector(".language-dropdown");

  i18n.toggleLanguageDropdown({ preventDefault: jest.fn(), stopPropagation: jest.fn(), currentTarget: button });
  expect(dropdown.style.display).toBe("block");

  i18n.toggleLanguageDropdown({ preventDefault: jest.fn(), stopPropagation: jest.fn(), currentTarget: button });
  expect(dropdown.style.display).toBe("none");
});

test("switchLanguage falls back correctly when no dataset.lang", async () => {
  const i18n = require("../i18n.js");
  await i18n.loadLanguage("en");

  const event = {
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target: { dataset: {} }
  };

  i18n.switchLanguage(event);
  expect(localStorage.getItem("bizTrackLang")).toBe("zh");
});
