<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Image as ImageIcon, Minus, Plus, Trash } from '@primeicons/vue'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'

import { MAX_QUANTITY_PER_ITEM, itemIssueMessages } from '@/constants/order.js'
import { ImageWidths, toOptimizedImageUrl } from '@/utils/image.js'
import { formatMoney } from '@/utils/money.js'

// `line` is a /cart/preview line; `issue` is its full issue object (reason + details), if any.
const props = defineProps({
  line: { type: Object, required: true },
  issue: { type: Object, default: null },
  editable: { type: Boolean, default: true },
})
const emit = defineEmits(['update-quantity', 'remove'])

const issueMessage = computed(() => (props.issue ? itemIssueMessages[props.issue.reason](props.issue) : ''))
const canReduceToAvailable = computed(
  () => props.issue?.reason === 'INSUFFICIENT_QUANTITY' && props.issue.availableQuantity > 0,
)
</script>

<template>
  <li class="flex gap-4 py-4">
    <!-- Hidden or missing products have no page to link to. -->
    <component
      :is="line.slug ? RouterLink : 'div'"
      v-bind="line.slug ? { to: { name: 'product-detail', params: { slug: line.slug } } } : {}"
      class="size-20 shrink-0 overflow-hidden rounded bg-surface-100"
    >
      <img
        v-if="line.image"
        :src="toOptimizedImageUrl(line.image, ImageWidths.THUMBNAIL)"
        :alt="line.name ?? line.sku"
        class="size-full object-cover"
      />
      <div v-else class="flex size-full items-center justify-center">
        <ImageIcon :size="20" color="var(--p-surface-400)" />
      </div>
    </component>

    <div class="flex flex-1 flex-col gap-2">
      <div class="flex justify-between gap-4">
        <div>
          <p class="font-medium">{{ line.name ?? 'Unavailable product' }}</p>
          <p class="text-sm text-surface-500">
            {{ line.unitPrice != null ? formatMoney(line.unitPrice) : '' }}
          </p>
        </div>
        <p class="font-medium">{{ line.lineTotal != null && !issue ? formatMoney(line.lineTotal) : '' }}</p>
      </div>

      <div v-if="editable" class="flex items-center gap-2">
        <label :for="`quantity-${line.sku}`" class="sr-only">Quantity for {{ line.name }}</label>
        <InputNumber
          :model-value="line.quantity"
          :input-id="`quantity-${line.sku}`"
          :min="1"
          :max="MAX_QUANTITY_PER_ITEM"
          show-buttons
          button-layout="horizontal"
          :allow-empty="false"
          size="small"
          input-class="w-10 text-center"
          @update:model-value="(value) => emit('update-quantity', line.sku, value)"
        >
          <template #incrementicon><Plus :size="12" /></template>
          <template #decrementicon><Minus :size="12" /></template>
        </InputNumber>
        <Button
          variant="text"
          severity="secondary"
          size="small"
          :aria-label="`Remove ${line.name ?? line.sku}`"
          @click="emit('remove', line.sku)"
        >
          <template #icon><Trash :size="14" /></template>
        </Button>
      </div>
      <p v-else class="text-sm text-surface-500">Qty {{ line.quantity }}</p>

      <Message v-if="issue" severity="warn" size="small">
        {{ issueMessage }}
        <Button
          v-if="editable"
          :label="canReduceToAvailable ? `Reduce to ${issue.availableQuantity}` : 'Remove'"
          variant="link"
          size="small"
          class="px-1"
          @click="
            canReduceToAvailable
              ? emit('update-quantity', line.sku, issue.availableQuantity)
              : emit('remove', line.sku)
          "
        />
      </Message>
    </div>
  </li>
</template>
