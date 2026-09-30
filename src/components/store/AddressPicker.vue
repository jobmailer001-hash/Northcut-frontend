<script setup>
import { onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import { Plus } from '@primeicons/vue'
import Button from 'primevue/button'
import RadioButton from 'primevue/radiobutton'
import Skeleton from 'primevue/skeleton'
import Tag from 'primevue/tag'

import AddressDetails from '@/components/store/AddressDetails.vue'
import AddressFormDialog from '@/components/store/AddressFormDialog.vue'
import { handleApiError } from '@/error/handleApiError.js'
import { useProfileStore } from '@/stores/profile.js'

// v-model is where to ship: `{ shippingAddressId }` for a saved address, `{ shippingAddress }` for a
// one-off address used only for this order (never saved to the address book), or null until chosen.
const shippingTarget = defineModel({ type: Object, default: null })

// Radio value of the one-off address; saved addresses use their id.
const ONE_OFF = 'one-off'

const profileStore = useProfileStore()
const { addresses, defaultAddress } = storeToRefs(profileStore)
const { fetchAddressesRequest } = profileStore

const isLoading = ref(true)
const isDialogVisible = ref(false)
const selectedKey = ref(null)
const oneOffAddress = ref(null)

// Keep v-model in step with whichever option is selected.
watch([selectedKey, oneOffAddress], () => {
  if (selectedKey.value === ONE_OFF) {
    shippingTarget.value = oneOffAddress.value ? { shippingAddress: oneOffAddress.value } : null
  } else {
    shippingTarget.value = selectedKey.value ? { shippingAddressId: selectedKey.value } : null
  }
})

const useOneOffAddress = (address) => {
  oneOffAddress.value = address
  selectedKey.value = ONE_OFF
}

// Falls back to the default saved address, if there is one.
const removeOneOffAddress = () => {
  oneOffAddress.value = null
  selectedKey.value = defaultAddress.value?.id ?? addresses.value[0]?.id ?? null
}

onMounted(async () => {
  try {
    await fetchAddressesRequest()
    selectedKey.value ??= defaultAddress.value?.id ?? null
  } catch (err) {
    handleApiError(err)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section class="flex flex-col gap-4">
    <div class="flex items-center justify-between gap-4">
      <h2 class="text-lg font-semibold">Shipping address</h2>
      <Button
        :label="oneOffAddress ? 'Edit new address' : 'Add address'"
        size="small"
        variant="text"
        @click="isDialogVisible = true"
      >
        <template #icon><Plus :size="14" /></template>
      </Button>
    </div>

    <Skeleton v-if="isLoading" height="6rem" />

    <template v-else>
      <p v-if="!addresses.length && !oneOffAddress" class="text-surface-500">
        You have no saved addresses. Add an address for this order, or save addresses in your account.
      </p>

      <ul v-else class="flex flex-col gap-3" role="radiogroup" aria-label="Shipping address">
        <li v-for="address in addresses" :key="address.id">
          <label
            class="flex cursor-pointer gap-3 rounded-lg border p-4"
            :class="selectedKey === address.id ? 'border-primary bg-primary-50' : 'border-surface-200'"
          >
            <RadioButton v-model="selectedKey" :value="address.id" :input-id="`address-${address.id}`" />
            <span class="flex flex-col gap-1 text-sm">
              <span class="flex items-center gap-2 font-medium">
                {{ address.label || 'Untitled address' }}
                <Tag v-if="address.isDefault" value="Default" severity="contrast" />
              </span>
              <AddressDetails :address="address" />
            </span>
          </label>
        </li>

        <li v-if="oneOffAddress">
          <label
            class="flex cursor-pointer gap-3 rounded-lg border p-4"
            :class="selectedKey === ONE_OFF ? 'border-primary bg-primary-50' : 'border-surface-200'"
          >
            <RadioButton v-model="selectedKey" :value="ONE_OFF" input-id="address-one-off" />
            <span class="flex flex-1 flex-col gap-1 text-sm">
              <span class="flex items-center gap-2 font-medium">
                New address
                <Tag value="This order only" severity="secondary" />
              </span>
              <AddressDetails :address="oneOffAddress" />
            </span>
            <Button
              label="Remove"
              size="small"
              variant="text"
              severity="secondary"
              class="self-start"
              @click.stop.prevent="removeOneOffAddress"
            />
          </label>
        </li>
      </ul>

      <RouterLink
        :to="{ name: 'profile', query: { tab: 'addresses' } }"
        class="w-fit text-sm text-surface-500 hover:text-surface-900 hover:underline"
      >
        Manage saved addresses
      </RouterLink>
    </template>

    <AddressFormDialog
      v-model:visible="isDialogVisible"
      :address="oneOffAddress"
      one-off
      @saved="useOneOffAddress"
    />
  </section>
</template>
