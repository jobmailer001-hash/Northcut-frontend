<script setup>
import { ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { Bars } from '@primeicons/vue'
import Button from 'primevue/button'
import Drawer from 'primevue/drawer'

import AdminNav from '@/components/admin/AdminNav.vue'

const route = useRoute()
const isMobileNavOpen = ref(false)

// Close the mobile drawer after navigating.
watch(
  () => route.fullPath,
  () => {
    isMobileNavOpen.value = false
  },
)
</script>

<template>
  <div class="flex min-h-screen flex-col md:flex-row">
    <!-- Mobile: top bar + slide-out drawer -->
    <header class="flex h-14 items-center gap-3 border-b border-surface-200 bg-surface-50 px-4 md:hidden">
      <Button variant="text" severity="secondary" aria-label="Open menu" @click="isMobileNavOpen = true">
        <template #icon><Bars :size="20" /></template>
      </Button>
      <RouterLink :to="{ name: 'admin-dashboard' }" class="font-bold tracking-widest uppercase">
        Northcut Admin
      </RouterLink>
    </header>
    <Drawer v-model:visible="isMobileNavOpen" header="Northcut Admin" class="w-72!">
      <AdminNav />
    </Drawer>

    <!-- Desktop: fixed sidebar -->
    <aside class="hidden w-64 shrink-0 flex-col border-r border-surface-200 bg-surface-50 md:flex">
      <div class="flex h-16 items-center px-6">
        <RouterLink :to="{ name: 'admin-dashboard' }" class="text-lg font-bold tracking-widest uppercase">
          Northcut Admin
        </RouterLink>
      </div>
      <AdminNav />
    </aside>

    <main class="min-w-0 flex-1 bg-surface-50/40 px-4 py-6 md:px-6 md:py-8">
      <RouterView />
    </main>
  </div>
</template>
