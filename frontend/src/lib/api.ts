import { NavigateFunction } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';

export const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiFetch = async (url: string, options: RequestInit = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
    };

    const res = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        // Handle unauthorized (clear token)
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    if (!res.ok) {
        let errStr = res.statusText;
        try {
            const errBody = await res.json();
            errStr = errBody.error || errStr;
        } catch(e) {}
        throw new Error(errStr);
    }

    // PDF download special case
    if (res.headers.get('Content-Type')?.includes('application/pdf')) {
        return res.blob();
    }

    // Attempt to return JSON, otherwise text if empty
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
};
