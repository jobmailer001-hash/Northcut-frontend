<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink, useRoute } from 'vue-router'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import Tag from 'primevue/tag'

import AdminOrderActions from '@/components/admin/AdminOrderActions.vue'
import BackLink from '@/components/shared/BackLink.vue'
import CartLineItem from '@/components/store/CartLineItem.vue'
import OrderTotals from '@/components/store/OrderTotals.vue'
import { OrderTypes, orderStatusLabels, orderStatusSeverities } from '@/constants/order.js'
import { transactionStatusSeverities } from '@/constants/transaction.js'
import { useAdminOrdersStore } from '@/stores/admin/orders.js'
import { formatDateTime } from '@/utils/date.js'
import { formatMoney } from '@/utils/money.js'

const route = useRoute()
const adminOrdersStore = useAdminOrdersStore()
const { order } = storeToRefs(adminOrdersStore)
const { fetchAdminOrderRequest } = adminOrdersStore

const isLoading = ref(true)
const loadError = ref('')

const timeline = computed(() =>
  [
    { label: 'Placed', at: order.value.createdAt },
    { label: 'Paid', at: order.value.paidAt },
    { label: 'Shipped', at: order.value.shippedAt },
    { label: 'Delivered', at: order.value.deliveredAt },
    { label: `Cancelled by ${order.value.cancellation?.by?.toLowerCase() ?? ''}`, at: order.value.cancelledAt },
  ].filter((step) => step.at),
)

const loadOrder = async (orderId) => {
  isLoading.value = true
  loadError.value = ''
  try {
    await fetchAdminOrderRequest(orderId)
  } catch (err) {
    loadError.value = err.message
  } finally {
    isLoading.value = false
  }
}

watch(() => route.params.id, loadOrder, { immediate: true })
</script>

<template>
  <section class="mx-auto flex max-w-4xl flex-col gap-6">
    <Message v-if="loadError" severity="error">{{ loadError }}</Message>

    <template v-else-if="isLoading || !order">
      <Skeleton height="2rem" width="18rem" />
      <Skeleton height="16rem" />
    </template>

    <template v-else>
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div class="flex flex-col gap-2">
          <BackLink :fallback="{ name: 'admin-orders' }" />
          <h1 class="text-2xl font-semibold">
            {{ order.orderNumber }}
            <span v-if="order.type === OrderTypes.PREORDER" class="text-base text-surface-500">· Pre-order</span>
          </h1>
          <p class="text-sm text-surface-500">
            <RouterLink
              :to="{ name: 'admin-customer-detail', params: { id: order.customer.id } }"
              class="hover:underline"
            >
              {{ order.customer.name ?? 'Deleted user' }}
            </RouterLink>
            · {{ order.customer.email }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <Tag :value="orderStatusLabels[order.status]" :severity="orderStatusSeverities[order.status]" />
          <Tag :value="`Stock ${order.reservationStatus.toLowerCase()}`" severity="secondary" />
        </div>
      </div>

      <AdminOrderActions :order="order" />

      <Message v-if="order.cancellation?.reason" severity="secondary">
        Cancellation reason: {{ order.cancellation.reason }}
      </Message>

      <ul class="divide-y divide-surface-200 border-y border-surface-200">
        <CartLineItem v-for="item in order.items" :key="item.sku" :line="{ ...item, slug: null }" :editable="false" />
      </ul>

      <div class="grid gap-6 md:grid-cols-2">
        <div class="flex flex-col gap-2">
          <h2 class="font-semibold">Ship to</h2>
          <address class="text-sm leading-relaxed text-surface-600 not-italic">
            {{ order.shippingAddress.fullName }} · {{ order.shippingAddress.phone }}<br />
            {{ order.shippingAddress.line1 }}<template v-if="order.shippingAddress.line2">, {{ order.shippingAddress.line2 }}</template><br />
            {{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.postalCode }}<br />
            {{ order.shippingAddress.country }}
          </address>
          <ol class="mt-2 flex flex-col gap-1 text-sm text-surface-600">
            <li v-for="step in timeline" :key="step.label">
              <span class="font-medium text-surface-900">{{ step.label }}</span> · {{ formatDateTime(step.at) }}
            </li>
          </ol>
        </div>
        <OrderTotals :subtotal="order.subtotal" :shipping-fee="order.shippingFee" :total="order.total" />
      </div>

      <section class="flex flex-col gap-2">
        <h2 class="font-semibold">Transactions</h2>
        <p v-if="!order.transactions.length" class="text-sm text-surface-500">No payment attempts yet.</p>
        <ul v-else class="divide-y divide-surface-200 rounded-lg border border-surface-200">
          <li v-for="transaction in order.transactions" :key="transaction.id">
            <RouterLink
              :to="{ name: 'admin-transaction-detail', params: { id: transaction.id } }"
              class="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm hover:bg-surface-50"
            >
              <span>
                <span class="font-medium">{{ transaction.type === 'REFUND' ? 'Refund' : 'Payment' }}</span>
                · {{ transaction.providerReference }}
              </span>
              <span class="flex items-center gap-3">
                {{ formatMoney(transaction.amount) }}
                <Tag :value="transaction.status" :severity="transactionStatusSeverities[transaction.status]" />
              </span>
            </RouterLink>
          </li>
        </ul>
      </section>
    </template>
  </section>
</template>
