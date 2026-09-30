import { defineStore } from 'pinia'

import http from '@/api/http.js'
import { useSiteSettingsStore } from '@/stores/siteSettings.js'

const UPLOAD_TIMEOUT_MS = 120000

// Admin changes to the site settings. Every change updates the public settings store, so the
// admin sees the result straight away (colours re-apply to the theme).
export const useAdminSiteSettingsStore = defineStore('adminSiteSettings', () => {
  const { setSettings } = useSiteSettingsStore()

  // `changes` is e.g. `{ colors: { primary: '#1a2b3c' } }`; a null colour resets it to the default.
  const updateSiteSettingsRequest = async (changes) => {
    const { data } = await http.patch('/admin/site-settings', changes)
    return setSettings(data.data.settings)
  }

  // The API validates and queues the image (202); the worker uploads it to Cloudinary, so it
  // isn't on the panel yet — this returns the queued upload.
  const uploadHeroImageRequest = async (panel, file) => {
    const formData = new FormData()
    formData.append('image', file)
    const { data } = await http.post(`/admin/site-settings/hero/${panel}`, formData, {
      timeout: UPLOAD_TIMEOUT_MS,
    })
    return data.data.upload
  }

  const removeHeroImageRequest = async (panel) => {
    const { data } = await http.delete(`/admin/site-settings/hero/${panel}`)
    return setSettings(data.data.settings)
  }

  return { updateSiteSettingsRequest, uploadHeroImageRequest, removeHeroImageRequest }
})
