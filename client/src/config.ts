import { browser } from '$app/environment';

let isLocal = true;

if (browser) {
	const hostName = location.hostname;
	isLocal = !(hostName === 'paperguides.org');
} else {
	// Server side: Assume production
	isLocal = false;
}

export default isLocal;
