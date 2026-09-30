<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Password from 'primevue/password'

import BackLink from '@/components/shared/BackLink.vue'
import { useFieldValidation } from '@/composables/useFieldValidation.js'
import { roleHomeRoute } from '@/constants/roles.js'
import { useAuthStore } from '@/stores/auth.js'
import { getSafeRedirect } from '@/utils/redirect.js'
import { successToast } from '@/utils/toastService.js'
import { emailSchema, nameSchema, passwordSchema } from '@/validation/authSchemas.js'

const route = useRoute()
const router = useRouter()
const { signupRequest } = useAuthStore()
const { fieldErrors, validateForm, validateFieldOnInput, throttleValidate, setFieldResult } =
  useFieldValidation()

const form = reactive({ name: '', email: '', password: '', confirmPassword: '' })
const formError = ref('')
const isSubmitting = ref(false)

const getConfirmPasswordError = () => {
  if (!form.confirmPassword) return 'Please confirm your password.'
  return form.confirmPassword === form.password ? null : 'Passwords do not match.'
}

const handleSubmit = async () => {
  formError.value = ''

  const areFieldsValid = validateForm({
    name: { schema: nameSchema, value: form.name },
    email: { schema: emailSchema, value: form.email },
    password: { schema: passwordSchema, value: form.password },
  })
  const isConfirmValid = setFieldResult('confirmPassword', getConfirmPasswordError())
  if (!areFieldsValid || !isConfirmValid) return

  isSubmitting.value = true
  try {
    const user = await signupRequest({
      name: form.name,
      email: form.email,
      password: form.password,
    })
    successToast(`Welcome to Northcut, ${user.name}.`)
    router.replace(getSafeRedirect(route.query.redirect) ?? roleHomeRoute[user.role])
  } catch (err) {
    formError.value = err.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="rounded-lg border border-surface-200 bg-white p-8">
    <div class="flex flex-col gap-2">
      <BackLink :fallback="{ name: 'landing' }" />
      <h1 class="text-2xl font-semibold">Create an account</h1>
    </div>
    <p class="mt-1 text-sm text-surface-500">Track orders, save addresses and favourites.</p>

    <form class="mt-6 flex flex-col gap-5" novalidate @submit.prevent="handleSubmit">
      <Message v-if="formError" severity="error">{{ formError }}</Message>

      <div class="flex flex-col gap-2">
        <label for="signup-name" class="text-sm font-medium">Full name</label>
        <InputText
          id="signup-name"
          v-model="form.name"
          autocomplete="name"
          :invalid="Boolean(fieldErrors.name)"
          fluid
          @update:model-value="(value) => validateFieldOnInput('name', nameSchema, value)"
        />
        <Message v-if="fieldErrors.name" severity="error" size="small" variant="simple">
          {{ fieldErrors.name }}
        </Message>
      </div>

      <div class="flex flex-col gap-2">
        <label for="signup-email" class="text-sm font-medium">Email</label>
        <InputText
          id="signup-email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          :invalid="Boolean(fieldErrors.email)"
          fluid
          @update:model-value="(value) => validateFieldOnInput('email', emailSchema, value)"
        />
        <Message v-if="fieldErrors.email" severity="error" size="small" variant="simple">
          {{ fieldErrors.email }}
        </Message>
      </div>

      <div class="flex flex-col gap-2">
        <label for="signup-password" class="text-sm font-medium">Password</label>
        <Password
          v-model="form.password"
          input-id="signup-password"
          :input-props="{ autocomplete: 'new-password' }"
          :feedback="false"
          toggle-mask
          :invalid="Boolean(fieldErrors.password)"
          fluid
          @update:model-value="(value) => validateFieldOnInput('password', passwordSchema, value)"
        />
        <Message v-if="fieldErrors.password" severity="error" size="small" variant="simple">
          {{ fieldErrors.password }}
        </Message>
      </div>

      <div class="flex flex-col gap-2">
        <label for="signup-confirm-password" class="text-sm font-medium">Confirm password</label>
        <Password
          v-model="form.confirmPassword"
          input-id="signup-confirm-password"
          :input-props="{ autocomplete: 'new-password' }"
          :feedback="false"
          toggle-mask
          :invalid="Boolean(fieldErrors.confirmPassword)"
          fluid
          @update:model-value="throttleValidate('confirmPassword', getConfirmPasswordError)"
        />
        <Message v-if="fieldErrors.confirmPassword" severity="error" size="small" variant="simple">
          {{ fieldErrors.confirmPassword }}
        </Message>
      </div>

      <Button type="submit" label="Create account" :loading="isSubmitting" fluid />
    </form>

    <p class="mt-6 text-center text-sm text-surface-500">
      Already have an account?
      <RouterLink
        :to="{ name: 'login', query: route.query }"
        class="font-medium text-primary hover:underline"
      >
        Log in
      </RouterLink>
    </p>
  </div>
</template>
