const BASE = process.env.NEXT_PUBLIC_API_URL 

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('hr_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers });
  } catch {
    throw new ApiError('Unable to reach the server. Please check your connection.', 0);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data?.message || 'Something went wrong', res.status);
  }

  return data;
}

// Custom error class — carries status code for UI decisions
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export function friendlyError(err, context = '') {
  if (!(err instanceof ApiError)) return 'Something went wrong. Please try again.';
  
  const { status, message } = err;

  if (status === 400) {
    if (context === 'publish') return 'Add at least one image before publishing.';
    return message || 'Please check your input and try again.';
  }
  
  if (status === 0) return 'Unable to reach the server. Check your connection.';
  if (status === 401) {
    if (context === 'login' || context === 'auth') {
      return message || 'Invalid email or password.';
    }
    return message && message !== 'Unauthorized' ? message : 'Your session has expired. Please log in again.';
  }

  if (status === 403) return "You don't have permission to perform this action.";
  if (status === 404) return context === 'property' ? 'This property no longer exists.' : 'Requested resource not found.';
  if (status === 409) return message || 'An account with this email already exists.';
  if (status === 429) return 'Too many attempts. Please wait a few minutes and try again.';
  if (status >= 500) return 'The server encountered an error. Please try again shortly.';

  return message || 'Something went wrong. Please try again.';
}

// Auth    
export const authApi = {
  register: (body) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (body) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
};

//Properties 
export const propertyApi = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    ).toString();
    return request(`/properties${q ? `?${q}` : ''}`);
  },
  getOne:         (id)       => request(`/properties/${id}`),
  create:         (body)     => request('/properties', { method: 'POST', body: JSON.stringify(body) }),
  update:         (id, body) => request(`/properties/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete:         (id)       => request(`/properties/${id}`, { method: 'DELETE' }),
  publish:        (id)       => request(`/properties/${id}/publish`, { method: 'PATCH' }),
  archive:        (id)       => request(`/properties/${id}/archive`, { method: 'PATCH' }),
  myProperties:   (params={})=> {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    ).toString();
    return request(`/properties/my-properties${q ? `?${q}` : ''}`);
  },
  adminAll:       (params={})=> {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    ).toString();
    return request(`/properties/admin/all${q ? `?${q}` : ''}`);
  },
  disable:        (id)       => request(`/properties/${id}/disable`, { method: 'PATCH' }),
};

// ── Favorites
export const favoriteApi = {
  getAll:  ()           => request('/favorites'),
  add:     (propertyId) => request(`/favorites/${propertyId}`, { method: 'POST' }),
  remove:  (propertyId) => request(`/favorites/${propertyId}`, { method: 'DELETE' }),
};

//Inquiries 
export const inquiryApi = {
  send:            (propertyId, body) =>
  request(`/inquiries/${propertyId}`, { method: 'POST', body: JSON.stringify(body) }),
  mySent:          ()           => request('/inquiries/my-inquiries'),
  forProperty:     (propertyId) => request(`/inquiries/property/${propertyId}`),
  
};

//Users (Admin) 
export const userApi = {
  getAll: ()   => request('/users'),
  delete: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};
