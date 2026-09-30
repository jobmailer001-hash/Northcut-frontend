<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { Image as ImageIcon } from '@primeicons/vue'
import Button from 'primevue/button'
import Paginator from 'primevue/paginator'
import Skeleton from 'primevue/skeleton'
import Tag from 'primevue/tag'

import BackLink from '@/components/shared/BackLink.vue'
import LoadErrorMessage from '@/components/shared/LoadErrorMessage.vue'
import { OrderTypes, orderStatusLabels, orderStatusSeverities } from '@/constants/order.js'
import { useOrdersStore } from '@/stores/orders.js'
import { formatDate } from '@/utils/date.js'
import { ImageWidths, toOptimizedImageUrl } from '@/utils/image.js'
import { formatMoney } from '@/utils/money.js'

const PAGE_SIZE = 10

const route = useRoute()
const router = useRouter()
const ordersStore = useOrdersStore()
const { orders, pagination } = storeToRefs(ordersStore)
const { fetchOrdersRequest } = ordersStore

const isLoading = ref(true)
const loadError = ref('')
const currentPage = computed(() => Math.max(1, Number(route.query.page) || 1))

const loadOrders = async () => {
  isLoading.value = true
  loadError.value = ''
  try {
    await fetchOrdersRequest({ page: currentPage.value, limit: PAGE_SIZE })
  } catch (err) {
    loadError.value = err.message
  } finally {
    isLoading.value = false
  }
}

watch(currentPage, loadOrders, { immediate: true })
</script>

<template>
  <section class="mx-auto flex max-w-3xl flex-col gap-6">
    <div class="flex flex-col gap-2">
      <BackLink :fallback="{ name: 'landing' }" />
      <h1 class="text-3xl font-semibold">My orders</h1>
    </div>

    <LoadErrorMessage v-if="loadError" :message="loadError" @retry="loadOrders" />

    <div v-else-if="isLoading" class="flex flex-col gap-3">
      <Skeleton v-for="index in 3" :key="index" height="5.5rem" />
    </div>

    <div v-else-if="!orders.length" class="flex flex-col items-center gap-4 py-16 text-center">
      <p class="text-surface-500">You haven't placed any orders yet.</p>
      <Button as="router-link" :to="{ name: 'products' }" label="Start shopping" />
    </div>

    <ul v-else class="flex flex-col gap-3">
      <li v-for="order in orders" :key="order.orderNumber">
        <RouterLink
          :to="{ name: 'order-detail', params: { orderNumber: order.orderNumber } }"
          class="flex items-center gap-4 rounded-lg border border-surface-200 p-4 hover:bg-surface-50"
        >
          <div class="size-14 shrink-0 overflow-hidden rounded bg-surface-100">
            <img
              v-if="order.previewItem.image"
              :src="toOptimizedImageUrl(order.previewItem.image, ImageWidths.THUMBNAIL)"
              :alt="order.previewItem.name"
              class="size-full object-cover"
            />
            <div v-else class="flex size-full items-center justify-center">
              <ImageIcon :size="18" color="var(--p-surface-400)" />
            </div>
          </div>
          <div class="flex flex-1 flex-col gap-1">
            <p class="font-medium">
              {{ order.orderNumber }}
              <span v-if="order.type === OrderTypes.PREORDER" class="text-sm text-surface-500">
                · Pre-order
              </span>
            </p>
            <p class="text-sm text-surface-500">
              {{ formatDate(order.createdAt) }} · {{ order.itemCount }} item(s) ·
              {{ formatMoney(order.total) }}
            </p>
          </div>
          <Tag
            :value="orderStatusLabels[order.status]"
            :severity="orderStatusSeverities[order.status]"
          />
        </RouterLink>
      </li>
    </ul>

    <Paginator
      v-if="!loadError && pagination && pagination.totalPages > 1"
      :rows="PAGE_SIZE"
      :first="(currentPage - 1) * PAGE_SIZE"
      :total-records="pagination.total"
      @page="({ page }) => router.push({ query: { page: page + 1 } })"
    />
  </section>
</template>
