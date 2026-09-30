<script setup>
import BackLink from '@/components/shared/BackLink.vue'
import FavouritesList from '@/components/store/FavouritesList.vue'
</script>

<template>
  <section class="flex flex-col gap-8">
    <div class="flex flex-col gap-2">
      <BackLink :fallback="{ name: 'landing' }" />
      <h1 class="text-3xl font-bold tracking-tight">Favourites</h1>
    </div>
    <FavouritesList :show-heading="false" />
  </section>
</template>
