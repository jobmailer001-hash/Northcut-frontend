<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import Tag from 'primevue/tag'
import { useConfirm } from 'primevue/useconfirm'

import BackLink from '@/components/shared/BackLink.vue'
import CartLineItem from '@/components/store/CartLineItem.vue'
import ChangeShippingAddressDialog from '@/components/store/ChangeShippingAddressDialog.vue'
import OrderTotals from '@/components/store/OrderTotals.vue'
import { usePayment } from '@/composables/usePayment.js'
import { OrderStatuses, OrderTypes, orderStatusLabels, orderStatusSeverities } from '@/constants/order.js'
import { handleApiError } from '@/error/handleApiError.js'
import { useOrdersStore } from '@/stores/orders.js'
import { formatDateTime, formatTime } from '@/utils/date.js'
import { successToast } from '@/utils/toastService.js'

// After returning from the payment page, the webhook may take a moment: poll briefly.
const PAYMENT_POLL_INTERVAL_MS = 2000
const PAYMENT_POLL_ATTEMPTS = 10

const route = useRoute()
const router = useRouter()
const confirm = useConfirm()
const ordersStore = useOrdersStore()
const { order } = storeToRefs(ordersStore)
const { fetchOrderRequest, cancelOrderRequest } = ordersStore
const { isStartingPayment, payForOrder } = usePayment()

const isLoading = ref(true)
const loadError = ref('')
const isCancelling = ref(false)
const isAddressDialogVisible = ref(false)
const isConfirmingPayment = ref(false)
const isPaymentUnconfirmed = ref(false)
let pollTimer = null

const wasRefunded = computed(() => order.value?.status === OrderStatuses.CANCELLED && order.value.paidAt)

const timeline = computed(() =>
  [
    { label: 'Placed', at: order.value.createdAt },
    { label: 'Paid', at: order.value.paidAt },
    { label: 'Shipped', at: order.value.shippedAt },
    { label: 'Delivered', at: order.value.deliveredAt },
    { label: 'Cancelled', at: order.value.cancelledAt },
  ].filter((step) => step.at),
)

// Re-fetches until the order leaves PENDING_PAYMENT or we give up (the webhook may be slow).
const waitForPaymentConfirmation = (attemptsLeft) => {
  if (!order.value?.canPay) {
    isConfirmingPayment.value = false
    if (order.value?.status === OrderStatuses.PAID) successToast('Payment received — thank you!')
    return
  }
  if (!attemptsLeft) {
    isConfirmingPayment.value = false
    isPaymentUnconfirmed.value = true
    return
  }
  pollTimer = setTimeout(async () => {
    try {
      await fetchOrderRequest(order.value.orderNumber)
    } catch (err) {
      handleApiError(err)
    }
    waitForPaymentConfirmation(attemptsLeft - 1)
  }, PAYMENT_POLL_INTERVAL_MS)
}

const loadOrder = async (orderNumber) => {
  clearTimeout(pollTimer)
  isLoading.value = true
  loadError.value = ''
  isPaymentUnconfirmed.value = false
  try {
    await fetchOrderRequest(orderNumber)
  } catch (err) {
    loadError.value = err.message
    return
  } finally {
    isLoading.value = false
  }

  if (route.query.payment === 'return') {
    // Drop the flag so a reload doesn't start polling again.
    router.replace({ query: {} })
    isConfirmingPayment.value = true
    waitForPaymentConfirmation(PAYMENT_POLL_ATTEMPTS)
  }
}

const cancelOrder = async () => {
  isCancelling.value = true
  try {
    await cancelOrderRequest(order.value.orderNumber)
    successToast(order.value.paidAt ? 'Order cancelled — your refund is on its way.' : 'Order cancelled.')
  } catch (err) {
    handleApiError(err)
  } finally {
    isCancelling.value = false
  }
}

const confirmCancel = () => {
  confirm.require({
    header: 'Cancel this order?',
    message: order.value.paidAt
      ? 'Your items will be released and your payment refunded in full.'
      : 'Your reserved items will be released.',
    acceptProps: { label: 'Cancel order', severity: 'danger' },
    rejectProps: { label: 'Keep order', severity: 'secondary', variant: 'outlined' },
    accept: cancelOrder,
  })
}

watch(() => route.params.orderNumber, loadOrder, { immediate: true })
onUnmounted(() => clearTimeout(pollTimer))
</script>

<template>
  <section class="mx-auto flex max-w-3xl flex-col gap-6">
    <Message v-if="loadError" severity="error">{{ loadError }}</Message>

    <template v-else-if="isLoading || !order">
      <Skeleton height="2rem" width="18rem" />
      <Skeleton height="14rem" />
    </template>

    <template v-else>
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div class="flex flex-col gap-2">
          <BackLink :fallback="{ name: 'orders' }" />
          <h1 class="text-2xl font-semibold">
            {{ order.orderNumber }}
            <span v-if="order.type === OrderTypes.PREORDER" class="text-base text-surface-500">· Pre-order</span>
          </h1>
        </div>
        <Tag :value="orderStatusLabels[order.status]" :severity="orderStatusSeverities[order.status]" />
      </div>

      <Message v-if="isConfirmingPayment" severity="info">Confirming your payment…</Message>
      <Message v-else-if="isPaymentUnconfirmed" severity="warn">
        We haven't received confirmation yet. If you completed payment, this page will update shortly —
        otherwise you can try again below.
      </Message>
      <Message v-else-if="order.canPay" severity="warn">
        Pay before {{ formatTime(order.expiresAt) }} — after that your items are released.
      </Message>
      <Message v-if="wasRefunded" severity="info">
        This order was cancelled after payment. Your full refund is on its way.
      </Message>

      <ul class="divide-y divide-surface-200 border-y border-surface-200">
        <CartLineItem
          v-for="item in order.items"
          :key="item.sku"
          :line="{ ...item, slug: null }"
          :editable="false"
        />
      </ul>

      <div class="grid gap-6 md:grid-cols-2">
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between gap-2">
            <h2 class="font-semibold">Shipping to</h2>
            <!-- Only until the order ships. -->
            <Button
              v-if="order.canChangeAddress"
              label="Change address"
              size="small"
              variant="text"
              @click="isAddressDialogVisible = true"
            />
          </div>
          <address class="text-sm leading-relaxed text-surface-600 not-italic">
            {{ order.shippingAddress.fullName }} · {{ order.shippingAddress.phone }}<br />
            {{ order.shippingAddress.line1 }}<template v-if="order.shippingAddress.line2">, {{ order.shippingAddress.line2 }}</template><br />
            {{ order.shippingAddress.city }}, {{ order.shippingAddress.state }}<br />
            {{ order.shippingAddress.country }}
          </address>
          <ChangeShippingAddressDialog
            v-model:visible="isAddressDialogVisible"
            :order-number="order.orderNumber"
          />
        </div>
        <OrderTotals :subtotal="order.subtotal" :shipping-fee="order.shippingFee" :total="order.total" />
      </div>

      <ol class="flex flex-col gap-1 text-sm text-surface-600">
        <li v-for="step in timeline" :key="step.label">
          <span class="font-medium text-surface-900">{{ step.label }}</span> · {{ formatDateTime(step.at) }}
        </li>
      </ol>

      <div class="flex flex-wrap gap-3">
        <Button
          v-if="order.canPay && !isConfirmingPayment"
          label="Pay now"
          :loading="isStartingPayment"
          @click="payForOrder(order.orderNumber)"
        />
        <Button
          v-if="order.canCancel && !isConfirmingPayment"
          label="Cancel order"
          severity="danger"
          variant="outlined"
          :loading="isCancelling"
          @click="confirmCancel"
        />
      </div>
    </template>
  </section>
</template>
