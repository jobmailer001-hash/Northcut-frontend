import { ref } from 'vue'
import { defineStore } from 'pinia'

import http from '@/api/http.js'

// Admin order management: every customer's orders, fulfilment and cancellation.
export const useAdminOrdersStore = defineStore('adminOrders', () => {
  const orders = ref([])
  const pagination = ref(null)
  const order = ref(null)

  const fetchAdminOrdersRequest = async (params) => {
    const { data } = await http.get('/admin/orders', { params })
    orders.value = data.data.orders
    pagination.value = data.data.pagination
  }

  const fetchAdminOrderRequest = async (orderId) => {
    if (order.value?.id !== orderId) order.value = null
    const { data } = await http.get(`/admin/orders/${orderId}`)
    order.value = data.data.order
  }

  // status: 'SHIPPED' | 'DELIVERED'
  const updateOrderStatusRequest = async (orderId, status) => {
    const { data } = await http.patch(`/admin/orders/${orderId}/status`, { status })
    order.value = data.data.order
  }

  const cancelAdminOrderRequest = async (orderId, reason) => {
    const { data } = await http.post(`/admin/orders/${orderId}/cancel`, { reason: reason || undefined })
    order.value = data.data.order
  }

  return {
    orders,
    pagination,
    order,
    fetchAdminOrdersRequest,
    fetchAdminOrderRequest,
    updateOrderStatusRequest,
    cancelAdminOrderRequest,
  }
})
