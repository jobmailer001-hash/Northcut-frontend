<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-surface-50 px-4 py-12">
    <RouterLink
      :to="{ name: 'landing' }"
      class="mb-8 text-2xl font-bold tracking-widest uppercase"
    >
      Northcut
    </RouterLink>

    <main class="w-full max-w-md">
      <RouterView />
    </main>
  </div>
</template>
