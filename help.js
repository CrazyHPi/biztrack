// SIDEBAR TOGGLE

function openSidebar() {
    var side = document.getElementById('sidebar');
    if (window.getComputedStyle(side).display === "none") {
      side.style.display = "block";
    } else {
      side.style.display = "none";
    }
}
  
function closeSidebar() {
    document.getElementById('sidebar').style.display = 'none';
}
