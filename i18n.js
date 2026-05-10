const i18n = {
  currentLang: "en",
  translations: {},

  async init(lang) {
    if (!lang) {
      lang = localStorage.getItem("lang") || navigator.language.slice(0, 2);
    }
    if (!["en", "zh"].includes(lang)) lang = "en";

    this.currentLang = lang;
    localStorage.setItem("lang", lang);

    try {
      const response = await fetch(`locales/${lang}.json`);
      this.translations = await response.json();
    } catch (error) {
      console.error("Failed to load language file:", error);
      this.translations = {};
    }

    this.translatePage();
    document.documentElement.lang = lang;

    const btn = document.getElementById("lang-switch");
    if (btn) {
      btn.textContent =
        this.translations["language"] || (lang === "en" ? "中文" : "English");
    }

    document.dispatchEvent(
      new CustomEvent("languageChanged", { detail: { lang } }),
    );
  },

  translatePage() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (this.translations[key]) {
        el.textContent = this.translations[key];
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (this.translations[key]) {
        el.setAttribute("placeholder", this.translations[key]);
      }
    });

    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      if (this.translations[key]) {
        el.setAttribute("title", this.translations[key]);
      }
    });
  },

  switchLang() {
    const newLang = this.currentLang === "en" ? "zh" : "en";
    this.init(newLang);
  },
};
