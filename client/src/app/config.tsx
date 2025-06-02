export function isLocalhost(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

export function getSiteKey(): string {
  const localSiteKey = "1x00000000000000000000AA";
  const prodSiteKey = "0x4AAAAAAA1LpisXytC6T07b";
  return isLocalhost() ? localSiteKey : prodSiteKey;
}

export function getApiUrl(){

    if(isLocalhost()){
        return 'http://localhost:8000';
    }else{
        return 'https://api.paperguides.org';
    }
}

export function darkModeOn() {
    return (localStorage.getItem("darkmode") === "active");
}