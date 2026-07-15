const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

let isOffline = false;
let listeners = new Set();
let queue = [];
let healthCheckInterval = null;

const notifyListeners = () => {
  listeners.forEach(cb => cb(isOffline));
};

export const addOfflineListener = (cb) => {
  listeners.add(cb);
};

export const removeOfflineListener = (cb) => {
  listeners.delete(cb);
};

export const getIsOffline = () => isOffline;

export const setOnline = async () => {
  if (!isOffline) return;
  isOffline = false;
  notifyListeners();
  
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }

  // Drain/process queue
  const currentQueue = [...queue];
  queue = [];
  for (const item of currentQueue) {
    try {
      const res = await request(item.endpoint, item.options);
      item.resolve(res);
    } catch (err) {
      item.reject(err);
    }
  }
};

const startHealthCheck = () => {
  if (healthCheckInterval) return;
  healthCheckInterval = setInterval(async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/health`);
      if (res.ok) {
        await setOnline();
      }
    } catch (err) {
      // still offline
    }
  }, 5000);
};

export const setOffline = () => {
  if (isOffline) return;
  isOffline = true;
  notifyListeners();
  startHealthCheck();
};

const request = async (endpoint, options = {}) => {
  if (isOffline) {
    return new Promise((resolve, reject) => {
      queue.push({ endpoint, options, resolve, reject });
    });
  }

  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...config,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Something went wrong');
    }

    // Handle empty responses (like 204 or delete responses)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  } catch (error) {
    clearTimeout(timeoutId);

    const isTimeout = error.name === 'AbortError';
    const isNetworkError = error instanceof TypeError || error.message?.includes('Failed to fetch');

    if (isTimeout || isNetworkError) {
      setOffline();
      return new Promise((resolve, reject) => {
        queue.push({ endpoint, options, resolve, reject });
      });
    }

    throw error;
  }
};

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

