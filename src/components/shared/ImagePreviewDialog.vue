<script setup>
import Dialog from 'primevue/dialog'

import { ImageWidths, toOptimizedImageUrl } from '@/utils/image.js'

// One image shown large, on its own, over the page. Closes with the X, Escape, or a click on
// the dimmed backdrop. Used by the product and look detail pages.
const visible = defineModel('visible', { type: Boolean, default: false })

defineProps({
  src: { type: String, default: null },
  alt: { type: String, required: true },
})
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :header="alt"
    modal
    dismissable-mask
    :draggable="false"
    class="w-auto max-w-[95vw]"
  >
    <img
      v-if="src"
      :src="toOptimizedImageUrl(src, ImageWidths.DETAIL)"
      :alt="alt"
      class="mx-auto max-h-[80vh] w-auto object-contain"
    />
  </Dialog>
</template>
