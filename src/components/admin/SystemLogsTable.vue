<script setup>
import { storeToRefs } from 'pinia'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Select from 'primevue/select'
import Tag from 'primevue/tag'

import { useAdminList } from '@/composables/useAdminList.js'
import { useAdminOverviewStore } from '@/stores/admin/overview.js'
import { formatDateTime } from '@/utils/date.js'

const PAGE_SIZE = 30

const levelSeverities = { info: 'info', warn: 'warn', error: 'danger' }
const levelOptions = ['info', 'warn', 'error'].map((value) => ({ label: value, value }))

const adminOverviewStore = useAdminOverviewStore()
const { systemLogs, systemLogsPagination } = storeToRefs(adminOverviewStore)
const { fetchSystemLogsRequest } = adminOverviewStore

const { filters, first, isLoading, handlePage } = useAdminList({
  fetch: fetchSystemLogsRequest,
  pageSize: PAGE_SIZE,
  filters: { level: null },
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <Select
      v-model="filters.level"
      :options="levelOptions"
      option-label="label"
      option-value="value"
      placeholder="Any level"
      show-clear
      class="w-40"
    />
    <DataTable
      :value="systemLogs"
      :loading="isLoading"
      lazy
      paginator
      :rows="PAGE_SIZE"
      :first="first"
      :total-records="systemLogsPagination?.total ?? 0"
      data-key="id"
      size="small"
      @page="handlePage"
    >
      <template #empty>No system events yet.</template>
      <Column header="When" class="whitespace-nowrap">
        <template #body="{ data }">{{ formatDateTime(data.createdAt) }}</template>
      </Column>
      <Column header="Level">
        <template #body="{ data }"><Tag :value="data.level" :severity="levelSeverities[data.level]" /></template>
      </Column>
      <Column field="event" header="Event" />
      <Column field="message" header="Message" />
    </DataTable>
  </div>
</template>
