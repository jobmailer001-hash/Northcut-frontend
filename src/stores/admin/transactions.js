import { ref } from 'vue'
import { defineStore } from 'pinia'

import http from '@/api/http.js'

// Admin view of payments and refunds.
export const useAdminTransactionsStore = defineStore('adminTransactions', () => {
  const transactions = ref([])
  const pagination = ref(null)
  const transaction = ref(null)

  const fetchTransactionsRequest = async (params) => {
    const { data } = await http.get('/admin/transactions', { params })
    transactions.value = data.data.transactions
    pagination.value = data.data.pagination
  }

  const fetchTransactionRequest = async (transactionId) => {
    transaction.value = null
    const { data } = await http.get(`/admin/transactions/${transactionId}`)
    transaction.value = data.data.transaction
  }

  return { transactions, pagination, transaction, fetchTransactionsRequest, fetchTransactionRequest }
})
