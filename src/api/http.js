import axios from 'axios'
import { storeToRefs } from 'pinia'

import { ApiError, NetworkError, RequestTimeoutError, SessionExpiredError } from '@/error/errors.js'
import { useAuthStore } from '@/stores/auth.js'

const REQUEST_TIMEOUT_MS = 15000
// Public auth endpoints never trigger a refresh: a 401 there is a real answer (wrong
// password, dead session), and refreshing on /auth/refresh itself would loop.
// Authenticated /auth routes (e.g. PATCH /auth/password) are not listed, so they refresh normally.
const NO_REFRESH_PATHS = new Set([
  '/auth/signup',
  '/auth/login',
  '/auth/refresh',
  '/auth/logout',
  '/auth/password-reset/request',
  '/auth/password-reset/verify',
  '/auth/password-reset/complete',
])

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // Sends the httpOnly refresh cookie on /auth requests.
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
})

// Turns a raw Axios error into one of the typed errors so callers read
// err.message / err.code / err.details directly.
const normalizeError = (error) => {
  if (axios.isCancel(error)) {
    return error
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new RequestTimeoutError()
  }

  if (!error.response) {
    return new NetworkError()
  }

  const { status, data } = error.response
  const apiError = data?.error

  return new ApiError({
    status,
    code: apiError?.code ?? 'UNKNOWN_ERROR',
    message: apiError?.message ?? 'Something went wrong. Please try again.',
    details: apiError?.details,
  })
}

// Shared by every request that 401s at the same time, so only one refresh call is made.
let refreshPromise = null

const refreshAccessToken = () => {
  const { refreshRequest } = useAuthStore()
  refreshPromise ??= refreshRequest().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

const shouldRefreshAndRetry = (error) => {
  const { config, response } = error
  return (
    response?.status === 401 &&
    config &&
    !config.isRetry &&
    !NO_REFRESH_PATHS.has(config.url)
  )
}

http.interceptors.request.use((config) => {
  const { accessToken } = storeToRefs(useAuthStore())

  if (accessToken.value) {
    config.headers.Authorization = `Bearer ${accessToken.value}`
  }
  return config
})

// Never toasts or redirects — deciding how to surface an error is the caller's job.
// Only normalizes errors and transparently refreshes + retries once on a stale access token.
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!shouldRefreshAndRetry(error)) {
      return Promise.reject(normalizeError(error))
    }

    try {
      await refreshAccessToken()
    } catch (refreshError) {
      // The server rejected the refresh: the session is over (the store already cleared it).
      // Anything else (network, timeout) is passed through unchanged.
      const isSessionOver = refreshError instanceof ApiError
      return Promise.reject(isSessionOver ? new SessionExpiredError() : refreshError)
    }

    // The request interceptor attaches the new access token.
    return http({ ...error.config, isRetry: true })
  },
)

export default http
