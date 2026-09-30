import { ref } from 'vue'
import { defineStore } from 'pinia'

import http from '@/api/http.js'

// Development only: the fake payment provider's checkout page. Remove along with
// MockPayView when a real provider (with its own hosted checkout) is in place.
export const useMockGatewayStore = defineStore('mockGateway', () => {
  const payment = ref(null)

  const fetchMockPaymentRequest = async (reference) => {
    payment.value = null
    const { data } = await http.get(`/mock-gateway/payments/${encodeURIComponent(reference)}`)
    payment.value = data.data.payment
  }

  // outcome: 'success' | 'failure'. Returns `{ status, returnUrl }`.
  const completeMockPaymentRequest = async (reference, outcome) => {
    const { data } = await http.post(`/mock-gateway/payments/${encodeURIComponent(reference)}/complete`, {
      outcome,
    })
    return data.data.result
  }

  return { payment, fetchMockPaymentRequest, completeMockPaymentRequest }
})
