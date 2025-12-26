const navbar = document.getElementById("sidebar");
function openSidebar() {
  navbar.classList.add("show");
}
function closebar() {
  navbar.classList.remove("show");
}

// Close sidebar when clicking outside of it
document.addEventListener("click", function (event) {
  const openBtn = document.getElementById("openSidebar");
  if (!navbar.contains(event.target) && !openBtn.contains(event.target)) {
    closebar();
  }
});
