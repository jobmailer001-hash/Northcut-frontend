<script setup>
import { reactive, ref } from 'vue'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Password from 'primevue/password'

import { useFieldValidation } from '@/composables/useFieldValidation.js'
import { useAuthStore } from '@/stores/auth.js'
import { successToast } from '@/utils/toastService.js'
import { passwordSchema } from '@/validation/authSchemas.js'
import { currentPasswordSchema } from '@/validation/profileSchemas.js'

const { changePasswordRequest } = useAuthStore()
const { fieldErrors, validateForm, validateFieldOnInput, throttleValidate, setFieldResult } =
  useFieldValidation()

const emptyForm = () => ({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
const form = reactive(emptyForm())
const formError = ref('')
const isSubmitting = ref(false)

const getConfirmPasswordError = () => {
  if (!form.confirmNewPassword) return 'Please confirm your new password.'
  return form.confirmNewPassword === form.newPassword ? null : 'Passwords do not match.'
}

const handleSubmit = async () => {
  formError.value = ''
  const areFieldsValid = validateForm({
    currentPassword: { schema: currentPasswordSchema, value: form.currentPassword },
    newPassword: { schema: passwordSchema, value: form.newPassword },
  })
  const isConfirmValid = setFieldResult('confirmNewPassword', getConfirmPasswordError())
  if (!areFieldsValid || !isConfirmValid) return

  isSubmitting.value = true
  try {
    await changePasswordRequest({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    })
    Object.assign(form, emptyForm())
    successToast('Password changed. Other devices have been logged out.')
  } catch (err) {
    formError.value = err.message
  } finally {
    isSubmitting.value = false
  }
}

const passwordFields = [
  { name: 'currentPassword', label: 'Current password', autocomplete: 'current-password' },
  { name: 'newPassword', label: 'New password', autocomplete: 'new-password' },
  { name: 'confirmNewPassword', label: 'Confirm new password', autocomplete: 'new-password' },
]

const handleInput = (name, value) => {
  if (name === 'confirmNewPassword') throttleValidate(name, getConfirmPasswordError)
  else validateFieldOnInput(name, name === 'newPassword' ? passwordSchema : currentPasswordSchema, value)
}
</script>

<template>
  <form class="flex flex-col gap-5" novalidate @submit.prevent="handleSubmit">
    <div>
      <h2 class="text-lg font-semibold">Change password</h2>
      <p class="text-sm text-surface-500">You'll stay logged in here; other devices will be logged out.</p>
    </div>
    <Message v-if="formError" severity="error">{{ formError }}</Message>

    <div v-for="field in passwordFields" :key="field.name" class="flex flex-col gap-2">
      <label :for="`change-${field.name}`" class="text-sm font-medium">{{ field.label }}</label>
      <Password
        v-model="form[field.name]"
        :input-id="`change-${field.name}`"
        :input-props="{ autocomplete: field.autocomplete }"
        :feedback="false"
        toggle-mask
        :invalid="Boolean(fieldErrors[field.name])"
        fluid
        @update:model-value="(value) => handleInput(field.name, value)"
      />
      <Message v-if="fieldErrors[field.name]" severity="error" size="small" variant="simple">
        {{ fieldErrors[field.name] }}
      </Message>
    </div>

    <Button type="submit" label="Change password" :loading="isSubmitting" class="self-start" />
  </form>
</template>
