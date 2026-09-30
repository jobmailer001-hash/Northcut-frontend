import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import http from '@/api/http.js'
import { Roles } from '@/constants/roles.js'
import { ApiError } from '@/error/errors.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  // In memory only — never persisted. The httpOnly refresh cookie restores it on reload.
  const accessToken = ref(null)

  const isAuthenticated = computed(() => Boolean(accessToken.value))
  const isAdmin = computed(() => user.value?.role === Roles.ADMIN)

  const setSession = (session) => {
    accessToken.value = session.accessToken
    user.value = session.user
  }

  const clearAuth = () => {
    accessToken.value = null
    user.value = null
  }

  const signupRequest = async ({ name, email, password }) => {
    const { data } = await http.post('/auth/signup', { name, email, password })
    setSession(data.data)
    return data.data.user
  }

  const loginRequest = async ({ email, password }) => {
    const { data } = await http.post('/auth/login', { email, password })
    setSession(data.data)
    return data.data.user
  }

  const refreshRequest = async () => {
    try {
      const { data } = await http.post('/auth/refresh')
      setSession(data.data)
      return data.data.accessToken
    } catch (err) {
      // Only a server rejection means the session is gone; a network blip keeps the user logged in.
      if (err instanceof ApiError) {
        clearAuth()
      }
      throw err
    }
  }

  // Called once on app start. Resolves to whether a session was restored; a failure
  // just means the visitor isn't logged in, so it never throws.
  const restoreSessionRequest = async () => {
    try {
      await refreshRequest()
      return true
    } catch {
      return false
    }
  }

  const logoutRequest = async () => {
    try {
      await http.post('/auth/logout')
    } finally {
      clearAuth()
    }
  }

  // Other devices are logged out; this one stays logged in.
  const changePasswordRequest = async ({ currentPassword, newPassword }) => {
    await http.patch('/auth/password', { currentPassword, newPassword })
  }

  const requestPasswordResetRequest = async (email) => {
    await http.post('/auth/password-reset/request', { email })
  }

  const verifyPasswordResetCodeRequest = async ({ email, code }) => {
    const { data } = await http.post('/auth/password-reset/verify', { email, code })
    return data.data.resetToken
  }

  const completePasswordResetRequest = async ({ resetToken, password }) => {
    await http.post('/auth/password-reset/complete', { resetToken, password })
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    isAdmin,
    clearAuth,
    signupRequest,
    loginRequest,
    refreshRequest,
    restoreSessionRequest,
    logoutRequest,
    changePasswordRequest,
    requestPasswordResetRequest,
    verifyPasswordResetCodeRequest,
    completePasswordResetRequest,
  }
})
