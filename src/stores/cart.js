import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

import http from '@/api/http.js'
import { MAX_CART_ITEMS, MAX_QUANTITY_PER_ITEM } from '@/constants/order.js'

const STORAGE_KEY = 'northcut.cart'

const EMPTY_PREVIEW = { items: [], issues: [], subtotal: 0, shippingFee: 0, total: 0 }

const isStoredItem = (item) =>
  typeof item?.sku === 'string' && Number.isInteger(item.quantity) && item.quantity > 0

// Storage can be blocked (private mode) or hold junk from an old version — never let that break the app.
const readStoredItems = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(stored?.items) ? stored.items.filter(isStoredItem) : []
  } catch {
    return []
  }
}

// The cart only ever stores `{ sku, quantity }`. Names, prices and availability always come
// from /cart/preview so they're never stale.
export const useCartStore = defineStore('cart', () => {
  const items = ref(readStoredItems())
  const preview = ref(null)

  // Total units in the bag (3 tees + 2 jackets = 5), the usual e-commerce convention — the badge
  // changes every time something is added, including another of the same product.
  const itemCount = computed(() => items.value.reduce((count, item) => count + item.quantity, 0))
  const hasIssues = computed(() => Boolean(preview.value?.issues.length))

  watch(
    items,
    (currentItems) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: currentItems }))
      } catch {
        // Storage full or blocked: the cart still works for this visit, it just won't persist.
      }
    },
    { deep: true },
  )

  // Keep tabs in sync: another tab changed the cart.
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) items.value = readStoredItems()
  })

  // Returns false when the cart is already at its line limit.
  const addItem = (sku, quantity) => {
    const existing = items.value.find((item) => item.sku === sku)
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, MAX_QUANTITY_PER_ITEM)
      return true
    }
    if (items.value.length >= MAX_CART_ITEMS) return false
    items.value.push({ sku, quantity: Math.min(quantity, MAX_QUANTITY_PER_ITEM) })
    return true
  }

  const setQuantity = (sku, quantity) => {
    const item = items.value.find((cartItem) => cartItem.sku === sku)
    if (item) item.quantity = quantity
  }

  const removeItem = (sku) => {
    items.value = items.value.filter((item) => item.sku !== sku)
  }

  const clearCart = () => {
    items.value = []
    preview.value = null
  }

  const previewCartRequest = async () => {
    if (!items.value.length) {
      preview.value = EMPTY_PREVIEW
      return
    }
    const { data } = await http.post('/cart/preview', { items: items.value })
    preview.value = data.data.preview
  }

  return {
    items,
    preview,
    itemCount,
    hasIssues,
    addItem,
    setQuantity,
    removeItem,
    clearCart,
    previewCartRequest,
  }
})
