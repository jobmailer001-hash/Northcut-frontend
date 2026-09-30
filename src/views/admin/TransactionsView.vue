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
  transactionStatusOptions,
  transactionStatusSeverities,
  transactionTypeOptions,
} from '@/constants/transaction.js'
import { useAdminTransactionsStore } from '@/stores/admin/transactions.js'
import { formatDateTime } from '@/utils/date.js'
import { formatMoney } from '@/utils/money.js'

const PAGE_SIZE = 20

const router = useRouter()
const adminTransactionsStore = useAdminTransactionsStore()
const { transactions, pagination } = storeToRefs(adminTransactionsStore)
const { fetchTransactionsRequest } = adminTransactionsStore

const { filters, first, isLoading, handlePage } = useAdminList({
  fetch: fetchTransactionsRequest,
  pageSize: PAGE_SIZE,
  filters: { search: '', type: null, status: null },
})
</script>

<template>
  <section class="flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <BackLink :fallback="{ name: 'admin-dashboard' }" />
      <h1 class="text-2xl font-semibold">Transactions</h1>
    </div>

    <div class="flex flex-wrap gap-3">
      <IconField class="w-full sm:w-72">
        <InputIcon><Search :size="16" /></InputIcon>
        <InputText v-model="filters.search" placeholder="Reference (NCPAY-… / NCREF-…)" fluid />
      </IconField>
      <Select
        v-model="filters.type"
        :options="transactionTypeOptions"
        option-label="label"
        option-value="value"
        placeholder="Any type"
        show-clear
        class="w-40"
      />
      <Select
        v-model="filters.status"
        :options="transactionStatusOptions"
        option-label="label"
        option-value="value"
        placeholder="Any status"
        show-clear
        class="w-40"
      />
    </div>

    <DataTable
      :value="transactions"
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
      @row-click="({ data }) => router.push({ name: 'admin-transaction-detail', params: { id: data.id } })"
    >
      <template #empty>No transactions match.</template>
      <Column header="Reference">
        <template #body="{ data }">
          <p class="font-medium">{{ data.type === 'REFUND' ? 'Refund' : 'Payment' }}</p>
          <p class="max-w-56 truncate text-xs text-surface-500">{{ data.providerReference }}</p>
        </template>
      </Column>
      <Column header="Order">
        <template #body="{ data }">{{ data.order.orderNumber ?? '—' }}</template>
      </Column>
      <Column header="Customer">
        <template #body="{ data }">{{ data.customer.email ?? '—' }}</template>
      </Column>
      <Column header="Amount">
        <template #body="{ data }">{{ formatMoney(data.amount) }}</template>
      </Column>
      <Column header="Status">
        <template #body="{ data }">
          <Tag :value="data.status" :severity="transactionStatusSeverities[data.status]" />
        </template>
      </Column>
      <Column header="Created">
        <template #body="{ data }">{{ formatDateTime(data.createdAt) }}</template>
      </Column>
    </DataTable>
  </section>
</template>
