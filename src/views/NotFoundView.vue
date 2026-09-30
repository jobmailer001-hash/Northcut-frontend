<script setup>
import Button from 'primevue/button'

import BackLink from '@/components/shared/BackLink.vue'
</script>

<template>
  <section class="py-24 text-center">
    <p class="text-sm font-semibold text-primary">404</p>
    <div class="mt-2 flex flex-col items-center gap-2">
      <BackLink :fallback="{ name: 'landing' }" />
      <h1 class="text-3xl font-bold tracking-tight">Page not found</h1>
    </div>
    <p class="mt-4 text-surface-500">The page you're looking for doesn't exist.</p>
    <Button as="router-link" :to="{ name: 'landing' }" label="Back to home" class="mt-8" />
  </section>
</template>
