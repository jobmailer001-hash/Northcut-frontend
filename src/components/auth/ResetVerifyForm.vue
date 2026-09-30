<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import InputOtp from 'primevue/inputotp'
import Message from 'primevue/message'

import { useFieldValidation } from '@/composables/useFieldValidation.js'
import { handleApiError } from '@/error/handleApiError.js'
import { useAuthStore } from '@/stores/auth.js'
import { successToast } from '@/utils/toastService.js'
import { resetCodeSchema } from '@/validation/authSchemas.js'

const props = defineProps({
  email: { type: String, required: true },
})
const emit = defineEmits(['verified', 'change-email'])

const { verifyPasswordResetCodeRequest, requestPasswordResetRequest } = useAuthStore()
const { fieldErrors, validateForm, validateFieldOnInput } = useFieldValidation()

const code = ref('')
const formError = ref('')
const isSubmitting = ref(false)
const isResending = ref(false)

const handleSubmit = async () => {
  formError.value = ''
  if (!validateForm({ resetCode: { schema: resetCodeSchema, value: code.value } })) return

  isSubmitting.value = true
  try {
    const resetToken = await verifyPasswordResetCodeRequest({ email: props.email, code: code.value })
    emit('verified', resetToken)
  } catch (err) {
    formError.value = err.message
  } finally {
    isSubmitting.value = false
  }
}

// Outside the form's submit flow, so failures use the default toast handler.
const resendCode = async () => {
  isResending.value = true
  try {
    await requestPasswordResetRequest(props.email)
    code.value = ''
    formError.value = ''
    successToast('A new code is on its way.')
  } catch (err) {
    handleApiError(err)
  } finally {
    isResending.value = false
  }
}
</script>

<template>
  <form class="flex flex-col gap-5" novalidate @submit.prevent="handleSubmit">
    <p class="text-sm text-surface-500">
      If an account exists for <span class="font-medium text-surface-900">{{ email }}</span>,
      we've sent it a 6-digit code. It expires in a few minutes.
    </p>

    <Message v-if="formError" severity="error">{{ formError }}</Message>

    <div class="flex flex-col gap-2">
      <label for="reset-code" class="text-sm font-medium">Code</label>
      <InputOtp
        id="reset-code"
        v-model="code"
        :length="6"
        integer-only
        :invalid="Boolean(fieldErrors.resetCode)"
        @update:model-value="(value) => validateFieldOnInput('resetCode', resetCodeSchema, value)"
      />
      <Message v-if="fieldErrors.resetCode" severity="error" size="small" variant="simple">
        {{ fieldErrors.resetCode }}
      </Message>
    </div>

    <Button type="submit" label="Verify code" :loading="isSubmitting" fluid />

    <div class="flex items-center justify-between text-sm">
      <Button
        label="Use a different email"
        variant="link"
        size="small"
        class="px-0"
        @click="emit('change-email')"
      />
      <Button
        label="Resend code"
        variant="link"
        size="small"
        class="px-0"
        :loading="isResending"
        @click="resendCode"
      />
    </div>
  </form>
</template>
