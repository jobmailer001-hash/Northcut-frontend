<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Plus } from '@primeicons/vue'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useConfirm } from 'primevue/useconfirm'

import AddressDetails from '@/components/store/AddressDetails.vue'
import AddressFormDialog from '@/components/store/AddressFormDialog.vue'
import { MAX_ADDRESSES_PER_USER } from '@/constants/user.js'
import { handleApiError } from '@/error/handleApiError.js'
import { useProfileStore } from '@/stores/profile.js'
import { successToast } from '@/utils/toastService.js'

const confirm = useConfirm()
const profileStore = useProfileStore()
const { addresses } = storeToRefs(profileStore)
const { updateAddressRequest, deleteAddressRequest } = profileStore

const isDialogVisible = ref(false)
const editingAddress = ref(null)
const busyAddressId = ref(null)

const openDialog = (address = null) => {
  editingAddress.value = address
  isDialogVisible.value = true
}

// Row actions sit outside a form, so failures use the default toast handler.
const runAddressAction = async (addressId, action, successMessage) => {
  busyAddressId.value = addressId
  try {
    await action()
    successToast(successMessage)
  } catch (err) {
    handleApiError(err)
  } finally {
    busyAddressId.value = null
  }
}

const makeDefault = (address) =>
  runAddressAction(address.id, () => updateAddressRequest(address.id, { isDefault: true }), 'Default address updated.')

const confirmDelete = (address) => {
  confirm.require({
    header: 'Delete address?',
    message: `Remove "${address.label || address.line1}" from your address book?`,
    acceptProps: { label: 'Delete', severity: 'danger' },
    rejectProps: { label: 'Cancel', severity: 'secondary', variant: 'outlined' },
    accept: () => runAddressAction(address.id, () => deleteAddressRequest(address.id), 'Address deleted.'),
  })
}
</script>

<template>
  <section class="flex flex-col gap-5">
    <div class="flex items-center justify-between gap-4">
      <h2 class="text-lg font-semibold">Addresses</h2>
      <Button
        v-if="addresses.length < MAX_ADDRESSES_PER_USER"
        label="Add address"
        size="small"
        @click="openDialog()"
      >
        <template #icon><Plus :size="14" /></template>
      </Button>
    </div>

    <p v-if="!addresses.length" class="text-surface-500">
      No saved addresses yet. Add one to speed up checkout.
    </p>

    <ul v-else class="grid gap-4 md:grid-cols-2">
      <li
        v-for="address in addresses"
        :key="address.id"
        class="flex flex-col gap-3 rounded-lg border border-surface-200 p-4"
      >
        <!-- Identified by its label; the full address is behind "View details". Addresses saved
             before labels were required show a placeholder until edited (editing requires one). -->
        <div class="flex items-start justify-between gap-2">
          <p class="font-medium">{{ address.label || 'Untitled address' }}</p>
          <Tag v-if="address.isDefault" value="Default" severity="contrast" />
        </div>
        <AddressDetails :address="address" />
        <div class="flex flex-wrap gap-1">
          <Button label="Edit" size="small" variant="text" @click="openDialog(address)" />
          <Button
            v-if="!address.isDefault"
            label="Make default"
            size="small"
            variant="text"
            :loading="busyAddressId === address.id"
            @click="makeDefault(address)"
          />
          <Button
            label="Delete"
            size="small"
            variant="text"
            severity="danger"
            :disabled="busyAddressId === address.id"
            @click="confirmDelete(address)"
          />
        </div>
      </li>
    </ul>

    <AddressFormDialog v-model:visible="isDialogVisible" :address="editingAddress" />
  </section>
</template>
