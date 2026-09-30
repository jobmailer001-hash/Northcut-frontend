<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'

import BackLink from '@/components/shared/BackLink.vue'
import AddressPicker from '@/components/store/AddressPicker.vue'
import CartLineItem from '@/components/store/CartLineItem.vue'
import OrderTotals from '@/components/store/OrderTotals.vue'
import { MAX_QUANTITY_PER_ITEM } from '@/constants/order.js'
import { AvailabilityStatuses } from '@/constants/product.js'
import { usePayment } from '@/composables/usePayment.js'
import { ApiError } from '@/error/errors.js'
import { useOrdersStore } from '@/stores/orders.js'
import { useProductsStore } from '@/stores/products.js'
import { calculateLineTotal } from '@/utils/money.js'

const route = useRoute()
const router = useRouter()
const productsStore = useProductsStore()
const { product } = storeToRefs(productsStore)
const { fetchProductRequest } = productsStore
const { placePreorderRequest } = useOrdersStore()
const { continueToPayment } = usePayment()

const quantity = ref(1)
// Saved address `{ shippingAddressId }` or one-off `{ shippingAddress }` — see AddressPicker.
const shippingTarget = ref(null)
const loadError = ref('')
const formError = ref('')
const isLoading = ref(true)
const isPlacing = ref(false)

const isTakingPreorders = computed(
  () =>
    product.value?.availabilityStatus === AvailabilityStatuses.PRE_ORDER &&
    product.value.availableQuantity > 0,
)
const maxQuantity = computed(() => Math.min(product.value?.availableQuantity ?? 0, MAX_QUANTITY_PER_ITEM))

// Same shape as a cart-preview line, so it renders with CartLineItem.
const line = computed(() => ({
  sku: product.value.sku,
  quantity: quantity.value,
  name: product.value.name,
  slug: product.value.slug,
  image: product.value.images[0]?.url ?? null,
  unitPrice: product.value.price,
  lineTotal: calculateLineTotal(product.value.price, quantity.value),
}))

const clampQuantity = (value) => Math.max(1, Math.min(Number(value) || 1, maxQuantity.value || 1))

const loadProduct = async (slug) => {
  isLoading.value = true
  loadError.value = ''
  try {
    await fetchProductRequest(slug)
    quantity.value = clampQuantity(route.query.quantity)
  } catch (err) {
    loadError.value = err.message
  } finally {
    isLoading.value = false
  }
}

const placePreorder = async () => {
  formError.value = ''
  isPlacing.value = true
  try {
    const placed = await placePreorderRequest({
      sku: product.value.sku,
      quantity: quantity.value,
      shippingTarget: shippingTarget.value,
    })
    continueToPayment(placed)
  } catch (err) {
    formError.value = err.message
    // Fewer spots than asked for: offer what's left.
    const spotsLeft = err instanceof ApiError ? err.details?.availableQuantity : undefined
    if (spotsLeft > 0) quantity.value = spotsLeft
  } finally {
    isPlacing.value = false
  }
}

watch(() => route.params.slug, loadProduct, { immediate: true })
</script>

<template>
  <section class="flex flex-col gap-8">
    <div class="flex flex-col gap-2">
      <BackLink :fallback="{ name: 'product-detail', params: { slug: route.params.slug } }" />
      <h1 class="text-3xl font-semibold">Pre-order checkout</h1>
    </div>

    <Message v-if="loadError" severity="error">{{ loadError }}</Message>

    <div v-else-if="isLoading || !product" class="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <Skeleton height="12rem" />
      <Skeleton height="10rem" />
    </div>

    <Message v-else-if="!isTakingPreorders" severity="warn">
      {{ product.name }} isn't taking pre-orders right now.
      <RouterLink :to="{ name: 'product-detail', params: { slug: product.slug } }" class="font-medium underline">
        Back to the product
      </RouterLink>
    </Message>

    <div v-else class="grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
      <div class="flex flex-col gap-8">
        <AddressPicker v-model="shippingTarget" />
        <section class="flex flex-col gap-2">
          <h2 class="text-lg font-semibold">Pre-order</h2>
          <ul class="border-y border-surface-200">
            <CartLineItem
              :line="line"
              @update-quantity="(sku, value) => (quantity = clampQuantity(value))"
              @remove="router.push({ name: 'product-detail', params: { slug: product.slug } })"
            />
          </ul>
          <p class="text-sm text-surface-500">
            {{ product.availableQuantity }} spot(s) left. Ships when the product launches.
          </p>
        </section>
      </div>

      <aside class="flex flex-col gap-4 rounded-lg border border-surface-200 p-6">
        <h2 class="text-lg font-semibold">Order summary</h2>
        <Message v-if="formError" severity="error">{{ formError }}</Message>
        <OrderTotals :subtotal="line.lineTotal" />
        <Button
          label="Place pre-order & pay"
          :loading="isPlacing"
          :disabled="!shippingTarget"
          fluid
          @click="placePreorder"
        />
        <p v-if="!shippingTarget" class="text-center text-sm text-surface-600" role="status">
          Choose or add a shipping address to continue.
        </p>
      </aside>
    </div>
  </section>
</template>
