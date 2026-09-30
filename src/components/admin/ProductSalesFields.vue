<script setup>
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import Select from 'primevue/select'

import { availabilityOptions, publicityOptions } from '@/constants/product.js'

const form = defineModel('form', { type: Object, required: true })

defineProps({
  fieldErrors: { type: Object, required: true },
  isEditing: { type: Boolean, default: false },
})
const emit = defineEmits(['field-input'])

const nairaInputProps = { mode: 'currency', currency: 'NGN', locale: 'en-NG' }
</script>

<template>
  <div class="grid gap-5 md:grid-cols-2">
    <div class="flex flex-col gap-2">
      <label for="product-launch-price" class="text-sm font-medium">Launch price</label>
      <InputNumber
        v-model="form.launchPrice"
        input-id="product-launch-price"
        v-bind="nairaInputProps"
        :invalid="Boolean(fieldErrors.launchPrice)"
        fluid
        @update:model-value="(value) => emit('field-input', 'launchPrice', value)"
      />
      <Message v-if="fieldErrors.launchPrice" severity="error" size="small" variant="simple">
        {{ fieldErrors.launchPrice }}
      </Message>
    </div>

    <div class="flex flex-col gap-2">
      <label for="product-preorder-price" class="text-sm font-medium">Pre-order price</label>
      <InputNumber
        v-model="form.preorderPrice"
        input-id="product-preorder-price"
        v-bind="nairaInputProps"
        :invalid="Boolean(fieldErrors.preorderPrice)"
        fluid
        @update:model-value="(value) => emit('field-input', 'preorderPrice', value)"
      />
      <Message v-if="fieldErrors.preorderPrice" severity="error" size="small" variant="simple">
        {{ fieldErrors.preorderPrice }}
      </Message>
      <small v-else class="text-surface-500">Required while the product is on pre-order.</small>
    </div>

    <div class="flex flex-col gap-2">
      <label for="product-availability" class="text-sm font-medium">Availability</label>
      <Select
        v-model="form.availabilityStatus"
        input-id="product-availability"
        :options="availabilityOptions"
        option-label="label"
        option-value="value"
        fluid
        @update:model-value="(value) => emit('field-input', 'availabilityStatus', value)"
      />
    </div>

    <!-- When editing, visibility has its own toggle in the Status section. -->
    <div v-if="!isEditing" class="flex flex-col gap-2">
      <label for="product-publicity" class="text-sm font-medium">Visibility</label>
      <Select
        v-model="form.publicityStatus"
        input-id="product-publicity"
        :options="publicityOptions"
        option-label="label"
        option-value="value"
        fluid
      />
      <small class="text-surface-500">Hidden products don't appear in the store.</small>
    </div>

    <div v-if="!isEditing" class="flex flex-col gap-2">
      <label for="product-stock" class="text-sm font-medium">Initial stock</label>
      <InputNumber
        v-model="form.stock"
        input-id="product-stock"
        :min="0"
        :invalid="Boolean(fieldErrors.stock)"
        fluid
        @update:model-value="(value) => emit('field-input', 'stock', value)"
      />
      <Message v-if="fieldErrors.stock" severity="error" size="small" variant="simple">
        {{ fieldErrors.stock }}
      </Message>
    </div>

    <div class="flex flex-col gap-2">
      <label for="product-preorder-limit" class="text-sm font-medium">Pre-order limit</label>
      <InputNumber
        v-model="form.preorderLimit"
        input-id="product-preorder-limit"
        :min="0"
        :invalid="Boolean(fieldErrors.preorderLimit)"
        fluid
        @update:model-value="(value) => emit('field-input', 'preorderLimit', value)"
      />
      <Message v-if="fieldErrors.preorderLimit" severity="error" size="small" variant="simple">
        {{ fieldErrors.preorderLimit }}
      </Message>
      <small v-else class="text-surface-500">Most units that can be pre-ordered in total.</small>
    </div>
  </div>
</template>
