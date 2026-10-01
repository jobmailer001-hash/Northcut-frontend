import { ref } from 'vue'
import { defineStore } from 'pinia'

import http from '@/api/http.js'

// Public looks — suggested outfits made from catalog products — for the storefront.
export const useLooksStore = defineStore('looks', () => {
  const looks = ref([])
  const pagination = ref(null)
  const look = ref(null)

  const fetchLooksRequest = async ({ page = 1, limit = 12 } = {}) => {
    const { data } = await http.get('/looks', { params: { page, limit } })
    looks.value = data.data.looks
    pagination.value = data.data.pagination
  }

  // The look with its products (each just sku, name, slug and first image) in one request.
  const fetchLookRequest = async (slug) => {
    look.value = null
    const { data } = await http.get(`/looks/${encodeURIComponent(slug)}`)
    look.value = data.data.look
  }

  return { looks, pagination, look, fetchLooksRequest, fetchLookRequest }
})
