<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Minus, Plus, ShoppingBag } from '@primeicons/vue'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'

import { MAX_QUANTITY_PER_ITEM } from '@/constants/order.js'
import { AvailabilityStatuses } from '@/constants/product.js'
import { useCartStore } from '@/stores/cart.js'
import { errorToast } from '@/utils/toastService.js'

const props = defineProps({
  product: { type: Object, required: true },
})

const router = useRouter()
const { addItem } = useCartStore()

const quantity = ref(1)
const wasJustAdded = ref(false)

const isInStock = computed(() => props.product.availabilityStatus === AvailabilityStatuses.IN_STOCK)
const isPreorder = computed(() => props.product.availabilityStatus === AvailabilityStatuses.PRE_ORDER)
const maxQuantity = computed(() => Math.min(props.product.availableQuantity, MAX_QUANTITY_PER_ITEM))
const canBuy = computed(() => (isInStock.value || isPreorder.value) && maxQuantity.value > 0)

const unavailableLabel = computed(() => (isPreorder.value ? 'Pre-orders full' : 'Sold out'))

// A different product starts fresh.
watch(
  () => props.product.sku,
  () => {
    quantity.value = 1
    wasJustAdded.value = false
  },
)

const addToCart = () => {
  if (!addItem(props.product.sku, quantity.value)) {
    errorToast('Your bag is full. Remove something first.')
    return
  }
  wasJustAdded.value = true
}

const startPreorder = () => {
  router.push({
    name: 'checkout-preorder',
    params: { slug: props.product.slug },
    query: { quantity: quantity.value },
  })
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <template v-if="canBuy">
      <div class="flex flex-wrap items-center gap-3">
        <label for="purchase-quantity" class="sr-only">Quantity</label>
        <InputNumber
          v-model="quantity"
          input-id="purchase-quantity"
          :min="1"
          :max="maxQuantity"
          show-buttons
          button-layout="horizontal"
          :allow-empty="false"
          input-class="w-12 text-center"
        >
          <template #incrementicon><Plus :size="14" /></template>
          <template #decrementicon><Minus :size="14" /></template>
        </InputNumber>
        <Button v-if="isInStock" label="Add to bag" @click="addToCart">
          <template #icon><ShoppingBag :size="16" /></template>
        </Button>
        <Button v-else label="Pre-order now" @click="startPreorder" />
      </div>
      <p v-if="wasJustAdded" class="text-sm text-surface-600" role="status">
        Added to your bag.
        <RouterLink :to="{ name: 'cart' }" class="font-medium text-primary hover:underline">
          View bag
        </RouterLink>
      </p>
    </template>

    <Button v-else :label="unavailableLabel" disabled class="self-start" />
  </div>
</template>
