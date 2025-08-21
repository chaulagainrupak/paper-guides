export function isLocalhost(): boolean {
  try {
    return window.location.hostname === "localhost";
  } catch (error) {
    return false;
  }
}

export function getSiteKey(): string {
  return process.env.SITE_KEY || "1x00000000000000000000AA";
}

export function getApiUrl(isLocal: boolean) {
  return process.env.API_URL || "http://localhost:8000"; 
}


export function darkModeOn() {
  return localStorage.getItem("darkmode") === "active";
}
