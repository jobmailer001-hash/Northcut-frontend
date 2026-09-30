<script setup>
import { ref, watch } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'

import AddressPicker from '@/components/store/AddressPicker.vue'
import { useOrdersStore } from '@/stores/orders.js'
import { successToast } from '@/utils/toastService.js'

// Changes where an unshipped order goes: a saved address, or a one-off address for this order
// only (never saved to the address book) — the same choices as at checkout.
const visible = defineModel('visible', { type: Boolean, default: false })

const props = defineProps({
  orderNumber: { type: String, required: true },
})

const { changeShippingAddressRequest } = useOrdersStore()

const shippingTarget = ref(null)
const formError = ref('')
const isSaving = ref(false)

watch(visible, (isOpen) => {
  if (isOpen) formError.value = ''
})

const handleSave = async () => {
  formError.value = ''
  isSaving.value = true
  try {
    await changeShippingAddressRequest(props.orderNumber, shippingTarget.value)
    successToast('Shipping address updated.')
    visible.value = false
  } catch (err) {
    // e.g. ORDER_ADDRESS_LOCKED if it shipped in the meantime.
    formError.value = err.message
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <Dialog v-model:visible="visible" header="Change shipping address" modal class="w-full max-w-xl">
    <div class="flex flex-col gap-5">
      <Message v-if="formError" severity="error">{{ formError }}</Message>
      <!-- Mounted per opening, so each time starts from a fresh choice. -->
      <AddressPicker v-if="visible" v-model="shippingTarget" />
      <div class="flex justify-end gap-2">
        <Button label="Cancel" severity="secondary" variant="outlined" @click="visible = false" />
        <Button
          label="Save address"
          :loading="isSaving"
          :disabled="!shippingTarget"
          @click="handleSave"
        />
      </div>
    </div>
  </Dialog>
</template>
