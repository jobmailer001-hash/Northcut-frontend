import { ref } from 'vue'
import { defineStore } from 'pinia'

import http from '@/api/http.js'

// Admin customer management.
export const useAdminCustomersStore = defineStore('adminCustomers', () => {
  const customers = ref([])
  const pagination = ref(null)
  // `{ customer, stats, recentOrders }` for the customer page.
  const customerDetail = ref(null)

  const fetchCustomersRequest = async (params) => {
    const { data } = await http.get('/admin/customers', { params })
    customers.value = data.data.customers
    pagination.value = data.data.pagination
  }

  const fetchCustomerRequest = async (customerId) => {
    if (customerDetail.value?.customer.id !== customerId) customerDetail.value = null
    const { data } = await http.get(`/admin/customers/${customerId}`)
    customerDetail.value = data.data
  }

  // status: 'ACTIVE' | 'DISABLED'
  const updateCustomerStatusRequest = async (customerId, status) => {
    const { data } = await http.patch(`/admin/customers/${customerId}/status`, { status })
    if (customerDetail.value?.customer.id === customerId) {
      customerDetail.value.customer = { ...customerDetail.value.customer, ...data.data.customer }
    }
  }

  return {
    customers,
    pagination,
    customerDetail,
    fetchCustomersRequest,
    fetchCustomerRequest,
    updateCustomerStatusRequest,
  }
})
