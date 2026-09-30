import { ref } from 'vue'
import { defineStore } from 'pinia'

import http from '@/api/http.js'

// Admin dashboard figures and audit logs.
export const useAdminOverviewStore = defineStore('adminOverview', () => {
  const dashboard = ref(null)
  const systemLogs = ref([])
  const systemLogsPagination = ref(null)
  const userLogs = ref([])
  const userLogsPagination = ref(null)

  const fetchDashboardRequest = async () => {
    const { data } = await http.get('/admin/dashboard')
    dashboard.value = data.data.dashboard
  }

  const fetchSystemLogsRequest = async (params) => {
    const { data } = await http.get('/admin/logs/system', { params })
    systemLogs.value = data.data.logs
    systemLogsPagination.value = data.data.pagination
  }

  const fetchUserLogsRequest = async (params) => {
    const { data } = await http.get('/admin/logs/users', { params })
    userLogs.value = data.data.logs
    userLogsPagination.value = data.data.pagination
  }

  return {
    dashboard,
    systemLogs,
    systemLogsPagination,
    userLogs,
    userLogsPagination,
    fetchDashboardRequest,
    fetchSystemLogsRequest,
    fetchUserLogsRequest,
  }
})
