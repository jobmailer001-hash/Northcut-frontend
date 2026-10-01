<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import { ArrowUpRight } from '@primeicons/vue'

import LoadErrorMessage from '@/components/shared/LoadErrorMessage.vue'
import ProductGrid from '@/components/store/ProductGrid.vue'
import LookGrid from '@/components/store/LookGrid.vue'
import { useProductsStore } from '@/stores/products.js'
import { useSiteSettingsStore } from '@/stores/siteSettings.js'
import { useLooksStore } from '@/stores/looks.js'
import { ImageWidths, toOptimizedImageUrl } from '@/utils/image.js'

const LATEST_PRODUCTS_COUNT = 8
const LATEST_LOOKS_COUNT = 4
// Left to right; the middle panel carries the headline.
const HERO_PANELS = ['left', 'middle', 'right']

const productsStore = useProductsStore()
const { products } = storeToRefs(productsStore)
const { fetchProductsRequest } = productsStore
const { settings } = storeToRefs(useSiteSettingsStore())
const looksStore = useLooksStore()
const { looks } = storeToRefs(looksStore)
const { fetchLooksRequest } = looksStore

const isLoading = ref(true)
const loadError = ref('')
const areLooksLoading = ref(true)
const looksLoadError = ref('')

// Hero images come from the site settings (set by an admin); an empty panel stays a grey plinth.
const heroImages = computed(() =>
  HERO_PANELS.map((panel) => {
    const url = settings.value?.hero[panel]?.url
    return url ? toOptimizedImageUrl(url, ImageWidths.DETAIL) : null
  }),
)

const loadLatestProducts = async () => {
  isLoading.value = true
  loadError.value = ''
  try {
    await fetchProductsRequest({ limit: LATEST_PRODUCTS_COUNT })
  } catch (err) {
    loadError.value = err.message
  } finally {
    isLoading.value = false
  }
}

const loadLatestLooks = async () => {
  areLooksLoading.value = true
  looksLoadError.value = ''
  try {
    await fetchLooksRequest({ limit: LATEST_LOOKS_COUNT })
  } catch (err) {
    looksLoadError.value = err.message
  } finally {
    areLooksLoading.value = false
  }
}

// With no public looks yet, the section is left out rather than shown empty.
const isLooksSectionShown = computed(
  () => areLooksLoading.value || Boolean(looksLoadError.value) || looks.value.length > 0,
)

onMounted(() => {
  loadLatestProducts()
  loadLatestLooks()
})
</script>

<template>
  <div class="flex flex-col gap-28">
    <section
      class="-mx-4 -mt-10 grid h-[75vh] min-h-[520px] grid-cols-1 md:-mx-6 md:grid-cols-[1fr_2fr_1fr]"
    >
      <div
        v-for="(imageUrl, index) in heroImages"
        :key="index"
        class="relative overflow-hidden bg-surface-200"
        :class="{ 'hidden md:block': index !== 1 }"
      >
        <img
          v-if="imageUrl"
          :src="imageUrl"
          alt=""
          class="size-full object-cover"
        />
        <div class="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent" />

        <div v-if="index === 1" class="absolute inset-x-4 bottom-6 flex flex-col gap-6 text-white">
          <h1 class="text-4xl leading-[1.05] font-light tracking-tight md:text-6xl">
            Considered essentials,<br />cut to last.
          </h1>
          <RouterLink
            :to="{ name: 'products' }"
            class="flex w-fit items-center gap-2 text-xs tracking-[0.12em] uppercase hover:underline"
          >
            Shop the collection
            <ArrowUpRight :size="12" />
          </RouterLink>
        </div>

        <p
          v-if="index === 2"
          class="absolute inset-x-4 bottom-6 max-w-xs text-sm leading-snug text-white"
        >
          New pieces drop first as pre-orders — reserve yours before they reach the shelf.
        </p>
      </div>
    </section>

    <section class="flex flex-col gap-8">
      <div class="grid gap-6 md:grid-cols-2 md:items-end">
        <div class="flex items-end justify-between gap-6 text-sm md:justify-start">
          <h2>New Arrivals</h2>
          <RouterLink
            :to="{ name: 'products' }"
            class="flex items-center gap-1.5 text-surface-500 hover:text-surface-950"
          >
            View all
            <ArrowUpRight :size="12" />
          </RouterLink>
        </div>
        <p class="max-w-xl text-2xl leading-tight font-light tracking-tight md:text-4xl">
          A curated edit of timeless essentials, made from premium fabrics and thoughtful details.
        </p>
      </div>
      <LoadErrorMessage v-if="loadError" :message="loadError" @retry="loadLatestProducts" />
      <ProductGrid
        v-else
        :products="products"
        :is-loading="isLoading"
        :skeleton-count="LATEST_PRODUCTS_COUNT"
      />
    </section>

    <section v-if="isLooksSectionShown" class="flex flex-col gap-8">
      <div class="grid gap-6 md:grid-cols-2 md:items-end">
        <div class="flex items-end justify-between gap-6 text-sm md:justify-start">
          <h2>Looks</h2>
          <RouterLink
            :to="{ name: 'looks' }"
            class="flex items-center gap-1.5 text-surface-500 hover:text-surface-950"
          >
            See all
            <ArrowUpRight :size="12" />
          </RouterLink>
        </div>
        <p class="max-w-xl text-2xl leading-tight font-light tracking-tight md:text-4xl">
          Not sure what goes with what? Start from a look we've put together.
        </p>
      </div>
      <LoadErrorMessage v-if="looksLoadError" :message="looksLoadError" @retry="loadLatestLooks" />
      <LookGrid
        v-else
        :looks="looks"
        :is-loading="areLooksLoading"
        :skeleton-count="LATEST_LOOKS_COUNT"
      />
    </section>
  </div>
</template>
