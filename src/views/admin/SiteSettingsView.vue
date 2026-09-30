<script setup>
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'

import HeroPanelUpload from '@/components/admin/HeroPanelUpload.vue'
import SiteColorsForm from '@/components/admin/SiteColorsForm.vue'
import BackLink from '@/components/shared/BackLink.vue'
import { useSiteSettingsStore } from '@/stores/siteSettings.js'

// All site settings live on this one page, one section each. More settings (site name, logo
// text…) are added here as new sections.
const heroPanels = [
  { panel: 'left', label: 'Left' },
  { panel: 'middle', label: 'Middle' },
  { panel: 'right', label: 'Right' },
]

const siteSettingsStore = useSiteSettingsStore()
const { settings } = storeToRefs(siteSettingsStore)
const { fetchSiteSettingsRequest } = siteSettingsStore

const isLoading = ref(true)
const loadError = ref('')

// Refetch on open: hero images the worker finished since the app loaded should show here.
onMounted(async () => {
  try {
    await fetchSiteSettingsRequest()
  } catch (err) {
    loadError.value = err.message
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section class="flex max-w-5xl flex-col gap-6">
    <div class="flex flex-col gap-2">
      <BackLink :fallback="{ name: 'admin-dashboard' }" />
      <h1 class="text-2xl font-semibold">Site settings</h1>
    </div>

    <Message v-if="loadError" severity="error">{{ loadError }}</Message>

    <template v-else-if="isLoading || !settings">
      <Skeleton height="20rem" />
      <Skeleton height="10rem" />
    </template>

    <template v-else>
      <section class="flex flex-col gap-5 border border-surface-200 bg-surface-0 p-6">
        <div>
          <h2 class="text-lg font-medium">Hero images</h2>
          <p class="text-sm text-surface-500">
            The landing page's three hero panels. The middle one carries the headline. An empty panel
            shows a plain grey background.
          </p>
        </div>
        <div class="grid gap-6 md:grid-cols-3">
          <HeroPanelUpload
            v-for="{ panel, label } in heroPanels"
            :key="panel"
            :panel="panel"
            :label="label"
            :image="settings.hero[panel]"
          />
        </div>
      </section>

      <section class="flex flex-col gap-5 border border-surface-200 bg-surface-0 p-6">
        <div>
          <h2 class="text-lg font-medium">Colours</h2>
          <p class="text-sm text-surface-500">Brand colours used across the site.</p>
        </div>
        <SiteColorsForm :colors="settings.colors" />
      </section>
    </template>
  </section>
</template>
