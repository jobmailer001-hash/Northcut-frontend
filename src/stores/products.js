import { ref } from 'vue'
import { defineStore } from 'pinia'

import http from '@/api/http.js'
import { AvailabilityStatuses } from '@/constants/product.js'

// Admin products have nested pricing and raw counters; add the storefront fields
// (worked out the way the backend does for public products) so every view reads one shape.
const withStorefrontFields = (adminProduct) => {
  const { availabilityStatus, pricing, availableStock, availablePreorderSpots } = adminProduct
  const availableByStatus = {
    [AvailabilityStatuses.IN_STOCK]: availableStock,
    [AvailabilityStatuses.PRE_ORDER]: availablePreorderSpots,
    [AvailabilityStatuses.OUT_OF_STOCK]: 0,
  }

  return {
    ...adminProduct,
    price:
      availabilityStatus === AvailabilityStatuses.PRE_ORDER
        ? pricing.preorderPrice
        : pricing.launchPrice,
    launchPrice: pricing.launchPrice,
    availableQuantity: Math.max(0, availableByStatus[availabilityStatus]),
  }
}

// The catalog behind the product pages. The storefront always gets public products — even for a
// logged-in admin — and the admin area (isAdminArea, from the route) gets every product,
// including hidden, with its stock counters, from the admin endpoints.
export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const pagination = ref(null)
  const product = ref(null)

  // search/availabilityStatus/publicityStatus are admin-area filters; the storefront only filters by tag.
  const fetchProductsRequest = async ({
    page = 1,
    limit = 12,
    tag,
    search,
    availabilityStatus,
    publicityStatus,
    isAdminArea = false,
  } = {}) => {
    if (isAdminArea) {
      const { data } = await http.get('/admin/products', {
        params: { page, limit, tag, search: search || undefined, availabilityStatus, publicityStatus },
      })
      products.value = data.data.products.map(withStorefrontFields)
      pagination.value = data.data.pagination
      return
    }

    const { data } = await http.get('/products', { params: { page, limit, tag } })
    products.value = data.data.products
    pagination.value = data.data.pagination
  }

  // Storefront detail page only; the admin product page loads through the admin products store.
  const fetchProductRequest = async (slug) => {
    product.value = null
    const { data } = await http.get(`/products/${encodeURIComponent(slug)}`)
    product.value = data.data.product
  }

  return { products, pagination, product, fetchProductsRequest, fetchProductRequest }
})
