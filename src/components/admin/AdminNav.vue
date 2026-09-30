<script setup>
import { storeToRefs } from 'pinia'
import { RouterLink, useRoute } from 'vue-router'
import { Box, ChartBar, Cog, CreditCard, List, ShoppingBag, User, Users } from '@primeicons/vue'
import Button from 'primevue/button'

import { useAuthStore } from '@/stores/auth.js'

// Rendered in the desktop sidebar and inside the mobile drawer. Logging out lives on the
// profile page ("My profile"), not here.
const route = useRoute()
const { user } = storeToRefs(useAuthStore())

// `section` groups a link's child pages (e.g. order detail highlights "Orders").
const navLinks = [
  { name: 'admin-dashboard', label: 'Dashboard', section: 'admin-dashboard', icon: ChartBar },
  { name: 'admin-orders', label: 'Orders', section: 'admin-order', icon: ShoppingBag },
  { name: 'admin-products', label: 'Products', section: 'admin-product', icon: Box },
  { name: 'admin-transactions', label: 'Transactions', section: 'admin-transaction', icon: CreditCard },
  { name: 'admin-customers', label: 'Customers', section: 'admin-customer', icon: Users },
  { name: 'admin-logs', label: 'Logs', section: 'admin-logs', icon: List },
  { name: 'admin-site-settings', label: 'Site settings', section: 'admin-site-settings', icon: Cog },
  { name: 'admin-profile', label: 'My profile', section: 'admin-profile', icon: User },
]

const isNavLinkActive = (link) => String(route.name).startsWith(link.section)
</script>

<template>
  <div class="flex h-full flex-col">
    <nav class="flex flex-1 flex-col gap-1 px-3 py-4">
      <RouterLink
        v-for="link in navLinks"
        :key="link.name"
        :to="{ name: link.name }"
        class="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-surface-100"
        :class="{ 'bg-surface-100 font-semibold': isNavLinkActive(link) }"
      >
        <component :is="link.icon" :size="16" />
        {{ link.label }}
      </RouterLink>
    </nav>
    <div class="flex flex-col gap-2 border-t border-surface-200 p-4">
      <p class="truncate text-sm text-surface-600">{{ user?.name }}</p>
      <Button
        as="router-link"
        :to="{ name: 'landing' }"
        label="View store"
        severity="secondary"
        size="small"
        variant="text"
        class="self-start"
      />
    </div>
  </div>
</template>
