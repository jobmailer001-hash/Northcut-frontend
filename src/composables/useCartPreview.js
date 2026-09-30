import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { handleApiError } from '@/error/handleApiError.js'
import { useCartStore } from '@/stores/cart.js'

const PREVIEW_DEBOUNCE_MS = 400

// Keeps the cart's live preview fresh for the Cart and Checkout pages: previews on mount and
// again (debounced) after quantity changes, and exposes the handlers CartLineItem emits to.
export const useCartPreview = () => {
  const cartStore = useCartStore()
  const { items, preview, hasIssues } = storeToRefs(cartStore)
  const { previewCartRequest, setQuantity, removeItem } = cartStore

  const isLoading = ref(true)
  let previewTimer = null

  const issuesBySku = computed(
    () => new Map((preview.value?.issues ?? []).map((issue) => [issue.sku, issue])),
  )

  // SKU and quantity come from the cart (instant), product data from the last preview —
  // so +/- and remove respond immediately instead of waiting for the debounced refresh.
  const lines = computed(() => {
    const quantityBySku = new Map(items.value.map((item) => [item.sku, item.quantity]))
    return (preview.value?.items ?? [])
      .filter((line) => quantityBySku.has(line.sku))
      .map((line) => ({ ...line, quantity: quantityBySku.get(line.sku) }))
  })

  const refreshPreview = async () => {
    try {
      await previewCartRequest()
    } catch (err) {
      handleApiError(err)
    } finally {
      isLoading.value = false
    }
  }

  watch(
    items,
    () => {
      clearTimeout(previewTimer)
      previewTimer = setTimeout(refreshPreview, PREVIEW_DEBOUNCE_MS)
    },
    { deep: true },
  )

  onMounted(refreshPreview)
  onUnmounted(() => clearTimeout(previewTimer))

  return {
    items,
    lines,
    preview,
    hasIssues,
    issuesBySku,
    isLoading,
    refreshPreview,
    updateQuantity: setQuantity,
    removeItem,
  }
}
