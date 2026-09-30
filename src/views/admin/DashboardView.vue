<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import Tag from 'primevue/tag'

import BackLink from '@/components/shared/BackLink.vue'
import { orderStatusLabels, orderStatusSeverities } from '@/constants/order.js'
import { useAdminOverviewStore } from '@/stores/admin/overview.js'
import { formatDateTime } from '@/utils/date.js'
import { formatMoney } from '@/utils/money.js'

const adminOverviewStore = useAdminOverviewStore()
const { dashboard } = storeToRefs(adminOverviewStore)
const { fetchDashboardRequest } = adminOverviewStore

const isLoading = ref(true)
const loadError = ref('')

const statCards = computed(() => [
  { label: 'Revenue (all time)', value: formatMoney(dashboard.value.revenue.allTime) },
  { label: `Revenue (last ${dashboard.value.revenue.recentDays} days)`, value: formatMoney(dashboard.value.revenue.recent) },
  { label: 'Orders today', value: dashboard.value.orders.today },
  {
    label: 'Awaiting shipment',
    value: dashboard.value.orders.awaitingShipment,
    to: { name: 'admin-orders' },
  },
  { label: 'Customers', value: dashboard.value.customers.total, to: { name: 'admin-customers' } },
])

onMounted(async () => {
  try {
    await fetchDashboardRequest()
  } catch (err) {
    loadError.value = err.message
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section class="flex flex-col gap-8">
    <div class="flex flex-col gap-2">
      <BackLink :fallback="{ name: 'landing' }" />
      <h1 class="text-2xl font-semibold">Dashboard</h1>
    </div>

    <Message v-if="loadError" severity="error">{{ loadError }}</Message>

    <div v-else-if="isLoading || !dashboard" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Skeleton v-for="index in 5" :key="index" height="6rem" />
    </div>

    <template v-else>
      <dl class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <component
          :is="card.to ? RouterLink : 'div'"
          v-for="card in statCards"
          :key="card.label"
          v-bind="card.to ? { to: card.to } : {}"
          class="rounded-lg border border-surface-200 bg-white p-4"
          :class="{ 'hover:border-primary': card.to }"
        >
          <dt class="text-sm text-surface-500">{{ card.label }}</dt>
          <dd class="mt-1 text-2xl font-semibold">{{ card.value }}</dd>
        </component>
      </dl>

      <section class="flex flex-col gap-3">
        <h2 class="font-semibold">Orders by status</h2>
        <div class="flex flex-wrap gap-2">
          <Tag
            v-for="(count, status) in dashboard.orders.byStatus"
            :key="status"
            :value="`${orderStatusLabels[status]}: ${count}`"
            :severity="orderStatusSeverities[status]"
          />
        </div>
      </section>

      <div class="grid gap-8 lg:grid-cols-2">
        <section class="flex flex-col gap-3">
          <h2 class="font-semibold">Recent orders</h2>
          <p v-if="!dashboard.recentOrders.length" class="text-sm text-surface-500">No orders yet.</p>
          <ul v-else class="divide-y divide-surface-200 rounded-lg border border-surface-200 bg-white">
            <li v-for="order in dashboard.recentOrders" :key="order.id">
              <RouterLink
                :to="{ name: 'admin-order-detail', params: { id: order.id } }"
                class="flex items-center justify-between gap-2 px-4 py-3 text-sm hover:bg-surface-50"
              >
                <span>
                  <span class="font-medium">{{ order.orderNumber }}</span>
                  <span class="block text-xs text-surface-500">{{ formatDateTime(order.createdAt) }}</span>
                </span>
                <span class="flex items-center gap-3">
                  {{ formatMoney(order.total) }}
                  <Tag :value="orderStatusLabels[order.status]" :severity="orderStatusSeverities[order.status]" />
                </span>
              </RouterLink>
            </li>
          </ul>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="font-semibold">Low stock (≤ {{ dashboard.lowStockThreshold }} available)</h2>
          <p v-if="!dashboard.lowStockProducts.length" class="text-sm text-surface-500">Everything's well stocked.</p>
          <ul v-else class="divide-y divide-surface-200 rounded-lg border border-surface-200 bg-white">
            <li v-for="product in dashboard.lowStockProducts" :key="product.id">
              <RouterLink
                :to="{ name: 'admin-product-detail', params: { slug: product.slug } }"
                class="flex items-center justify-between gap-2 px-4 py-3 text-sm hover:bg-surface-50"
              >
                <span>
                  <span class="font-medium">{{ product.name }}</span>
                  <span class="block text-xs text-surface-500">{{ product.sku }}</span>
                </span>
                <span :class="product.availableStock <= 0 ? 'font-semibold text-red-600' : ''">
                  {{ product.availableStock }} available
                </span>
              </RouterLink>
            </li>
          </ul>
        </section>
      </div>
    </template>
  </section>
</template>
