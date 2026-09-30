<script setup>
import { computed, ref, watch } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'

import { useFieldValidation } from '@/composables/useFieldValidation.js'
import { useAdminProductsStore } from '@/stores/admin/products.js'
import { successToast } from '@/utils/toastService.js'
import { stockAdjustmentSchema, stockReasonSchema } from '@/validation/productSchemas.js'

const visible = defineModel('visible', { type: Boolean, default: false })

const props = defineProps({
  product: { type: Object, required: true },
})

const { adjustStockRequest } = useAdminProductsStore()
const { fieldErrors, validateForm, validateFieldOnInput } = useFieldValidation()

const adjustment = ref(null)
const reason = ref('')
const formError = ref('')
const isSubmitting = ref(false)

const resultingStock = computed(() => props.product.stock + (adjustment.value ?? 0))

// Start clean each time it opens, so last time's input/errors don't flash.
watch(visible, (isOpen) => {
  if (!isOpen) return
  adjustment.value = null
  reason.value = ''
  formError.value = ''
  delete fieldErrors.stockAdjustment
  delete fieldErrors.stockReason
})

const handleSubmit = async () => {
  formError.value = ''
  const isValid = validateForm({
    stockAdjustment: { schema: stockAdjustmentSchema, value: adjustment.value },
    stockReason: { schema: stockReasonSchema, value: reason.value },
  })
  if (!isValid) return

  isSubmitting.value = true
  try {
    await adjustStockRequest(props.product.id, {
      adjustment: adjustment.value,
      reason: reason.value || undefined,
    })
    successToast('Stock updated.')
    visible.value = false
  } catch (err) {
    formError.value = err.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Dialog v-model:visible="visible" header="Adjust stock" modal class="w-full max-w-md">
    <form class="flex flex-col gap-5" novalidate @submit.prevent="handleSubmit">
      <Message v-if="formError" severity="error">{{ formError }}</Message>

      <dl class="grid grid-cols-3 gap-2 rounded-md bg-surface-50 p-3 text-center text-sm">
        <div>
          <dt class="text-surface-500">In stock</dt>
          <dd class="font-semibold">{{ product.stock }}</dd>
        </div>
        <div>
          <dt class="text-surface-500">Reserved</dt>
          <dd class="font-semibold">{{ product.reserved }}</dd>
        </div>
        <div>
          <dt class="text-surface-500">After change</dt>
          <dd class="font-semibold" :class="{ 'text-red-600': resultingStock < product.reserved }">
            {{ resultingStock }}
          </dd>
        </div>
      </dl>

      <div class="flex flex-col gap-2">
        <label for="stock-adjustment" class="text-sm font-medium">Adjustment</label>
        <InputNumber
          v-model="adjustment"
          input-id="stock-adjustment"
          show-buttons
          :invalid="Boolean(fieldErrors.stockAdjustment)"
          fluid
          @update:model-value="(value) => validateFieldOnInput('stockAdjustment', stockAdjustmentSchema, value)"
        />
        <Message v-if="fieldErrors.stockAdjustment" severity="error" size="small" variant="simple">
          {{ fieldErrors.stockAdjustment }}
        </Message>
        <small v-else class="text-surface-500">Positive to add (e.g. 20), negative to remove (e.g. -2).</small>
      </div>

      <div class="flex flex-col gap-2">
        <label for="stock-reason" class="text-sm font-medium">Reason (optional)</label>
        <InputText
          id="stock-reason"
          v-model="reason"
          placeholder="e.g. Restock from supplier"
          :invalid="Boolean(fieldErrors.stockReason)"
          fluid
          @update:model-value="(value) => validateFieldOnInput('stockReason', stockReasonSchema, value)"
        />
        <Message v-if="fieldErrors.stockReason" severity="error" size="small" variant="simple">
          {{ fieldErrors.stockReason }}
        </Message>
      </div>

      <div class="flex justify-end gap-2">
        <Button label="Cancel" severity="secondary" variant="outlined" @click="visible = false" />
        <Button type="submit" label="Update stock" :loading="isSubmitting" />
      </div>
    </form>
  </Dialog>
</template>
