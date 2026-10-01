<script setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { Image as ImageIcon } from '@primeicons/vue'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'

import BackLink from '@/components/shared/BackLink.vue'
import LookProductList from '@/components/store/LookProductList.vue'
import { ApiError } from '@/error/errors.js'
import { handleApiError } from '@/error/handleApiError.js'
import { useLooksStore } from '@/stores/looks.js'
import { ImageWidths, toOptimizedImageUrl } from '@/utils/image.js'

// Storefront only — admins manage a look on its admin page (views/admin/LookFormView.vue).
const route = useRoute()
const looksStore = useLooksStore()
const { look } = storeToRefs(looksStore)
const { fetchLookRequest } = looksStore

const isLoading = ref(true)
const isNotFound = ref(false)

const loadLook = async (slug) => {
  isLoading.value = true
  isNotFound.value = false
  try {
    await fetchLookRequest(slug)
  } catch (err) {
    if (err instanceof ApiError && err.code === 'LOOK_NOT_FOUND') {
      isNotFound.value = true
    } else {
      handleApiError(err)
    }
  } finally {
    isLoading.value = false
  }
}

watch(() => route.params.slug, loadLook, { immediate: true })
</script>

<template>
  <section v-if="isNotFound" class="py-24 text-center">
    <div class="flex flex-col items-center gap-2">
      <BackLink :fallback="{ name: 'looks' }" />
      <h1 class="text-2xl font-semibold">We couldn't find that look</h1>
    </div>
    <p class="mt-2 text-surface-500">It may have been taken down.</p>
    <Button as="router-link" :to="{ name: 'looks' }" label="See all looks" class="mt-6" />
  </section>

  <section v-else-if="isLoading || !look" class="grid gap-10 md:grid-cols-2">
    <Skeleton class="aspect-[4/5]!" height="auto" />
    <div class="flex flex-col gap-4">
      <Skeleton width="70%" height="2rem" />
      <Skeleton height="8rem" />
    </div>
  </section>

  <!-- Same layout as the product page: back link on top, the image beside the details. -->
  <section v-else class="flex flex-col gap-6">
    <BackLink :fallback="{ name: 'looks' }" />

    <div class="grid gap-10 md:grid-cols-2">
      <div class="aspect-[4/5] overflow-hidden bg-surface-100">
        <img
          v-if="look.imageUrl"
          :src="toOptimizedImageUrl(look.imageUrl, ImageWidths.DETAIL)"
          :alt="look.name"
          class="size-full object-cover"
        />
        <div v-else class="flex size-full items-center justify-center">
          <ImageIcon :size="48" color="var(--p-surface-400)" />
        </div>
      </div>

      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-2">
          <h1 class="text-3xl font-semibold">{{ look.name }}</h1>
          <p class="text-sm text-surface-500">
            {{ look.products.length }} {{ look.products.length === 1 ? 'item' : 'items' }}
          </p>
        </div>

        <p v-if="look.description" class="whitespace-pre-line text-surface-700">
          {{ look.description }}
        </p>

        <div class="flex flex-col gap-3">
          <h2 class="text-sm tracking-[0.12em] text-surface-500 uppercase">Shop the look</h2>
          <LookProductList :products="look.products" />
        </div>
      </div>
    </div>
  </section>
</template>
