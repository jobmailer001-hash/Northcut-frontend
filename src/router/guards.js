import { storeToRefs } from 'pinia'

import { roleHomeRoute } from '@/constants/roles.js'
import { useAuthStore } from '@/stores/auth.js'

// The session is restored from the refresh cookie once, before the first navigation resolves.
let sessionRestore = null

// Route meta flags (inherited from parent routes):
//   requiresAuth  — any logged-in user
//   requiresAdmin — ADMIN only
//   guestOnly     — logged-out visitors only (login, signup, reset password)
export const authGuard = async (to) => {
  const authStore = useAuthStore()
  const { restoreSessionRequest } = authStore

  sessionRestore ??= restoreSessionRequest()
  await sessionRestore

  const { isAuthenticated, isAdmin, user } = storeToRefs(authStore)

  if (to.meta.guestOnly && isAuthenticated.value) {
    return roleHomeRoute[user.value.role]
  }

  if ((to.meta.requiresAuth || to.meta.requiresAdmin) && !isAuthenticated.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && !isAdmin.value) {
    return { name: 'landing' }
  }

  return true
}
