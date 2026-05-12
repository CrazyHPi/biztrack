const { resetDom } = require("./test-utils");

describe("help.js", () => {
  beforeEach(() => {
    resetDom();
    document.body.innerHTML = `<div id="sidebar" style="display: none"></div>`;
  });

  test("toggles and closes help sidebar", () => {
    const help = require("../help.js");

    help.openSidebar();
    expect(document.getElementById("sidebar").style.display).toBe("block");

    help.openSidebar();
    expect(document.getElementById("sidebar").style.display).toBe("none");

    help.closeSidebar();
    expect(document.getElementById("sidebar").style.display).toBe("none");
  });
});
