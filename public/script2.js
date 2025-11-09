// Media query to detect when screen ≤ 1000px
const mediaQuery = window.matchMedia("(max-width: 1000px)");
const container = document.getElementById("container");

function handleScreenChange(e) {
  if (e.matches) {
    // ✅ Screen ≤ 1000px — show waves
    container.innerHTML = `
      <div class="wave"></div>
      <div class="wave"></div>
      <div class="wave"></div>
    `;
  } else {
    // 🖤 Screen > 1000px — only black background
    container.innerHTML = "";
  }
}

// Run at load
handleScreenChange(mediaQuery);

// Listen for resize
mediaQuery.addEventListener("change", handleScreenChange);
