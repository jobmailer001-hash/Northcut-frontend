<script setup>
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'

import ProductGrid from '@/components/store/ProductGrid.vue'
import { handleApiError } from '@/error/handleApiError.js'
import { useProfileStore } from '@/stores/profile.js'

// The Favourites page shows its own page heading, so it turns this one off.
defineProps({
  showHeading: { type: Boolean, default: true },
})

const profileStore = useProfileStore()
const { favourites } = storeToRefs(profileStore)
const { fetchFavouritesRequest } = profileStore

const isLoading = ref(true)

// Always refetch here: a favourite may have been hidden or sold out since it was saved.
onMounted(async () => {
  try {
    await fetchFavouritesRequest()
  } catch (err) {
    handleApiError(err)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section class="flex flex-col gap-5">
    <h2 v-if="showHeading" class="text-lg font-semibold">Favourites</h2>
    <ProductGrid :products="favourites" :is-loading="isLoading" :skeleton-count="4">
      <template #empty>
        Nothing saved yet.
        <RouterLink :to="{ name: 'products' }" class="font-medium text-primary hover:underline">
          Browse the shop
        </RouterLink>
        and tap the heart on anything you like.
      </template>
    </ProductGrid>
  </section>
</template>
