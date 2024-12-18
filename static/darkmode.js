document.addEventListener("DOMContentLoaded", () => {
  let darkmode = localStorage.getItem("darkmode");
  const themeSwitch = document.getElementById("theme-switch");

  function enableDarkMode() {
    document.body.classList.add("darkmode");
    localStorage.setItem("darkmode", "active");
  }

  function disableDarkMode() {
    document.body.classList.remove("darkmode");
    localStorage.setItem("darkmode", null);
  }

  // Apply dark mode if previously set
  if (darkmode === "active") {
    enableDarkMode();
  }

  // Add event listener to theme switch button
  if (themeSwitch) {
    themeSwitch.addEventListener("click", () => {
      let currentMode = localStorage.getItem("darkmode");
      currentMode !== "active" ? enableDarkMode() : disableDarkMode();
    });
  }
});
