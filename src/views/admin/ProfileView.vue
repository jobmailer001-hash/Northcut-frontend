<script setup>
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'

import BackLink from '@/components/shared/BackLink.vue'
import ChangePasswordForm from '@/components/store/ChangePasswordForm.vue'
import ProfileDetailsForm from '@/components/store/ProfileDetailsForm.vue'
import { useLogout } from '@/composables/useLogout.js'
import { useProfileStore } from '@/stores/profile.js'

// Same /me and /auth/password endpoints as customers — only the layout differs.
const profileStore = useProfileStore()
const { profile } = storeToRefs(profileStore)
const { fetchProfileRequest } = profileStore
const { logout, isLoggingOut } = useLogout()

const isLoading = ref(true)
const loadError = ref('')

onMounted(async () => {
  try {
    await fetchProfileRequest()
  } catch (err) {
    loadError.value = err.message
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section class="flex max-w-4xl flex-col gap-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="flex flex-col gap-2">
        <BackLink :fallback="{ name: 'admin-dashboard' }" />
        <h1 class="text-2xl font-semibold">My profile</h1>
      </div>
      <!-- The only place to log out. -->
      <Button
        label="Log out"
        severity="secondary"
        variant="outlined"
        :loading="isLoggingOut"
        @click="logout"
      />
    </div>
    <Message v-if="loadError" severity="error">{{ loadError }}</Message>
    <Skeleton v-else-if="isLoading || !profile" height="16rem" />
    <div v-else class="grid gap-10 rounded-lg border border-surface-200 bg-white p-6 md:grid-cols-2">
      <ProfileDetailsForm :profile="profile" />
      <ChangePasswordForm />
    </div>
  </section>
</template>
