export function isLocalhost(): boolean {
  try {
    return window.location.hostname === "localhost";
  } catch (error) {
    return false;
  }
}

export function getSiteKey(): string {
  return process.env.SITE_KEY || "0x4AAAAAAA1LsUg4unsYRplP";
}
// this is done so "legacy" code still functions; else the parameter is not required 
export function getApiUrl(isLocal: boolean) {
  return process.env.API_URL || "http://api.paperguides.org"; 
}


export function darkModeOn() {
  return localStorage.getItem("darkmode") === "active";
}
