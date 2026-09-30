import router from '@/router'
import { errorToast, warningToast } from '@/utils/toastService.js'
import { ApiError, NetworkError, RequestTimeoutError, SessionExpiredError } from './errors.js'

// Default catch-block handler for actions that don't need bespoke error handling.
export const handleApiError = (err) => {
  if (err instanceof SessionExpiredError) {
    warningToast(err.message, 'Session expired')
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }

  if (err instanceof ApiError || err instanceof NetworkError || err instanceof RequestTimeoutError) {
    errorToast(err.message)
    return
  }

  // Not a request failure — a bug in our own code. Surface it in the console for debugging.
  console.error(err)
  errorToast('Something went wrong. Please try again.')
}
