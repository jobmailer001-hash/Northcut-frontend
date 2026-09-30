import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'

import { handleApiError } from '@/error/handleApiError.js'

const SEARCH_DEBOUNCE_MS = 400

// Paging, filters and a debounced search for the admin's lazy DataTables.
// `fetch` is a store `<name>Request` taking `{ page, limit, ...filters }`. Empty filters
// (null / '') aren't sent. Changing any filter goes back to page 1.
export const useAdminList = ({ fetch, pageSize, filters: initialFilters = {} }) => {
  const filters = reactive({ ...initialFilters })
  const page = ref(1)
  const isLoading = ref(false)
  let searchTimer = null

  const first = computed(() => (page.value - 1) * pageSize)

  const load = async () => {
    isLoading.value = true
    const activeFilters = Object.fromEntries(
      Object.entries(filters)
        .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
        .filter(([, value]) => value !== null && value !== ''),
    )
    try {
      await fetch({ page: page.value, limit: pageSize, ...activeFilters })
    } catch (err) {
      handleApiError(err)
    } finally {
      isLoading.value = false
    }
  }

  const reloadFromFirstPage = () => {
    page.value = 1
    load()
  }

  const handlePage = (event) => {
    page.value = event.page + 1
    load()
  }

  const hasSearch = 'search' in initialFilters

  watch(
    () => Object.entries(filters).filter(([key]) => key !== 'search').map(([, value]) => value),
    reloadFromFirstPage,
  )

  if (hasSearch) {
    watch(
      () => filters.search,
      () => {
        clearTimeout(searchTimer)
        searchTimer = setTimeout(reloadFromFirstPage, SEARCH_DEBOUNCE_MS)
      },
    )
  }

  onMounted(load)
  onUnmounted(() => clearTimeout(searchTimer))

  return { filters, page, first, isLoading, load, handlePage }
}
