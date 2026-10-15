export const getApiBase = () => {
    if (typeof window !== 'undefined') {
        if (window.__API_URL__) {
            return String(window.__API_URL__).replace(/\/$/, '');
        }
        if (window.VITE_API_URL) {
            return String(window.VITE_API_URL).replace(/\/$/, '');
        }
        if (window.REACT_APP_API_URL) {
            return String(window.REACT_APP_API_URL).replace(/\/$/, '');
        }
    }
    if (typeof process !== 'undefined' && process.env) {
        if (process.env.VITE_API_URL) {
            return String(process.env.VITE_API_URL).replace(/\/$/, '');
        }
        if (process.env.REACT_APP_API_URL) {
            return String(process.env.REACT_APP_API_URL).replace(/\/$/, '');
        }
    }
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        if (import.meta.env.VITE_API_URL) {
            return String(import.meta.env.VITE_API_URL).replace(/\/$/, '');
        }
        if (import.meta.env.REACT_APP_API_URL) {
            return String(import.meta.env.REACT_APP_API_URL).replace(/\/$/, '');
        }
    }
    return '';
};

export const apiUrl = (endpoint) => {
    const base = getApiBase();
    if (!endpoint.startsWith('/')) {
        return `${base}/${endpoint}`;
    }
    return `${base}${endpoint}`;
};
