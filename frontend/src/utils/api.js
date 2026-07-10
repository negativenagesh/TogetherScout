import { API_BASE_URL } from '../config';

export async function apiFetch(endpoint, options = {}) {
  const geminiKey = localStorage.getItem('gemini_api_key') || '';
  const deepseekKey = localStorage.getItem('deepseek_api_key') || '';
  const activeModel = localStorage.getItem('active_model') || 'gemini';

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (geminiKey) defaultHeaders['x-gemini-api-key'] = geminiKey;
  if (deepseekKey) defaultHeaders['x-deepseek-api-key'] = deepseekKey;
  if (activeModel) defaultHeaders['x-active-model'] = activeModel;

  const finalOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {})
    }
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  return fetch(url, finalOptions);
}
