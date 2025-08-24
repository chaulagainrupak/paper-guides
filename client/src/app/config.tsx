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
// this is done so "legacy" code still functions; else the parameter is not required 
export function getApiUrl(isLocal: boolean) {
  return process.env.API_URL || "http://localhost:8000"; 
}


export function darkModeOn() {
  return localStorage.getItem("darkmode") === "active";
}
