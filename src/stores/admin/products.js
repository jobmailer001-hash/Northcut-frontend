import { ref } from 'vue'
import { defineStore } from 'pinia'

import http from '@/api/http.js'

const UPLOAD_TIMEOUT_MS = 120000

// The product being edited on the admin product page. Browsing lists goes through the products store.
export const useAdminProductsStore = defineStore('adminProducts', () => {
  const product = ref(null)

  const setProduct = (updatedProduct) => {
    product.value = updatedProduct
    return updatedProduct
  }

  // The admin product page is addressed by slug, like the storefront's.
  const fetchAdminProductBySlugRequest = async (slug) => {
    product.value = null
    const { data } = await http.get(`/admin/products/by-slug/${encodeURIComponent(slug)}`)
    product.value = data.data.product
  }

  const createProductRequest = async (fields) => {
    const { data } = await http.post('/admin/products', fields)
    return setProduct(data.data.product)
  }

  const updateProductRequest = async (productId, changes) => {
    const { data } = await http.patch(`/admin/products/${productId}`, changes)
    return setProduct(data.data.product)
  }

  const adjustStockRequest = async (productId, { adjustment, reason }) => {
    const { data } = await http.patch(`/admin/products/${productId}/stock`, { adjustment, reason })
    return setProduct(data.data.product)
  }

  // The API validates and queues the images (202); the worker uploads them to Cloudinary, so
  // they aren't on the product yet — this returns the queued upload, not a product.
  const uploadProductImagesRequest = async (productId, files) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('images', file))
    // Sending up to 10 MB can outlast the default 15s timeout on a slow connection.
    const { data } = await http.post(`/admin/products/${productId}/images`, formData, {
      timeout: UPLOAD_TIMEOUT_MS,
    })
    return data.data.upload
  }

  const deleteProductImageRequest = async (productId, imageId) => {
    const { data } = await http.delete(`/admin/products/${productId}/images/${imageId}`)
    return setProduct(data.data.product)
  }

  return {
    product,
    fetchAdminProductBySlugRequest,
    createProductRequest,
    updateProductRequest,
    adjustStockRequest,
    uploadProductImagesRequest,
    deleteProductImageRequest,
  }
})
