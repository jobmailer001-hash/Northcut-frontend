<script setup>
import { reactive, ref } from 'vue'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Password from 'primevue/password'

import { useFieldValidation } from '@/composables/useFieldValidation.js'
import { useAuthStore } from '@/stores/auth.js'
import { passwordSchema } from '@/validation/authSchemas.js'

const props = defineProps({
  resetToken: { type: String, required: true },
})
const emit = defineEmits(['completed', 'restart'])

const { completePasswordResetRequest } = useAuthStore()
const { fieldErrors, validateForm, validateFieldOnInput, throttleValidate, setFieldResult } =
  useFieldValidation()

const form = reactive({ newPassword: '', confirmNewPassword: '' })
const formError = ref('')
const isTokenExpired = ref(false)
const isSubmitting = ref(false)

const getConfirmPasswordError = () => {
  if (!form.confirmNewPassword) return 'Please confirm your new password.'
  return form.confirmNewPassword === form.newPassword ? null : 'Passwords do not match.'
}

const handleSubmit = async () => {
  formError.value = ''
  const isPasswordValid = validateForm({
    newPassword: { schema: passwordSchema, value: form.newPassword },
  })
  const isConfirmValid = setFieldResult('confirmNewPassword', getConfirmPasswordError())
  if (!isPasswordValid || !isConfirmValid) return

  isSubmitting.value = true
  try {
    await completePasswordResetRequest({ resetToken: props.resetToken, password: form.newPassword })
    emit('completed')
  } catch (err) {
    formError.value = err.message
    isTokenExpired.value = err.code === 'INVALID_RESET_TOKEN'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="flex flex-col gap-5" novalidate @submit.prevent="handleSubmit">
    <p class="text-sm text-surface-500">
      Choose a new password. You'll be logged out of every device.
    </p>

    <Message v-if="formError" severity="error">
      {{ formError }}
      <Button
        v-if="isTokenExpired"
        label="Start again"
        variant="link"
        size="small"
        class="px-1"
        @click="emit('restart')"
      />
    </Message>

    <div class="flex flex-col gap-2">
      <label for="reset-new-password" class="text-sm font-medium">New password</label>
      <Password
        v-model="form.newPassword"
        input-id="reset-new-password"
        :input-props="{ autocomplete: 'new-password' }"
        :feedback="false"
        toggle-mask
        :invalid="Boolean(fieldErrors.newPassword)"
        fluid
        @update:model-value="(value) => validateFieldOnInput('newPassword', passwordSchema, value)"
      />
      <Message v-if="fieldErrors.newPassword" severity="error" size="small" variant="simple">
        {{ fieldErrors.newPassword }}
      </Message>
    </div>

    <div class="flex flex-col gap-2">
      <label for="reset-confirm-password" class="text-sm font-medium">Confirm new password</label>
      <Password
        v-model="form.confirmNewPassword"
        input-id="reset-confirm-password"
        :input-props="{ autocomplete: 'new-password' }"
        :feedback="false"
        toggle-mask
        :invalid="Boolean(fieldErrors.confirmNewPassword)"
        fluid
        @update:model-value="throttleValidate('confirmNewPassword', getConfirmPasswordError)"
      />
      <Message v-if="fieldErrors.confirmNewPassword" severity="error" size="small" variant="simple">
        {{ fieldErrors.confirmNewPassword }}
      </Message>
    </div>

    <Button type="submit" label="Set new password" :loading="isSubmitting" fluid />
  </form>
</template>
