<script setup>
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import Textarea from 'primevue/textarea'
import { useConfirm } from 'primevue/useconfirm'

import { OrderStatuses, OrderTypes } from '@/constants/order.js'
import { handleApiError } from '@/error/handleApiError.js'
import { useAdminOrdersStore } from '@/stores/admin/orders.js'
import { successToast } from '@/utils/toastService.js'

const props = defineProps({
  order: { type: Object, required: true },
})

const confirm = useConfirm()
const { updateOrderStatusRequest, cancelAdminOrderRequest } = useAdminOrdersStore()

const busyAction = ref(null)
const isCancelDialogVisible = ref(false)
const cancelReason = ref('')
const cancelFormError = ref('')

const isHeld = computed(() => props.order.reservationStatus === 'HELD')
const canShip = computed(() => props.order.status === OrderStatuses.PAID && isHeld.value)
const isAwaitingPreorderStock = computed(
  () => canShip.value && props.order.type === OrderTypes.PREORDER && props.order.reservedFrom === 'PREORDER',
)
const canDeliver = computed(() => props.order.status === OrderStatuses.SHIPPED)
const canCancel = computed(
  () => isHeld.value && [OrderStatuses.PENDING_PAYMENT, OrderStatuses.PAID].includes(props.order.status),
)

const changeStatus = async (status, successMessage) => {
  busyAction.value = status
  try {
    await updateOrderStatusRequest(props.order.id, status)
    successToast(successMessage)
  } catch (err) {
    handleApiError(err)
  } finally {
    busyAction.value = null
  }
}

const confirmShip = () => {
  confirm.require({
    header: 'Mark as shipped?',
    message: 'The items leave stock now. This can’t be undone.',
    acceptProps: { label: 'Mark shipped' },
    rejectProps: { label: 'Not yet', severity: 'secondary', variant: 'outlined' },
    accept: () => changeStatus(OrderStatuses.SHIPPED, 'Order marked as shipped.'),
  })
}

const openCancelDialog = () => {
  cancelReason.value = ''
  cancelFormError.value = ''
  isCancelDialogVisible.value = true
}

// A form inside a dialog: failures show in the dialog, not as a toast.
const submitCancel = async () => {
  cancelFormError.value = ''
  busyAction.value = 'CANCEL'
  try {
    await cancelAdminOrderRequest(props.order.id, cancelReason.value.trim())
    successToast(props.order.paidAt ? 'Order cancelled — refund queued.' : 'Order cancelled.')
    isCancelDialogVisible.value = false
  } catch (err) {
    cancelFormError.value = err.message
  } finally {
    busyAction.value = null
  }
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <Message v-if="isAwaitingPreorderStock" severity="info" size="small">
      Pre-order: switch the product to In stock (with enough stock) before shipping.
    </Message>

    <div class="flex flex-wrap gap-2">
      <Button
        v-if="canShip"
        label="Mark shipped"
        :disabled="isAwaitingPreorderStock"
        :loading="busyAction === OrderStatuses.SHIPPED"
        @click="confirmShip"
      />
      <Button
        v-if="canDeliver"
        label="Mark delivered"
        :loading="busyAction === OrderStatuses.DELIVERED"
        @click="changeStatus(OrderStatuses.DELIVERED, 'Order marked as delivered.')"
      />
      <Button
        v-if="canCancel"
        label="Cancel order"
        severity="danger"
        variant="outlined"
        @click="openCancelDialog"
      />
    </div>

    <Dialog v-model:visible="isCancelDialogVisible" header="Cancel order" modal class="w-full max-w-md">
      <form class="flex flex-col gap-4" novalidate @submit.prevent="submitCancel">
        <Message v-if="cancelFormError" severity="error">{{ cancelFormError }}</Message>
        <p class="text-sm text-surface-600">
          Reserved items go back to stock.
          <strong v-if="order.paidAt">The customer is refunded in full.</strong>
        </p>
        <div class="flex flex-col gap-2">
          <label for="admin-cancel-reason" class="text-sm font-medium">Reason (shown to the customer)</label>
          <Textarea id="admin-cancel-reason" v-model="cancelReason" rows="3" maxlength="300" auto-resize fluid />
        </div>
        <div class="flex justify-end gap-2">
          <Button label="Keep order" severity="secondary" variant="outlined" @click="isCancelDialogVisible = false" />
          <Button type="submit" label="Cancel order" severity="danger" :loading="busyAction === 'CANCEL'" />
        </div>
      </form>
    </Dialog>
  </div>
</template>
