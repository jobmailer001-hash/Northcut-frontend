<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import ResetCompleteForm from '@/components/auth/ResetCompleteForm.vue'
import BackLink from '@/components/shared/BackLink.vue'
import ResetRequestForm from '@/components/auth/ResetRequestForm.vue'
import ResetVerifyForm from '@/components/auth/ResetVerifyForm.vue'
import { successToast } from '@/utils/toastService.js'

const Steps = { REQUEST: 'REQUEST', VERIFY: 'VERIFY', COMPLETE: 'COMPLETE' }

const stepTitles = {
  [Steps.REQUEST]: 'Reset your password',
  [Steps.VERIFY]: 'Check your email',
  [Steps.COMPLETE]: 'Set a new password',
}

const router = useRouter()

const step = ref(Steps.REQUEST)
const email = ref('')
const resetToken = ref('')

const title = computed(() => stepTitles[step.value])

const handleRequested = (requestedEmail) => {
  email.value = requestedEmail
  step.value = Steps.VERIFY
}

const handleVerified = (token) => {
  resetToken.value = token
  step.value = Steps.COMPLETE
}

const handleCompleted = () => {
  successToast('Password updated. Log in with your new password.')
  router.replace({ name: 'login' })
}

const restart = () => {
  resetToken.value = ''
  step.value = Steps.REQUEST
}
</script>

<template>
  <div class="rounded-lg border border-surface-200 bg-white p-8">
    <div class="mb-4 flex flex-col gap-2">
      <BackLink :fallback="{ name: 'login' }" />
      <h1 class="text-2xl font-semibold">{{ title }}</h1>
    </div>

    <ResetRequestForm
      v-if="step === Steps.REQUEST"
      :initial-email="email"
      @requested="handleRequested"
    />
    <ResetVerifyForm
      v-else-if="step === Steps.VERIFY"
      :email="email"
      @verified="handleVerified"
      @change-email="restart"
    />
    <ResetCompleteForm
      v-else
      :reset-token="resetToken"
      @completed="handleCompleted"
      @restart="restart"
    />

    <p class="mt-6 text-center text-sm text-surface-500">
      Remembered it?
      <RouterLink :to="{ name: 'login' }" class="font-medium text-primary hover:underline">
        Back to log in
      </RouterLink>
    </p>
  </div>
</template>
