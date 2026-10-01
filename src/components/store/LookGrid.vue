<script setup>
import LookCard from '@/components/store/LookCard.vue'
import SkeletonProductCard from '@/components/skeleton/SkeletonProductCard.vue'

// Look cards share the product card's shape, so its skeleton is reused while loading.
defineProps({
  looks: { type: Array, required: true },
  isLoading: { type: Boolean, default: false },
  skeletonCount: { type: Number, default: 8 },
})
</script>

<template>
  <div class="grid grid-cols-2 gap-x-2 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
    <template v-if="isLoading">
      <SkeletonProductCard v-for="index in skeletonCount" :key="index" />
    </template>
    <template v-else>
      <LookCard v-for="lookSummary in looks" :key="lookSummary.id" :look-summary="lookSummary" />
    </template>
  </div>
  <p v-if="!isLoading && !looks.length" class="py-16 text-center text-surface-500">
    <slot name="empty">No looks yet — check back soon.</slot>
  </p>
</template>
