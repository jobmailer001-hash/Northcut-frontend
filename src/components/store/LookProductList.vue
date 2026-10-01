<script setup>
import { RouterLink } from 'vue-router'
import { ArrowUpRight, Image as ImageIcon } from '@primeicons/vue'

import { ImageWidths, toOptimizedImageUrl } from '@/utils/image.js'

// The pieces of a look — just each product's first image and name. Everything else (price,
// availability, buying) is on the product's own page, which each row links to.
defineProps({
  products: { type: Array, required: true },
})
</script>

<template>
  <ul class="flex flex-col divide-y divide-surface-200 border-y border-surface-200">
    <li v-for="product in products" :key="product.sku">
      <RouterLink
        :to="{ name: 'product-detail', params: { slug: product.slug } }"
        class="group flex items-center gap-4 py-3"
      >
        <div class="aspect-[4/5] w-16 shrink-0 overflow-hidden bg-surface-100">
          <img
            v-if="product.imageUrl"
            :src="toOptimizedImageUrl(product.imageUrl, ImageWidths.THUMBNAIL)"
            alt=""
            loading="lazy"
            class="size-full object-cover"
          />
          <div v-else class="flex size-full items-center justify-center">
            <ImageIcon :size="20" color="var(--p-surface-400)" />
          </div>
        </div>
        <p class="min-w-0 flex-1 truncate text-sm underline-offset-4 group-hover:underline">
          {{ product.name }}
        </p>
        <span class="flex shrink-0 items-center gap-1 text-xs text-surface-500 group-hover:text-surface-900">
          View details <ArrowUpRight :size="12" />
        </span>
      </RouterLink>
    </li>
  </ul>
</template>
