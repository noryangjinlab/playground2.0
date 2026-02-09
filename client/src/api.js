const BASE_URL = 'https://noryangjinlab.org/api'
// const BASE_URL = 'http://localhost:3000/api'

export const fetchApi = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`

  const isFormData = options.body instanceof FormData

  const headers = {
    ...(options.headers || {}),
  }

  if (!isFormData) {
    if (!headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json'
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (!response.ok) {
    const ct = response.headers.get('content-type') || ''
    const errorData = ct.includes('application/json')
      ? await response.json().catch(() => ({}))
      : {}
    throw new Error(errorData.message || `API 요청 실패 (${response.status})`)
  }

  const ct = response.headers.get('content-type') || ''
  if (ct.includes('application/json')) return response.json()
  return response.text()
}