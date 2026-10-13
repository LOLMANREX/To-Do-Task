export const getApiBase = () => {
    if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
        return 'http://localhost:3000';
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
