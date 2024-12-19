document.addEventListener("DOMContentLoaded", () => {
  const themeSwitch = document.getElementById("theme-switch");

  // Ensure the button exists
  if (!themeSwitch) {
    console.error("Button with ID 'theme-switch' not found.");
    return;
  }

  // Get dark mode preference
  let darkmode = localStorage.getItem("darkmode");

  function enableDarkMode() {
    document.documentElement.classList.add("darkmode");
    localStorage.setItem("darkmode", "active");
  }

  function disableDarkMode() {
    document.documentElement.classList.remove("darkmode");
    localStorage.setItem("darkmode", "null");
  }

  // Apply dark mode if previously active
  if (darkmode === "active") {
    enableDarkMode();
  }

  // Toggle dark mode on button click
  themeSwitch.addEventListener("click", () => {
    darkmode = localStorage.getItem("darkmode");
    if (darkmode !== "active") {
      enableDarkMode();
    } else {
      disableDarkMode();
    }
  });
});
