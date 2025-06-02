export function isLocalhost(): boolean {
  return (
    window.location.hostname === "localhost"
  );
}

export function getSiteKey(): string {
  const localSiteKey = "1x00000000000000000000AA";
  const prodSiteKey = "0x4AAAAAAA1LsUg4unsYRplP";
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