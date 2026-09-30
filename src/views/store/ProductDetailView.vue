<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink, useRoute } from 'vue-router'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'

import BackLink from '@/components/shared/BackLink.vue'
import FavouriteButton from '@/components/store/FavouriteButton.vue'
import ProductGallery from '@/components/store/ProductGallery.vue'
import ProductPurchasePanel from '@/components/store/ProductPurchasePanel.vue'
import {
  AvailabilityStatuses,
  LOW_STOCK_THRESHOLD,
  availabilityLabels,
  availabilityTones,
} from '@/constants/product.js'
import { ApiError } from '@/error/errors.js'
import { handleApiError } from '@/error/handleApiError.js'
import { useProductsStore } from '@/stores/products.js'
import { formatMoney } from '@/utils/money.js'

// Storefront only — admins manage a product on its admin page (views/admin/ProductFormView.vue).
const route = useRoute()
const productsStore = useProductsStore()
const { product } = storeToRefs(productsStore)
const { fetchProductRequest } = productsStore

const isLoading = ref(true)
const isNotFound = ref(false)

const isPreorder = computed(() => product.value?.availabilityStatus === AvailabilityStatuses.PRE_ORDER)

const availabilityNote = computed(() => {
  const { availabilityStatus, availableQuantity } = product.value
  if (availabilityStatus === AvailabilityStatuses.PRE_ORDER) {
    return availableQuantity > 0 ? `${availableQuantity} pre-order spots left.` : 'Pre-orders are full.'
  }
  if (availabilityStatus === AvailabilityStatuses.IN_STOCK && availableQuantity <= LOW_STOCK_THRESHOLD) {
    return availableQuantity > 0 ? `Only ${availableQuantity} left.` : 'Just sold out.'
  }
  return null
})

const loadProduct = async (slug) => {
  isLoading.value = true
  isNotFound.value = false
  try {
    await fetchProductRequest(slug)
  } catch (err) {
    if (err instanceof ApiError && err.code === 'PRODUCT_NOT_FOUND') {
      isNotFound.value = true
    } else {
      handleApiError(err)
    }
  } finally {
    isLoading.value = false
  }
}

watch(() => route.params.slug, loadProduct, { immediate: true })
</script>

<template>
  <section v-if="isNotFound" class="py-24 text-center">
    <div class="flex flex-col items-center gap-2">
      <BackLink :fallback="{ name: 'products' }" />
      <h1 class="text-2xl font-semibold">We couldn't find that product</h1>
    </div>
    <p class="mt-2 text-surface-500">It may have sold out or been removed.</p>
    <Button as="router-link" :to="{ name: 'products' }" label="Browse the shop" class="mt-6" />
  </section>

  <section v-else-if="isLoading || !product" class="grid gap-10 md:grid-cols-2">
    <Skeleton class="aspect-[4/5]!" height="auto" />
    <div class="flex flex-col gap-4">
      <Skeleton width="70%" height="2rem" />
      <Skeleton width="30%" height="1.5rem" />
      <Skeleton height="8rem" />
    </div>
  </section>

  <!-- The back link sits at the top of the page, not beside the h1: here the heading is in the
       column next to (or, on phones, below) the gallery, so beside it the link would be buried. -->
  <section v-else class="flex flex-col gap-6">
    <BackLink :fallback="{ name: 'products' }" />

    <div class="grid gap-10 md:grid-cols-2">
      <ProductGallery :images="product.images" :alt="product.name" />

      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-2">
          <!-- Same bracket label as the product cards: only the state is tinted. -->
          <p class="flex items-center gap-2 text-sm tracking-[0.12em] text-surface-500">
            <span aria-hidden="true">[</span>
            <span class="px-2 py-0.5" :class="availabilityTones[product.availabilityStatus]">
              {{ availabilityLabels[product.availabilityStatus] }}
            </span>
            <span aria-hidden="true">]</span>
          </p>
          <h1 class="text-3xl font-semibold">{{ product.name }}</h1>
          <div class="flex items-baseline gap-3">
            <p class="text-2xl">{{ product.price != null ? formatMoney(product.price) : '' }}</p>
            <p v-if="isPreorder && product.launchPrice > product.price" class="text-surface-500">
              <span class="line-through">{{ formatMoney(product.launchPrice) }}</span> at launch
            </p>
          </div>
          <p v-if="availabilityNote" class="text-sm font-medium text-surface-600">
            {{ availabilityNote }}
          </p>
        </div>

        <p v-if="product.description" class="whitespace-pre-line text-surface-700">
          {{ product.description }}
        </p>

        <ProductPurchasePanel :product="product" />
        <FavouriteButton :product="product" class="self-start" />

        <ul v-if="product.tags.length" class="flex flex-wrap gap-2">
          <li v-for="tag in product.tags" :key="tag">
            <RouterLink
              :to="{ name: 'products', query: { tag } }"
              class="rounded-full bg-surface-100 px-3 py-1 text-sm hover:bg-surface-200"
            >
              #{{ tag }}
            </RouterLink>
          </li>
        </ul>

        <!-- SKU hidden from customers for now.
        <p class="text-xs text-surface-400">SKU {{ product.sku }}</p>
        -->
      </div>
    </div>
  </section>
</template>
