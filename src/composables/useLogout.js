import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { handleApiError } from '@/error/handleApiError.js'
import { useAuthStore } from '@/stores/auth.js'
import { successToast } from '@/utils/toastService.js'

// Used by the customer and admin profile pages — the only places to log out. The store clears auth even if the request
// fails, so the user always ends up logged out locally.
export const useLogout = () => {
  const router = useRouter()
  const { logoutRequest } = useAuthStore()
  const isLoggingOut = ref(false)

  const logout = async () => {
    isLoggingOut.value = true
    try {
      await logoutRequest()
      successToast('You have been logged out.')
    } catch (err) {
      handleApiError(err)
    } finally {
      isLoggingOut.value = false
      router.push({ name: 'landing' })
    }
  }

  return { logout, isLoggingOut }
}
