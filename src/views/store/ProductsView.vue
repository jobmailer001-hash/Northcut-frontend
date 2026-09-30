<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { Plus, Search } from '@primeicons/vue'
import Button from 'primevue/button'
import Chip from 'primevue/chip'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Paginator from 'primevue/paginator'
import Select from 'primevue/select'

import BackLink from '@/components/shared/BackLink.vue'
import LoadErrorMessage from '@/components/shared/LoadErrorMessage.vue'
import ProductGrid from '@/components/store/ProductGrid.vue'
import { useProductRoutes } from '@/composables/useProductRoutes.js'
import { availabilityOptions, publicityOptions } from '@/constants/product.js'
import { useProductsStore } from '@/stores/products.js'

const PAGE_SIZE = 12
const SEARCH_DEBOUNCE_MS = 400

const route = useRoute()
const router = useRouter()
const { isAdminArea } = useProductRoutes()
const productsStore = useProductsStore()
const { products, pagination } = storeToRefs(productsStore)
const { fetchProductsRequest } = productsStore

const isLoading = ref(true)
const loadError = ref('')

// Filters live in the URL so a filtered page can be shared and survives reloads.
const activeTag = computed(() => route.query.tag || null)
const currentPage = computed(() => Math.max(1, Number(route.query.page) || 1))
// Admin-area filters; the store ignores them on the storefront.
const search = computed(() => route.query.search || '')
const availabilityStatus = computed(() => route.query.availability || null)
const publicityStatus = computed(() => route.query.visibility || null)

const searchInput = ref(search.value)
let searchTimer = null

const loadProducts = async () => {
  isLoading.value = true
  loadError.value = ''
  try {
    await fetchProductsRequest({
      page: currentPage.value,
      limit: PAGE_SIZE,
      tag: activeTag.value ?? undefined,
      search: search.value || undefined,
      availabilityStatus: availabilityStatus.value ?? undefined,
      publicityStatus: publicityStatus.value ?? undefined,
      isAdminArea: isAdminArea.value,
    })
  } catch (err) {
    loadError.value = err.message
  } finally {
    isLoading.value = false
  }
}

const goToPage = ({ page }) => {
  router.push({ query: { ...route.query, page: page + 1 } })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Any filter change restarts from page 1; an empty value drops the key from the URL.
const setFilter = (key, value) => {
  router.push({ query: { ...route.query, page: undefined, [key]: value || undefined } })
}

const clearTag = () => {
  setFilter('tag', null)
}

// Typing is debounced so each keystroke isn't a request.
watch(searchInput, (value) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => setFilter('search', value.trim()), SEARCH_DEBOUNCE_MS)
})

watch(
  () => [
    activeTag.value,
    currentPage.value,
    search.value,
    availabilityStatus.value,
    publicityStatus.value,
  ],
  loadProducts,
  { immediate: true }
)

onUnmounted(() => clearTimeout(searchTimer))
</script>

<template>
  <section class="flex flex-col gap-8">
    <div class="flex flex-col gap-2">
      <BackLink :fallback="{ name: isAdminArea ? 'admin-dashboard' : 'landing' }" />
      <div class="flex flex-wrap items-center gap-4">
        <h1 class="text-3xl font-bold tracking-tight">{{ isAdminArea ? 'Products' : 'Shop' }}</h1>
        <Chip v-if="activeTag" :label="`#${activeTag}`" removable @remove="clearTag" />
      </div>
    </div>

    <div v-if="isAdminArea" class="flex flex-wrap items-center gap-3">
      <IconField class="w-full sm:w-72">
        <InputIcon><Search :size="16" /></InputIcon>
        <InputText v-model="searchInput" placeholder="Search name or SKU" fluid />
      </IconField>
      <Select
        :model-value="availabilityStatus"
        :options="availabilityOptions"
        option-label="label"
        option-value="value"
        placeholder="Any availability"
        show-clear
        class="w-48"
        @update:model-value="setFilter('availability', $event)"
      />
      <Select
        :model-value="publicityStatus"
        :options="publicityOptions"
        option-label="label"
        option-value="value"
        placeholder="Any visibility"
        show-clear
        class="w-44"
        @update:model-value="setFilter('visibility', $event)"
      />
      <Button
        as="router-link"
        :to="{ name: 'admin-product-new' }"
        label="New product"
        class="sm:ml-auto"
      >
        <template #icon><Plus :size="16" /></template>
      </Button>
    </div>

    <LoadErrorMessage v-if="loadError" :message="loadError" @retry="loadProducts" />
    <ProductGrid v-else :products="products" :is-loading="isLoading" :skeleton-count="PAGE_SIZE">
      <template #empty>
        {{
          activeTag
            ? `Nothing tagged “${activeTag}” right now.`
            : 'No products yet — check back soon.'
        }}
      </template>
    </ProductGrid>

    <Paginator
      v-if="!loadError && pagination && pagination.totalPages > 1"
      :rows="PAGE_SIZE"
      :first="(currentPage - 1) * PAGE_SIZE"
      :total-records="pagination.total"
      @page="goToPage"
    />
  </section>
</template>
