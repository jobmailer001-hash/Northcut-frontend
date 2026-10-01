<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { Plus, Search } from '@primeicons/vue'
import Button from 'primevue/button'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Paginator from 'primevue/paginator'
import Select from 'primevue/select'

import BackLink from '@/components/shared/BackLink.vue'
import LoadErrorMessage from '@/components/shared/LoadErrorMessage.vue'
import LookGrid from '@/components/store/LookGrid.vue'
import { useProductRoutes } from '@/composables/useProductRoutes.js'
import { publicityOptions } from '@/constants/product.js'
import { useAdminLooksStore } from '@/stores/admin/looks.js'
import { useLooksStore } from '@/stores/looks.js'

const PAGE_SIZE = 12
const SEARCH_DEBOUNCE_MS = 400

// Serves /looks (public looks) and /admin/looks (every look, with search and filters),
// like ProductsView — `meta.area` decides which.
const route = useRoute()
const router = useRouter()
const { isAdminArea } = useProductRoutes()

const looksStore = useLooksStore()
const adminLooksStore = useAdminLooksStore()
const { looks: publicLooks, pagination: publicPagination } = storeToRefs(looksStore)
const { looks: adminLooks, pagination: adminPagination } = storeToRefs(adminLooksStore)
const { fetchLooksRequest } = looksStore
const { fetchAdminLooksRequest } = adminLooksStore

const looks = computed(() => (isAdminArea.value ? adminLooks.value : publicLooks.value))
const pagination = computed(() => (isAdminArea.value ? adminPagination.value : publicPagination.value))

const isLoading = ref(true)
const loadError = ref('')

// Filters live in the URL so a filtered page can be shared and survives reloads.
const currentPage = computed(() => Math.max(1, Number(route.query.page) || 1))
const search = computed(() => route.query.search || '')
const publicityStatus = computed(() => route.query.visibility || null)

const searchInput = ref(search.value)
let searchTimer = null

const loadLooks = async () => {
  isLoading.value = true
  loadError.value = ''
  try {
    if (isAdminArea.value) {
      await fetchAdminLooksRequest({
        page: currentPage.value,
        limit: PAGE_SIZE,
        search: search.value || undefined,
        publicityStatus: publicityStatus.value ?? undefined,
      })
    } else {
      await fetchLooksRequest({ page: currentPage.value, limit: PAGE_SIZE })
    }
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

watch(searchInput, (value) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => setFilter('search', value.trim()), SEARCH_DEBOUNCE_MS)
})

watch(() => [currentPage.value, search.value, publicityStatus.value], loadLooks, { immediate: true })

onUnmounted(() => clearTimeout(searchTimer))
</script>

<template>
  <section class="flex flex-col gap-8">
    <div class="flex flex-col gap-2">
      <BackLink :fallback="{ name: isAdminArea ? 'admin-dashboard' : 'landing' }" />
      <h1 class="text-3xl font-bold tracking-tight">Looks</h1>
      <p v-if="!isAdminArea" class="max-w-xl text-surface-500">
        Outfits put together from our pieces — for when you're not sure what goes with what.
      </p>
    </div>

    <div v-if="isAdminArea" class="flex flex-wrap items-center gap-3">
      <IconField class="w-full sm:w-72">
        <InputIcon><Search :size="16" /></InputIcon>
        <InputText v-model="searchInput" placeholder="Search name" fluid />
      </IconField>
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
      <Button as="router-link" :to="{ name: 'admin-look-new' }" label="New look" class="sm:ml-auto">
        <template #icon><Plus :size="16" /></template>
      </Button>
    </div>

    <LoadErrorMessage v-if="loadError" :message="loadError" @retry="loadLooks" />
    <LookGrid v-else :looks="looks" :is-loading="isLoading" :skeleton-count="PAGE_SIZE" />

    <Paginator
      v-if="!loadError && pagination && pagination.totalPages > 1"
      :rows="PAGE_SIZE"
      :first="(currentPage - 1) * PAGE_SIZE"
      :total-records="pagination.total"
      @page="goToPage"
    />
  </section>
</template>
