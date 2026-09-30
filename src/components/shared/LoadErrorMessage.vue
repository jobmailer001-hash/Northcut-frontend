<script setup>
import Button from 'primevue/button'
import Message from 'primevue/message'

// Shown in place of content that failed to load, so a failure never looks like "nothing here".
defineProps({
  message: { type: String, required: true },
})
const emit = defineEmits(['retry'])
</script>

<template>
  <Message severity="error">
    <div class="flex flex-wrap items-center gap-3">
      <span>{{ message }}</span>
      <Button label="Try again" size="small" severity="secondary" variant="outlined" @click="emit('retry')" />
    </div>
  </Message>
</template>
