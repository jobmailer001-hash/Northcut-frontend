import { ref } from 'vue'
import { defineStore } from 'pinia'

import http from '@/api/http.js'

// The logged-in customer's orders.
export const useOrdersStore = defineStore('orders', () => {
  const orders = ref([])
  const pagination = ref(null)
  const order = ref(null)

  // `shippingTarget` is AddressPicker's value: `{ shippingAddressId }` (saved address) or
  // `{ shippingAddress }` (one-off address for this order only — never saved).
  // Both return `{ order, payment }`; `payment.checkoutUrl` is where to pay (null if payment
  // couldn't be started — the order page offers "Pay now" instead).
  const placeOrderRequest = async ({ items, shippingTarget }) => {
    const { data } = await http.post('/orders', { items, ...shippingTarget })
    order.value = data.data.order
    return data.data
  }

  const placePreorderRequest = async ({ sku, quantity, shippingTarget }) => {
    const { data } = await http.post('/orders/preorder', { sku, quantity, ...shippingTarget })
    order.value = data.data.order
    return data.data
  }

  // Allowed until the order ships (`order.canChangeAddress`).
  const changeShippingAddressRequest = async (orderNumber, shippingTarget) => {
    const { data } = await http.patch(
      `/orders/${encodeURIComponent(orderNumber)}/shipping-address`,
      shippingTarget,
    )
    order.value = data.data.order
  }

  // Starts (or retries) payment for an unpaid order; returns `{ reference, checkoutUrl }`.
  const startPaymentRequest = async (orderNumber) => {
    const { data } = await http.post(`/orders/${encodeURIComponent(orderNumber)}/payment`)
    return data.data.payment
  }

  const fetchOrdersRequest = async ({ page = 1, limit = 10 } = {}) => {
    const { data } = await http.get('/orders', { params: { page, limit } })
    orders.value = data.data.orders
    pagination.value = data.data.pagination
  }

  const fetchOrderRequest = async (orderNumber) => {
    // Clear only when switching orders, so re-fetching (e.g. polling for payment) doesn't flash.
    if (order.value?.orderNumber !== orderNumber) order.value = null
    const { data } = await http.get(`/orders/${encodeURIComponent(orderNumber)}`)
    order.value = data.data.order
  }

  const cancelOrderRequest = async (orderNumber, reason) => {
    const { data } = await http.post(`/orders/${encodeURIComponent(orderNumber)}/cancel`, {
      reason: reason || undefined,
    })
    order.value = data.data.order
  }

  return {
    orders,
    pagination,
    order,
    placeOrderRequest,
    placePreorderRequest,
    startPaymentRequest,
    fetchOrdersRequest,
    fetchOrderRequest,
    cancelOrderRequest,
    changeShippingAddressRequest,
  }
})
