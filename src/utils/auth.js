// Auth helpers - validate a JWT's shape/expiry before trusting it as "logged in"

function decodeJwtPayload(token) {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
                .join('')
        );
        return JSON.parse(json);
    } catch (e) {
        return null;
    }
}

export function isTokenValid(token) {
    if (!token) return false;
    const payload = decodeJwtPayload(token);
    if (!payload) return false;
    if (payload.exp && Date.now() >= payload.exp * 1000) return false;
    return true;
}

export function hasValidSession() {
    const token = localStorage.getItem('token');
    if (isTokenValid(token)) return true;
    // Stale/expired/malformed token - clear it so the app doesn't get stuck off the login page
    localStorage.removeItem('token');
    return false;
}

// A token can be well-formed and unexpired yet still be rejected by the API
// (e.g. it was issued by a different backend/environment). Once that happens
// every authenticated request 401s and the app looks "stuck" on a broken
// home page instead of returning to Login. Catch that globally so the user
// always lands back on Login when their session is actually invalid.
let interceptorInstalled = false;

export function installAuthInterceptor(onSessionExpired) {
    if (interceptorInstalled) return;
    interceptorInstalled = true;

    const originalFetch = window.fetch.bind(window);
    window.fetch = async (...args) => {
        const response = await originalFetch(...args);
        const hadAuthHeader = (() => {
            const init = args[1];
            const headers = init && init.headers;
            if (!headers) return false;
            if (headers instanceof Headers) return headers.has('Authorization');
            return Object.keys(headers).some((h) => h.toLowerCase() === 'authorization');
        })();

        if (response.status === 401 && hadAuthHeader && localStorage.getItem('token')) {
            localStorage.removeItem('token');
            onSessionExpired();
        }

        return response;
    };
}
