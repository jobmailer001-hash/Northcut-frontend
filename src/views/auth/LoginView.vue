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
import { emailSchema, loginPasswordSchema } from '@/validation/authSchemas.js'

const route = useRoute()
const router = useRouter()
const { loginRequest } = useAuthStore()
const { fieldErrors, validateForm, validateFieldOnInput } = useFieldValidation()

const form = reactive({ email: '', password: '' })
const formError = ref('')
const isSubmitting = ref(false)

const handleSubmit = async () => {
  formError.value = ''

  const isValid = validateForm({
    email: { schema: emailSchema, value: form.email },
    password: { schema: loginPasswordSchema, value: form.password },
  })
  if (!isValid) return

  isSubmitting.value = true
  try {
    const user = await loginRequest({ email: form.email, password: form.password })
    successToast(`Welcome back, ${user.name}.`)
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
      <h1 class="text-2xl font-semibold">Log in</h1>
    </div>
    <p class="mt-1 text-sm text-surface-500">Welcome back to Northcut.</p>

    <form class="mt-6 flex flex-col gap-5" novalidate @submit.prevent="handleSubmit">
      <Message v-if="formError" severity="error">{{ formError }}</Message>

      <div class="flex flex-col gap-2">
        <label for="login-email" class="text-sm font-medium">Email</label>
        <InputText
          id="login-email"
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
        <div class="flex items-center justify-between">
          <label for="login-password" class="text-sm font-medium">Password</label>
          <RouterLink :to="{ name: 'reset-password' }" class="text-sm text-primary hover:underline">
            Forgot password?
          </RouterLink>
        </div>
        <Password
          v-model="form.password"
          input-id="login-password"
          :input-props="{ autocomplete: 'current-password' }"
          :feedback="false"
          toggle-mask
          :invalid="Boolean(fieldErrors.password)"
          fluid
          @update:model-value="(value) => validateFieldOnInput('password', loginPasswordSchema, value)"
        />
        <Message v-if="fieldErrors.password" severity="error" size="small" variant="simple">
          {{ fieldErrors.password }}
        </Message>
      </div>

      <Button type="submit" label="Log in" :loading="isSubmitting" fluid />
    </form>

    <p class="mt-6 text-center text-sm text-surface-500">
      New to Northcut?
      <RouterLink
        :to="{ name: 'signup', query: route.query }"
        class="font-medium text-primary hover:underline"
      >
        Create an account
      </RouterLink>
    </p>
  </div>
</template>
