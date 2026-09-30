<script setup>
import { ref, watch } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'

import { useFieldValidation } from '@/composables/useFieldValidation.js'
import { useProfileStore } from '@/stores/profile.js'
import { successToast } from '@/utils/toastService.js'
import { nameSchema } from '@/validation/authSchemas.js'

const props = defineProps({
  profile: { type: Object, required: true },
})

const { updateProfileRequest } = useProfileStore()
const { fieldErrors, validateForm, validateFieldOnInput } = useFieldValidation()

const name = ref(props.profile.name)
const formError = ref('')
const isSubmitting = ref(false)

watch(
  () => props.profile.name,
  (savedName) => {
    name.value = savedName
  },
)

const handleSubmit = async () => {
  formError.value = ''
  if (!validateForm({ profileName: { schema: nameSchema, value: name.value } })) return

  isSubmitting.value = true
  try {
    await updateProfileRequest({ name: name.value })
    successToast('Profile updated.')
  } catch (err) {
    formError.value = err.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="flex flex-col gap-5" novalidate @submit.prevent="handleSubmit">
    <h2 class="text-lg font-semibold">Your details</h2>
    <Message v-if="formError" severity="error">{{ formError }}</Message>

    <div class="flex flex-col gap-2">
      <label for="profile-name" class="text-sm font-medium">Full name</label>
      <InputText
        id="profile-name"
        v-model="name"
        autocomplete="name"
        :invalid="Boolean(fieldErrors.profileName)"
        fluid
        @update:model-value="(value) => validateFieldOnInput('profileName', nameSchema, value)"
      />
      <Message v-if="fieldErrors.profileName" severity="error" size="small" variant="simple">
        {{ fieldErrors.profileName }}
      </Message>
    </div>

    <div class="flex flex-col gap-2">
      <label for="profile-email" class="text-sm font-medium">Email</label>
      <InputText id="profile-email" :model-value="profile.email" disabled fluid />
      <small class="text-surface-500">Contact us to change the email on your account.</small>
    </div>

    <Button
      type="submit"
      label="Save details"
      :loading="isSubmitting"
      :disabled="name.trim() === profile.name"
      class="self-start"
    />
  </form>
</template>
