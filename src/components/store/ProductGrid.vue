<script setup>
import ProductCard from '@/components/store/ProductCard.vue'
import SkeletonProductCard from '@/components/skeleton/SkeletonProductCard.vue'

defineProps({
  products: { type: Array, required: true },
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
      <ProductCard v-for="product in products" :key="product.id" :product="product" />
    </template>
  </div>
  <p v-if="!isLoading && !products.length" class="py-16 text-center text-surface-500">
    <slot name="empty">No products yet — check back soon.</slot>
  </p>
</template>
