import { ref } from 'vue'
import { defineStore } from 'pinia'

import http from '@/api/http.js'
import { applySiteColors } from '@/utils/siteTheme.js'

// Site-wide settings (hero images, brand colours). Public — loaded once before the app first
// renders (main.js), so the theme never flashes. Admin changes go through stores/admin/siteSettings.js.
export const useSiteSettingsStore = defineStore('siteSettings', () => {
  const settings = ref(null)

  // Also re-applies the colours, so every change shows immediately.
  const setSettings = (updatedSettings) => {
    settings.value = updatedSettings
    applySiteColors(updatedSettings.colors)
    return updatedSettings
  }

  const fetchSiteSettingsRequest = async () => {
    const { data } = await http.get('/site-settings')
    return setSettings(data.data.settings)
  }

  return { settings, setSettings, fetchSiteSettingsRequest }
})
