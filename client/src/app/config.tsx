export function isLocalhost(): boolean {
  try {
    return window.location.hostname === "localhost";
  } catch (error) {
    return false;
  }
}

export function getSiteKey(): string {
  console.log(process.env.SITE_KEY);
  return process.env.NEXT_PUBLIC_SITE_KEY || "0x4AAAAAAA1LsUg4unsYRplP";
}
// this is done so "legacy" code still functions; else the parameter is not required
export function getApiUrl(isLocal: boolean) {
  return process.env.NEXT_PUBLIC_API_URL || "https://api.paperguides.org";
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://paperguides.org";
}


export function darkModeOn() {
  return localStorage.getItem("darkmode") === "active";
}
