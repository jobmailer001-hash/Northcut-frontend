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
import { customerStatusOptions, customerStatusSeverities } from '@/constants/user.js'
import { useAdminCustomersStore } from '@/stores/admin/customers.js'
import { formatDate } from '@/utils/date.js'

const PAGE_SIZE = 20

const router = useRouter()
const adminCustomersStore = useAdminCustomersStore()
const { customers, pagination } = storeToRefs(adminCustomersStore)
const { fetchCustomersRequest } = adminCustomersStore

const { filters, first, isLoading, handlePage } = useAdminList({
  fetch: fetchCustomersRequest,
  pageSize: PAGE_SIZE,
  filters: { search: '', status: null },
})
</script>

<template>
  <section class="flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <BackLink :fallback="{ name: 'admin-dashboard' }" />
      <h1 class="text-2xl font-semibold">Customers</h1>
    </div>

    <div class="flex flex-wrap gap-3">
      <IconField class="w-full sm:w-72">
        <InputIcon><Search :size="16" /></InputIcon>
        <InputText v-model="filters.search" placeholder="Name or email" fluid />
      </IconField>
      <Select
        v-model="filters.status"
        :options="customerStatusOptions"
        option-label="label"
        option-value="value"
        placeholder="Any status"
        show-clear
        class="w-40"
      />
    </div>

    <DataTable
      :value="customers"
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
      @row-click="({ data }) => router.push({ name: 'admin-customer-detail', params: { id: data.id } })"
    >
      <template #empty>No customers match.</template>
      <Column field="name" header="Name" />
      <Column field="email" header="Email" />
      <Column header="Joined">
        <template #body="{ data }">{{ formatDate(data.createdAt) }}</template>
      </Column>
      <Column header="Status">
        <template #body="{ data }">
          <Tag :value="data.status" :severity="customerStatusSeverities[data.status]" />
        </template>
      </Column>
    </DataTable>
  </section>
</template>
