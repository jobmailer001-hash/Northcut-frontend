<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink, useRoute } from 'vue-router'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import Tag from 'primevue/tag'

import BackLink from '@/components/shared/BackLink.vue'
import { transactionStatusSeverities } from '@/constants/transaction.js'
import { useAdminTransactionsStore } from '@/stores/admin/transactions.js'
import { formatDateTime } from '@/utils/date.js'
import { formatMoney } from '@/utils/money.js'

const route = useRoute()
const adminTransactionsStore = useAdminTransactionsStore()
const { transaction } = storeToRefs(adminTransactionsStore)
const { fetchTransactionRequest } = adminTransactionsStore

const isLoading = ref(true)
const loadError = ref('')

const details = computed(() => [
  { label: 'Type', value: transaction.value.type === 'REFUND' ? 'Refund' : 'Payment' },
  { label: 'Amount', value: formatMoney(transaction.value.amount, transaction.value.currency) },
  { label: 'Provider', value: transaction.value.provider },
  { label: 'Reference', value: transaction.value.providerReference },
  { label: 'Customer', value: transaction.value.customer.email ?? '—' },
  { label: 'Created', value: formatDateTime(transaction.value.createdAt) },
  { label: 'Last updated', value: formatDateTime(transaction.value.updatedAt) },
])

const loadTransaction = async (transactionId) => {
  isLoading.value = true
  loadError.value = ''
  try {
    await fetchTransactionRequest(transactionId)
  } catch (err) {
    loadError.value = err.message
  } finally {
    isLoading.value = false
  }
}

watch(() => route.params.id, loadTransaction, { immediate: true })
</script>

<template>
  <section class="mx-auto flex max-w-3xl flex-col gap-6">
    <Message v-if="loadError" severity="error">{{ loadError }}</Message>

    <template v-else-if="isLoading || !transaction">
      <Skeleton height="2rem" width="18rem" />
      <Skeleton height="12rem" />
    </template>

    <template v-else>
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div class="flex flex-col gap-2">
          <BackLink :fallback="{ name: 'admin-transactions' }" />
          <h1 class="text-2xl font-semibold">{{ transaction.type === 'REFUND' ? 'Refund' : 'Payment' }}</h1>
        </div>
        <Tag :value="transaction.status" :severity="transactionStatusSeverities[transaction.status]" />
      </div>

      <dl class="grid gap-x-6 gap-y-3 rounded-lg border border-surface-200 p-5 text-sm sm:grid-cols-2">
        <div v-for="detail in details" :key="detail.label">
          <dt class="text-surface-500">{{ detail.label }}</dt>
          <dd class="break-all font-medium">{{ detail.value }}</dd>
        </div>
        <div>
          <dt class="text-surface-500">Order</dt>
          <dd class="font-medium">
            <RouterLink
              :to="{ name: 'admin-order-detail', params: { id: transaction.order.id } }"
              class="text-primary hover:underline"
            >
              {{ transaction.order.orderNumber ?? transaction.order.id }}
            </RouterLink>
          </dd>
        </div>
        <div v-if="transaction.refundOf">
          <dt class="text-surface-500">Refund of</dt>
          <dd class="font-medium">
            <RouterLink
              :to="{ name: 'admin-transaction-detail', params: { id: transaction.refundOf.id } }"
              class="break-all text-primary hover:underline"
            >
              {{ transaction.refundOf.providerReference }}
            </RouterLink>
          </dd>
        </div>
      </dl>

      <section class="flex flex-col gap-2">
        <h2 class="font-semibold">What the provider reported</h2>
        <pre
          v-if="transaction.providerPayload"
          class="overflow-x-auto rounded-lg bg-surface-900 p-4 text-xs text-surface-100"
        >{{ JSON.stringify(transaction.providerPayload, null, 2) }}</pre>
        <p v-else class="text-sm text-surface-500">Nothing yet — the provider hasn't confirmed this transaction.</p>
      </section>
    </template>
  </section>
</template>
