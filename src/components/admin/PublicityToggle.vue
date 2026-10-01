<script setup>
import ToggleSwitch from 'primevue/toggleswitch'

// Hidden [toggle] Public — the active side is dark, the other greyed out. The words are
// clickable too, and pick that side directly. Emits `change` with the wanted state;
// the parent saves it.
defineProps({
  isPublic: { type: Boolean, required: true },
  isSaving: { type: Boolean, default: false },
})
const emit = defineEmits(['change'])
</script>

<template>
  <div class="flex items-center gap-3">
    <button
      type="button"
      class="cursor-pointer disabled:cursor-wait"
      :class="isPublic ? 'text-surface-400 hover:text-surface-600' : 'font-medium text-surface-950'"
      :disabled="isSaving"
      :aria-pressed="!isPublic"
      @click="isPublic && emit('change', false)"
    >
      Hidden
    </button>
    <ToggleSwitch
      :model-value="isPublic"
      aria-label="Visible to customers"
      :disabled="isSaving"
      @update:model-value="(value) => emit('change', value)"
    />
    <button
      type="button"
      class="cursor-pointer disabled:cursor-wait"
      :class="isPublic ? 'font-medium text-surface-950' : 'text-surface-400 hover:text-surface-600'"
      :disabled="isSaving"
      :aria-pressed="isPublic"
      @click="!isPublic && emit('change', true)"
    >
      Public
    </button>
  </div>
</template>
