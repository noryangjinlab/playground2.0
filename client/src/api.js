const BASE_URL = 'https://noryangjinlab.org';
// const BASE_URL = 'http://localhost:3000';

export const fetchApi = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;

  // 기본 설정 (Credentials 포함)
  const defaultOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', 
  };

  const response = await fetch(url, defaultOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API 요청 실패');
  }

  return response.json();
};