<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

import { setToastInstance } from '@/utils/toastService.js'

const toast = useToast()

onMounted(() => {
  setToastInstance(toast)
})
</script>

<template>
  <Toast />
  <ConfirmDialog />
  <RouterView />
</template>
