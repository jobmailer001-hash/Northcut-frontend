import { ref } from 'vue'
import { defineStore } from 'pinia'

import http from '@/api/http.js'

const UPLOAD_TIMEOUT_MS = 120000

// The admin looks list, the look being edited on the admin look page, and the product
// list shown there to pick the look's products from.
export const useAdminLooksStore = defineStore('adminLooks', () => {
  const looks = ref([])
  const pagination = ref(null)
  const look = ref(null)
  const productChoices = ref([])
  const productChoicesPagination = ref(null)

  const setLook = (updatedLook) => {
    look.value = updatedLook
    return updatedLook
  }

  const fetchAdminLooksRequest = async ({ page = 1, limit = 12, search, publicityStatus } = {}) => {
    const { data } = await http.get('/admin/looks', {
      params: { page, limit, search: search || undefined, publicityStatus },
    })
    looks.value = data.data.looks
    pagination.value = data.data.pagination
  }

  // The admin look page is addressed by slug, like the storefront's.
  const fetchAdminLookBySlugRequest = async (slug) => {
    look.value = null
    const { data } = await http.get(`/admin/looks/by-slug/${encodeURIComponent(slug)}`)
    look.value = data.data.look
  }

  const createLookRequest = async (fields) => {
    const { data } = await http.post('/admin/looks', fields)
    return setLook(data.data.look)
  }

  // `productSkus`, when sent, replaces the whole list.
  const updateLookRequest = async (lookId, changes) => {
    const { data } = await http.patch(`/admin/looks/${lookId}`, changes)
    return setLook(data.data.look)
  }

  // The API validates and queues the image (202); the worker uploads it to Cloudinary, so it
  // isn't on the look yet — this returns the queued upload, not a look.
  const uploadLookImageRequest = async (lookId, file) => {
    const formData = new FormData()
    formData.append('image', file)
    // Sending up to 10 MB can outlast the default 15s timeout on a slow connection.
    const { data } = await http.post(`/admin/looks/${lookId}/image`, formData, { timeout: UPLOAD_TIMEOUT_MS })
    return data.data.upload
  }

  // Every product (hidden too), filterable, for the look page's product picker. Kept apart from
  // the products store so browsing here never changes the admin's product list.
  const fetchProductChoicesRequest = async ({ page = 1, limit = 10, search, availabilityStatus, publicityStatus } = {}) => {
    const { data } = await http.get('/admin/products', {
      params: { page, limit, search: search || undefined, availabilityStatus, publicityStatus },
    })
    productChoices.value = data.data.products
    productChoicesPagination.value = data.data.pagination
  }

  return {
    looks,
    pagination,
    look,
    productChoices,
    productChoicesPagination,
    fetchAdminLooksRequest,
    fetchAdminLookBySlugRequest,
    createLookRequest,
    updateLookRequest,
    uploadLookImageRequest,
    fetchProductChoicesRequest,
  }
})
