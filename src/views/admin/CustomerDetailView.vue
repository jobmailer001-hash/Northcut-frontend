<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink, useRoute } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import Tag from 'primevue/tag'
import { useConfirm } from 'primevue/useconfirm'

import BackLink from '@/components/shared/BackLink.vue'
import { orderStatusLabels, orderStatusSeverities } from '@/constants/order.js'
import { UserStatuses, customerStatusSeverities } from '@/constants/user.js'
import { handleApiError } from '@/error/handleApiError.js'
import { useAdminCustomersStore } from '@/stores/admin/customers.js'
import { formatDate, formatDateTime } from '@/utils/date.js'
import { formatMoney } from '@/utils/money.js'
import { successToast } from '@/utils/toastService.js'

const route = useRoute()
const confirm = useConfirm()
const adminCustomersStore = useAdminCustomersStore()
const { customerDetail } = storeToRefs(adminCustomersStore)
const { fetchCustomerRequest, updateCustomerStatusRequest } = adminCustomersStore

const isLoading = ref(true)
const loadError = ref('')
const isUpdatingStatus = ref(false)

const isDisabled = computed(() => customerDetail.value?.customer.status === UserStatuses.DISABLED)

const loadCustomer = async (customerId) => {
  isLoading.value = true
  loadError.value = ''
  try {
    await fetchCustomerRequest(customerId)
  } catch (err) {
    loadError.value = err.message
  } finally {
    isLoading.value = false
  }
}

const setStatus = async (status) => {
  isUpdatingStatus.value = true
  try {
    await updateCustomerStatusRequest(customerDetail.value.customer.id, status)
    successToast(status === UserStatuses.DISABLED ? 'Customer disabled and logged out.' : 'Customer enabled.')
  } catch (err) {
    handleApiError(err)
  } finally {
    isUpdatingStatus.value = false
  }
}

const toggleStatus = () => {
  if (isDisabled.value) {
    setStatus(UserStatuses.ACTIVE)
    return
  }
  confirm.require({
    header: 'Disable this customer?',
    message: 'They’ll be logged out everywhere and can’t log in until re-enabled. Their orders are unaffected.',
    acceptProps: { label: 'Disable', severity: 'danger' },
    rejectProps: { label: 'Cancel', severity: 'secondary', variant: 'outlined' },
    accept: () => setStatus(UserStatuses.DISABLED),
  })
}

watch(() => route.params.id, loadCustomer, { immediate: true })
</script>

<template>
  <section class="mx-auto flex max-w-4xl flex-col gap-6">
    <Message v-if="loadError" severity="error">{{ loadError }}</Message>

    <template v-else-if="isLoading || !customerDetail">
      <Skeleton height="2rem" width="18rem" />
      <Skeleton height="14rem" />
    </template>

    <template v-else>
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div class="flex flex-col gap-2">
          <BackLink :fallback="{ name: 'admin-customers' }" />
          <h1 class="text-2xl font-semibold">{{ customerDetail.customer.name }}</h1>
          <p class="text-sm text-surface-500">
            {{ customerDetail.customer.email }} · joined {{ formatDate(customerDetail.customer.createdAt) }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <Tag :value="customerDetail.customer.status" :severity="customerStatusSeverities[customerDetail.customer.status]" />
          <Button
            :label="isDisabled ? 'Enable' : 'Disable'"
            :severity="isDisabled ? 'secondary' : 'danger'"
            variant="outlined"
            size="small"
            :loading="isUpdatingStatus"
            @click="toggleStatus"
          />
        </div>
      </div>

      <dl class="grid grid-cols-3 gap-4">
        <div class="rounded-lg border border-surface-200 p-4">
          <dt class="text-sm text-surface-500">Orders</dt>
          <dd class="text-2xl font-semibold">{{ customerDetail.stats.orderCount }}</dd>
        </div>
        <div class="rounded-lg border border-surface-200 p-4">
          <dt class="text-sm text-surface-500">Paid orders</dt>
          <dd class="text-2xl font-semibold">{{ customerDetail.stats.paidOrderCount }}</dd>
        </div>
        <div class="rounded-lg border border-surface-200 p-4">
          <dt class="text-sm text-surface-500">Total spent</dt>
          <dd class="text-2xl font-semibold">{{ formatMoney(customerDetail.stats.totalSpent) }}</dd>
        </div>
      </dl>

      <section class="flex flex-col gap-2">
        <h2 class="font-semibold">Recent orders</h2>
        <p v-if="!customerDetail.recentOrders.length" class="text-sm text-surface-500">No orders yet.</p>
        <ul v-else class="divide-y divide-surface-200 rounded-lg border border-surface-200">
          <li v-for="order in customerDetail.recentOrders" :key="order.id">
            <RouterLink
              :to="{ name: 'admin-order-detail', params: { id: order.id } }"
              class="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm hover:bg-surface-50"
            >
              <span><span class="font-medium">{{ order.orderNumber }}</span> · {{ formatDateTime(order.createdAt) }}</span>
              <span class="flex items-center gap-3">
                {{ formatMoney(order.total) }}
                <Tag :value="orderStatusLabels[order.status]" :severity="orderStatusSeverities[order.status]" />
              </span>
            </RouterLink>
          </li>
        </ul>
      </section>

      <section class="flex flex-col gap-2">
        <h2 class="font-semibold">Addresses</h2>
        <p v-if="!customerDetail.customer.addresses.length" class="text-sm text-surface-500">None saved.</p>
        <ul v-else class="grid gap-3 md:grid-cols-2">
          <li
            v-for="address in customerDetail.customer.addresses"
            :key="address.id"
            class="rounded-lg border border-surface-200 p-4 text-sm text-surface-600"
          >
            <p class="font-medium text-surface-900">
              {{ address.label || address.fullName }} <span v-if="address.isDefault">(default)</span>
            </p>
            {{ address.fullName }} · {{ address.phone }}<br />
            {{ address.line1 }}, {{ address.city }}, {{ address.state }}, {{ address.country }}
          </li>
        </ul>
      </section>
    </template>
  </section>
</template>
