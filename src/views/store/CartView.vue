<script setup>
import { RouterLink, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'

import BackLink from '@/components/shared/BackLink.vue'
import CartLineItem from '@/components/store/CartLineItem.vue'
import OrderTotals from '@/components/store/OrderTotals.vue'
import { useCartPreview } from '@/composables/useCartPreview.js'

const router = useRouter()

const { items, lines, preview, hasIssues, issuesBySku, isLoading, updateQuantity, removeItem } =
  useCartPreview()
</script>

<template>
  <section class="flex flex-col gap-8">
    <div class="flex flex-col gap-2">
      <BackLink :fallback="{ name: 'products' }" />
      <h1 class="text-3xl font-semibold">Your cart</h1>
    </div>

    <div v-if="!items.length" class="flex flex-col items-center gap-4 py-16 text-center">
      <p class="text-surface-500">Your cart is empty.</p>
      <Button as="router-link" :to="{ name: 'products' }" label="Browse the shop" />
    </div>

    <div v-else-if="isLoading && !preview" class="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <Skeleton height="12rem" />
      <Skeleton height="10rem" />
    </div>

    <div v-else class="grid items-start gap-8 lg:grid-cols-[1fr_20rem]">
      <div class="flex flex-col gap-4">
        <Message v-if="hasIssues" severity="warn">
          Some items need attention before you can check out.
        </Message>
        <ul class="divide-y divide-surface-200 border-y border-surface-200">
          <CartLineItem
            v-for="line in lines"
            :key="line.sku"
            :line="line"
            :issue="issuesBySku.get(line.sku)"
            @update-quantity="updateQuantity"
            @remove="removeItem"
          />
        </ul>
        <RouterLink :to="{ name: 'products' }" class="text-sm font-medium hover:underline">
          ← Continue shopping
        </RouterLink>
      </div>

      <aside class="flex flex-col gap-4 rounded-lg border border-surface-200 p-6">
        <h2 class="text-lg font-semibold">Summary</h2>
        <OrderTotals
          :subtotal="preview.subtotal"
          :shipping-fee="preview.shippingFee"
          :total="preview.total"
        />
        <!-- A real button (not a link) so `disabled` actually blocks navigation. -->
        <Button
          label="Checkout"
          :disabled="hasIssues || isLoading"
          fluid
          @click="router.push({ name: 'checkout' })"
        />
        <p v-if="hasIssues" class="text-center text-xs text-surface-500">
          Fix the highlighted items to continue.
        </p>
      </aside>
    </div>
  </section>
</template>
