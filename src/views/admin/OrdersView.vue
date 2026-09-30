<script setup>
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { Search } from '@primeicons/vue'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Tag from 'primevue/tag'

import BackLink from '@/components/shared/BackLink.vue'
import { useAdminList } from '@/composables/useAdminList.js'
import {
  OrderTypes,
  orderStatusLabels,
  orderStatusOptions,
  orderStatusSeverities,
  orderTypeOptions,
} from '@/constants/order.js'
import { useAdminOrdersStore } from '@/stores/admin/orders.js'
import { formatDateTime } from '@/utils/date.js'
import { formatMoney } from '@/utils/money.js'

const PAGE_SIZE = 20

const router = useRouter()
const adminOrdersStore = useAdminOrdersStore()
const { orders, pagination } = storeToRefs(adminOrdersStore)
const { fetchAdminOrdersRequest } = adminOrdersStore

const { filters, first, isLoading, handlePage } = useAdminList({
  fetch: fetchAdminOrdersRequest,
  pageSize: PAGE_SIZE,
  filters: { search: '', status: null, type: null },
})
</script>

<template>
  <section class="flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <BackLink :fallback="{ name: 'admin-dashboard' }" />
      <h1 class="text-2xl font-semibold">Orders</h1>
    </div>

    <div class="flex flex-wrap gap-3">
      <IconField class="w-full sm:w-64">
        <InputIcon><Search :size="16" /></InputIcon>
        <InputText v-model="filters.search" placeholder="Order number, e.g. NC-2609" fluid />
      </IconField>
      <Select
        v-model="filters.status"
        :options="orderStatusOptions"
        option-label="label"
        option-value="value"
        placeholder="Any status"
        show-clear
        class="w-48"
      />
      <Select
        v-model="filters.type"
        :options="orderTypeOptions"
        option-label="label"
        option-value="value"
        placeholder="Any type"
        show-clear
        class="w-40"
      />
    </div>

    <DataTable
      :value="orders"
      :loading="isLoading"
      lazy
      paginator
      :rows="PAGE_SIZE"
      :first="first"
      :total-records="pagination?.total ?? 0"
      data-key="id"
      row-hover
      class="cursor-pointer"
      @page="handlePage"
      @row-click="({ data }) => router.push({ name: 'admin-order-detail', params: { id: data.id } })"
    >
      <template #empty>No orders match.</template>
      <Column header="Order">
        <template #body="{ data }">
          <p class="font-medium">{{ data.orderNumber }}</p>
          <p class="text-xs text-surface-500">
            {{ formatDateTime(data.createdAt) }}
            <template v-if="data.type === OrderTypes.PREORDER"> · Pre-order</template>
          </p>
        </template>
      </Column>
      <Column header="Customer">
        <template #body="{ data }">
          <p>{{ data.customer.name ?? 'Deleted user' }}</p>
          <p class="text-xs text-surface-500">{{ data.customer.email }}</p>
        </template>
      </Column>
      <Column header="Items">
        <template #body="{ data }">{{ data.itemCount }}</template>
      </Column>
      <Column header="Total">
        <template #body="{ data }">{{ formatMoney(data.total) }}</template>
      </Column>
      <Column header="Status">
        <template #body="{ data }">
          <Tag :value="orderStatusLabels[data.status]" :severity="orderStatusSeverities[data.status]" />
        </template>
      </Column>
    </DataTable>
  </section>
</template>
