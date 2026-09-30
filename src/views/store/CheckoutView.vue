<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'

import BackLink from '@/components/shared/BackLink.vue'
import AddressPicker from '@/components/store/AddressPicker.vue'
import CartLineItem from '@/components/store/CartLineItem.vue'
import OrderTotals from '@/components/store/OrderTotals.vue'
import { useCartPreview } from '@/composables/useCartPreview.js'
import { usePayment } from '@/composables/usePayment.js'
import { ApiError } from '@/error/errors.js'
import { useCartStore } from '@/stores/cart.js'
import { useOrdersStore } from '@/stores/orders.js'
import { warningToast } from '@/utils/toastService.js'

const router = useRouter()
const { items, lines, preview, hasIssues, issuesBySku, isLoading, updateQuantity, removeItem } =
  useCartPreview()
const { clearCart } = useCartStore()
const { placeOrderRequest } = useOrdersStore()
const { continueToPayment } = usePayment()

// Saved address `{ shippingAddressId }` or one-off `{ shippingAddress }` — see AddressPicker.
const shippingTarget = ref(null)
const formError = ref('')
const isPlacing = ref(false)
// Set once the order exists, so emptying the cart afterwards doesn't bounce to /cart.
let isOrderPlaced = false

// Why the order can't be placed yet — shown under the disabled button — or null when it can.
// While the bag is loading the button is simply disabled; that state is only momentary.
const blockedReason = computed(() => {
  if (!items.value.length) return 'Your bag is empty.'
  if (hasIssues.value) return 'Fix the items marked in your order before continuing.'
  if (!shippingTarget.value) return 'Choose or add a shipping address to continue.'
  return null
})

const canPlaceOrder = computed(() => !isLoading.value && !blockedReason.value)

// Nothing to check out (cart emptied here or in another tab) — back to the cart.
watch(
  () => items.value.length,
  (count) => {
    if (!count && !isOrderPlaced) router.replace({ name: 'cart' })
  },
  { immediate: true },
)

const placeOrder = async () => {
  formError.value = ''
  isPlacing.value = true
  try {
    const placed = await placeOrderRequest({ items: items.value, shippingTarget: shippingTarget.value })
    isOrderPlaced = true
    clearCart()
    continueToPayment(placed)
  } catch (err) {
    if (err instanceof ApiError && err.code === 'CART_REQUIRES_UPDATE') {
      warningToast(err.message)
      router.push({ name: 'cart' })
      return
    }
    formError.value = err.message
  } finally {
    isPlacing.value = false
  }
}
</script>

<template>
  <section class="flex flex-col gap-8">
    <div class="flex flex-col gap-2">
      <BackLink :fallback="{ name: 'cart' }" />
      <h1 class="text-3xl font-semibold">Checkout</h1>
    </div>

    <div class="grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
      <div class="flex flex-col gap-8">
        <AddressPicker v-model="shippingTarget" />

        <section class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Items</h2>
            <RouterLink :to="{ name: 'cart' }" class="text-sm font-medium hover:underline">
              Edit cart
            </RouterLink>
          </div>
          <Skeleton v-if="isLoading && !preview" height="8rem" />
          <ul v-else class="divide-y divide-surface-200 border-y border-surface-200">
            <CartLineItem
              v-for="line in lines"
              :key="line.sku"
              :line="line"
              :issue="issuesBySku.get(line.sku)"
              @update-quantity="updateQuantity"
              @remove="removeItem"
            />
          </ul>
        </section>
      </div>

      <aside class="flex flex-col gap-4 rounded-lg border border-surface-200 p-6">
        <h2 class="text-lg font-semibold">Order summary</h2>
        <Message v-if="formError" severity="error">{{ formError }}</Message>
        <OrderTotals
          v-if="preview"
          :subtotal="preview.subtotal"
          :shipping-fee="preview.shippingFee"
          :total="preview.total"
        />
        <Button
          label="Place order & pay"
          :loading="isPlacing"
          :disabled="!canPlaceOrder"
          fluid
          @click="placeOrder"
        />
        <p v-if="!isLoading && blockedReason" class="text-center text-sm text-surface-600" role="status">
          {{ blockedReason }}
        </p>
        <p class="text-center text-xs text-surface-500">
          You'll be taken to our payment partner. Your items are held while you pay.
        </p>
      </aside>
    </div>
  </section>
</template>
