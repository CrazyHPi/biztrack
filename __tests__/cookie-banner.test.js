const { resetDom } = require("./test-utils");

describe("cookie-banner.js", () => {
  beforeEach(() => {
    resetDom();
  });

  test("creates accessible cookie banner", () => {
    const cookieBanner = require("../cookie-banner.js");

    cookieBanner.createCookieBanner();

    const banner = document.querySelector(".cookie-banner");

    expect(banner).not.toBeNull();
    expect(banner.getAttribute("role")).toBe("dialog");
    expect(banner.getAttribute("aria-label")).toBe("Cookie consent notice");
    expect(document.querySelector(".cookie-policy-link").getAttribute("href")).toBe("privacy.html");
    expect(document.getElementById("necessaryCookies")).not.toBeNull();
    expect(document.getElementById("rejectCookies")).not.toBeNull();
    expect(document.getElementById("acceptCookies")).not.toBeNull();
  });

  test("stores accepted, rejected, and necessary cookie choices", () => {
    const cookieBanner = require("../cookie-banner.js");

    cookieBanner.createCookieBanner();
    document.getElementById("acceptCookies").click();

    expect(localStorage.getItem("cookieConsent")).toBe("accepted");
    expect(localStorage.getItem("cookieConsentDate")).toBeTruthy();
    expect(document.querySelector(".cookie-banner")).toBeNull();

    cookieBanner.createCookieBanner();
    document.getElementById("rejectCookies").click();

    expect(localStorage.getItem("cookieConsent")).toBe("rejected");
    expect(document.querySelector(".cookie-banner")).toBeNull();

    cookieBanner.createCookieBanner();
    document.getElementById("necessaryCookies").click();

    expect(localStorage.getItem("cookieConsent")).toBe("necessary");
    expect(document.querySelector(".cookie-banner")).toBeNull();
  });

  test("showCookieBanner clears old consent and recreates banner", () => {
    const cookieBanner = require("../cookie-banner.js");

    localStorage.setItem("cookieConsent", "accepted");
    localStorage.setItem("cookieConsentDate", "2024-01-01T00:00:00.000Z");

    cookieBanner.showCookieBanner();

    expect(localStorage.getItem("cookieConsent")).toBeNull();
    expect(localStorage.getItem("cookieConsentDate")).toBeNull();
    expect(document.querySelector(".cookie-banner")).not.toBeNull();
  });

  test("DOMContentLoaded does not show banner when consent exists", () => {
    localStorage.setItem("cookieConsent", "accepted");

    require("../cookie-banner.js");

    document.dispatchEvent(new Event("DOMContentLoaded"));

    expect(document.querySelector(".cookie-banner")).toBeNull();
  });
});

test("DOMContentLoaded shows banner when no consent exists", () => {
  localStorage.removeItem("cookieConsent");

  require("../cookie-banner.js");

  document.dispatchEvent(new Event("DOMContentLoaded"));

  expect(document.querySelector(".cookie-banner")).not.toBeNull();
});

test("createCookieBanner removes an existing banner before creating a new one", () => {
  const cookieBanner = require("../cookie-banner.js");

  cookieBanner.createCookieBanner();
  cookieBanner.createCookieBanner();

  expect(document.querySelectorAll(".cookie-banner")).toHaveLength(1);
});
