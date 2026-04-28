document.addEventListener("DOMContentLoaded", function () {
  const existingConsent = localStorage.getItem("cookieConsent");

  if (existingConsent) {
    return;
  }

  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Cookie consent notice");

  banner.innerHTML = `
    <div class="cookie-banner-content">
      <p>
        This website uses cookies and local storage to remember your preferences
        and improve your experience.
      </p>

      <div class="cookie-banner-actions">
        <a href="privacy.html" class="cookie-policy-link">Privacy Policy</a>
        <button type="button" id="necessaryCookies">Necessary Only</button>
        <button type="button" id="rejectCookies">Reject</button>
        <button type="button" id="acceptCookies">Accept All</button>
      </div>
    </div>
  `;

  document.body.appendChild(banner);

  function saveConsent(choice) {
    localStorage.setItem("cookieConsent", choice);
    localStorage.setItem("cookieConsentDate", new Date().toISOString());
    banner.remove();
  }

  document.getElementById("necessaryCookies").addEventListener("click", function () {
    saveConsent("necessary");
  });

  document.getElementById("rejectCookies").addEventListener("click", function () {
    saveConsent("rejected");
  });

  document.getElementById("acceptCookies").addEventListener("click", function () {
    saveConsent("accepted");
  });
});
