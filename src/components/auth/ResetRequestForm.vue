<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'

import { useFieldValidation } from '@/composables/useFieldValidation.js'
import { useAuthStore } from '@/stores/auth.js'
import { emailSchema } from '@/validation/authSchemas.js'

const props = defineProps({
  initialEmail: { type: String, default: '' },
})
const emit = defineEmits(['requested'])

const { requestPasswordResetRequest } = useAuthStore()
const { fieldErrors, validateForm, validateFieldOnInput } = useFieldValidation()

const email = ref(props.initialEmail)
const formError = ref('')
const isSubmitting = ref(false)

const handleSubmit = async () => {
  formError.value = ''
  if (!validateForm({ resetEmail: { schema: emailSchema, value: email.value } })) return

  isSubmitting.value = true
  try {
    const normalizedEmail = emailSchema.parse(email.value)
    await requestPasswordResetRequest(normalizedEmail)
    emit('requested', normalizedEmail)
  } catch (err) {
    formError.value = err.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="flex flex-col gap-5" novalidate @submit.prevent="handleSubmit">
    <p class="text-sm text-surface-500">
      Enter the email on your account and we'll send you a 6-digit code.
    </p>

    <Message v-if="formError" severity="error">{{ formError }}</Message>

    <div class="flex flex-col gap-2">
      <label for="reset-email" class="text-sm font-medium">Email</label>
      <InputText
        id="reset-email"
        v-model="email"
        type="email"
        autocomplete="email"
        :invalid="Boolean(fieldErrors.resetEmail)"
        fluid
        @update:model-value="(value) => validateFieldOnInput('resetEmail', emailSchema, value)"
      />
      <Message v-if="fieldErrors.resetEmail" severity="error" size="small" variant="simple">
        {{ fieldErrors.resetEmail }}
      </Message>
    </div>

    <Button type="submit" label="Send code" :loading="isSubmitting" fluid />
  </form>
</template>
