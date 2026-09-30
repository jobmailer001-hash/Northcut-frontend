<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'

import { useFieldValidation } from '@/composables/useFieldValidation.js'
import { useProfileStore } from '@/stores/profile.js'
import { successToast } from '@/utils/toastService.js'
import {
  addressLabelSchema,
  addressLine1Schema,
  addressLine2Schema,
  citySchema,
  countrySchema,
  fullNameSchema,
  phoneSchema,
  postalCodeSchema,
  stateSchema,
} from '@/validation/profileSchemas.js'

const DEFAULT_COUNTRY = 'Nigeria'

// Validation keys are prefixed `address` so they can't clash with another form on the same page.
// `savedOnly` fields apply to saved addresses only — a one-off checkout address has no label.
const allFields = [
  { name: 'label', label: 'Label (e.g. Home, Work)', schema: addressLabelSchema, wide: true, savedOnly: true },
  { name: 'fullName', label: 'Full name', schema: fullNameSchema, autocomplete: 'name' },
  { name: 'phone', label: 'Phone', schema: phoneSchema, autocomplete: 'tel', type: 'tel' },
  { name: 'line1', label: 'Address line 1', schema: addressLine1Schema, autocomplete: 'address-line1', wide: true },
  { name: 'line2', label: 'Address line 2 (optional)', schema: addressLine2Schema, autocomplete: 'address-line2', wide: true },
  { name: 'city', label: 'City', schema: citySchema, autocomplete: 'address-level2' },
  { name: 'state', label: 'State', schema: stateSchema, autocomplete: 'address-level1' },
  { name: 'country', label: 'Country', schema: countrySchema, autocomplete: 'country-name' },
  { name: 'postalCode', label: 'Postal code (optional)', schema: postalCodeSchema, autocomplete: 'postal-code' },
].map((field) => ({ ...field, key: `address${field.name[0].toUpperCase()}${field.name.slice(1)}` }))

const visible = defineModel('visible', { type: Boolean, default: false })

// Saved mode (default): with `address`, edits it; without, adds one to the address book.
// `oneOff` mode (checkout / order): nothing is saved — `saved` emits the address for this order only.
const props = defineProps({
  address: { type: Object, default: null },
  oneOff: { type: Boolean, default: false },
})
const emit = defineEmits(['saved'])

const profileStore = useProfileStore()
const { addresses } = storeToRefs(profileStore)
const { addAddressRequest, updateAddressRequest } = profileStore
const { fieldErrors, validateForm, validateFieldOnInput, setFieldResult } = useFieldValidation()

const fields = computed(() => allFields.filter((field) => !(props.oneOff && field.savedOnly)))

const form = reactive({})
const makeDefault = ref(false)
const formError = ref('')
const isSubmitting = ref(false)

const isEditing = computed(() => Boolean(props.address))

const title = computed(() => {
  if (props.oneOff) return 'Address for this order'
  return isEditing.value ? 'Edit address' : 'Add address'
})

// Reset from the address (or blank) each time it opens, clearing last time's errors.
watch(visible, (isOpen) => {
  if (!isOpen) return
  fields.value.forEach(({ name, key }) => {
    form[name] = props.address?.[name] ?? (name === 'country' ? DEFAULT_COUNTRY : '')
    delete fieldErrors[key]
  })
  makeDefault.value = false
  formError.value = ''
})

// Labels identify saved addresses, so another saved address may not share one (case-insensitive).
// The backend enforces this too; checking here gives the error on the field itself.
const getLabelTakenError = () => {
  const label = form.label.trim().toLowerCase()
  const isTaken = addresses.value.some(
    (address) => address.id !== props.address?.id && address.label?.trim().toLowerCase() === label,
  )
  return isTaken ? `You already have an address labelled "${form.label.trim()}".` : null
}

const validate = () => {
  const areFieldsValid = validateForm(
    Object.fromEntries(fields.value.map(({ name, key, schema }) => [key, { schema, value: form[name] }])),
  )
  if (props.oneOff || fieldErrors.addressLabel) return areFieldsValid
  return setFieldResult('addressLabel', getLabelTakenError()) && areFieldsValid
}

const buildAddress = () => Object.fromEntries(fields.value.map(({ name }) => [name, form[name]]))

const handleSubmit = async () => {
  formError.value = ''
  if (!validate()) return

  if (props.oneOff) {
    emit('saved', buildAddress())
    visible.value = false
    return
  }

  // Every field is sent (optional ones may be ''), so clearing one on edit actually clears it.
  const payload = { ...buildAddress(), ...(makeDefault.value && { isDefault: true }) }

  isSubmitting.value = true
  try {
    const savedAddress = isEditing.value
      ? await updateAddressRequest(props.address.id, payload)
      : await addAddressRequest(payload)
    successToast(isEditing.value ? 'Address updated.' : 'Address saved.')
    emit('saved', savedAddress)
    visible.value = false
  } catch (err) {
    formError.value = err.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Dialog v-model:visible="visible" :header="title" modal class="w-full max-w-2xl">
    <form class="flex flex-col gap-5" novalidate @submit.prevent="handleSubmit">
      <Message v-if="formError" severity="error">{{ formError }}</Message>
      <Message v-if="oneOff" severity="secondary" variant="simple" size="small">
        This address is used for this order only — it won't be saved to your address book.
      </Message>

      <div class="grid gap-4 sm:grid-cols-2">
        <div
          v-for="field in fields"
          :key="field.name"
          class="flex flex-col gap-2"
          :class="{ 'sm:col-span-2': field.wide }"
        >
          <label :for="`address-${field.name}`" class="text-sm font-medium">{{ field.label }}</label>
          <InputText
            :id="`address-${field.name}`"
            v-model="form[field.name]"
            :type="field.type ?? 'text'"
            :autocomplete="field.autocomplete"
            :invalid="Boolean(fieldErrors[field.key])"
            fluid
            @update:model-value="(value) => validateFieldOnInput(field.key, field.schema, value)"
          />
          <Message v-if="fieldErrors[field.key]" severity="error" size="small" variant="simple">
            {{ fieldErrors[field.key] }}
          </Message>
        </div>
      </div>

      <div v-if="!oneOff && !address?.isDefault" class="flex items-center gap-2">
        <Checkbox v-model="makeDefault" input-id="address-make-default" binary />
        <label for="address-make-default" class="text-sm">Make this my default address</label>
      </div>

      <div class="flex justify-end gap-2">
        <Button label="Cancel" severity="secondary" variant="outlined" @click="visible = false" />
        <Button
          type="submit"
          :label="oneOff ? 'Use this address' : isEditing ? 'Save address' : 'Add address'"
          :loading="isSubmitting"
        />
      </div>
    </form>
  </Dialog>
</template>
