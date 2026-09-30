<script setup>
import { formatMoney } from '@/utils/money.js'

// Amounts in kobo. `shippingFee: null` means it's worked out when the order is placed.
defineProps({
  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: null },
  total: { type: Number, default: null },
})
</script>

<template>
  <dl class="flex flex-col gap-2 text-sm">
    <div class="flex justify-between">
      <dt class="text-surface-600">Subtotal</dt>
      <dd>{{ formatMoney(subtotal) }}</dd>
    </div>
    <div class="flex justify-between">
      <dt class="text-surface-600">Shipping</dt>
      <dd>{{ shippingFee == null ? 'Added at checkout' : shippingFee ? formatMoney(shippingFee) : 'Free' }}</dd>
    </div>
    <div class="flex justify-between border-t border-surface-200 pt-2 text-base font-semibold">
      <dt>Total</dt>
      <dd>{{ formatMoney(total ?? subtotal) }}</dd>
    </div>
  </dl>
</template>
