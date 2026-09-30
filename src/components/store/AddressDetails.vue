<script setup>
import { ref } from 'vue'
import { ChevronDown, ChevronUp } from '@primeicons/vue'

// Address lists show each address by its label; this dropdown reveals the full address on demand.
defineProps({
  address: { type: Object, required: true },
})

const isOpen = ref(false)
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- A real button: inside a selectable (label-wrapped) card, clicking it doesn't select the card. -->
    <button
      type="button"
      class="flex w-fit cursor-pointer items-center gap-1 text-sm text-surface-500 hover:text-surface-900"
      :aria-expanded="isOpen"
      @click.stop="isOpen = !isOpen"
    >
      {{ isOpen ? 'Hide details' : 'View details' }}
      <ChevronUp v-if="isOpen" :size="12" />
      <ChevronDown v-else :size="12" />
    </button>
    <address v-if="isOpen" class="text-sm leading-relaxed text-surface-600 not-italic">
      {{ address.fullName }} · {{ address.phone }}<br />
      {{ address.line1 }}<template v-if="address.line2">, {{ address.line2 }}</template><br />
      {{ address.city }}, {{ address.state }} {{ address.postalCode }}<br />
      {{ address.country }}
    </address>
  </div>
</template>
