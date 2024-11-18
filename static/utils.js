
function goBack() {
    const referrer = document.referrer;
    const mySite = window.location.origin;

    if (referrer && referrer.startsWith(mySite)) {
        // Referrer is from the same site
        history.back();
    } else {
        // Referrer is external or not present
        window.location.href = '/';
    }
}
