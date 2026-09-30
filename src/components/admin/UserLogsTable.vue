<script setup>
import { storeToRefs } from 'pinia'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'

import { useAdminList } from '@/composables/useAdminList.js'
import { useAdminOverviewStore } from '@/stores/admin/overview.js'
import { formatDateTime } from '@/utils/date.js'

const PAGE_SIZE = 30

const adminOverviewStore = useAdminOverviewStore()
const { userLogs, userLogsPagination } = storeToRefs(adminOverviewStore)
const { fetchUserLogsRequest } = adminOverviewStore

const { first, isLoading, handlePage } = useAdminList({
  fetch: fetchUserLogsRequest,
  pageSize: PAGE_SIZE,
})

// Short, readable summary of a log's meta (e.g. "orderNumber: NC-…, reason: …").
const summarizeMeta = (meta) =>
  meta
    ? Object.entries(meta)
        .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
        .join(', ')
    : ''
</script>

<template>
  <DataTable
    :value="userLogs"
    :loading="isLoading"
    lazy
    paginator
    :rows="PAGE_SIZE"
    :first="first"
    :total-records="userLogsPagination?.total ?? 0"
    data-key="id"
    size="small"
    @page="handlePage"
  >
    <template #empty>No user activity yet.</template>
    <Column header="When" class="whitespace-nowrap">
      <template #body="{ data }">{{ formatDateTime(data.createdAt) }}</template>
    </Column>
    <Column header="Who">
      <template #body="{ data }">
        {{ data.user.email ?? 'Deleted user' }}
        <span v-if="data.user.role === 'ADMIN'" class="text-xs text-surface-500">(admin)</span>
      </template>
    </Column>
    <Column field="action" header="Action" />
    <Column header="Details">
      <template #body="{ data }">
        <span class="text-xs text-surface-600">{{ summarizeMeta(data.meta) }}</span>
      </template>
    </Column>
    <Column field="ip" header="IP" />
  </DataTable>
</template>
