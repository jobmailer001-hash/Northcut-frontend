<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { ArrowLeft } from '@primeicons/vue'

// Sits beside every page's h1. Goes back to the previous page when the user got here from
// within the app; when the page was opened directly (bookmark, new tab), history.back() would
// leave the site, so it goes to `fallback` — the page's natural parent — instead.
const props = defineProps({
  fallback: { type: [String, Object], required: true },
  label: { type: String, default: 'Back' },
})

const router = useRouter()

const goBack = () => {
  // Vue Router records the previous in-app location on history.state.back.
  if (window.history.state?.back) {
    router.back()
  } else {
    router.push(props.fallback)
  }
}
</script>

<template>
  <!-- `custom` so the click handler replaces RouterLink's own navigation; the href still points
       at the fallback, so open-in-new-tab works. -->
  <RouterLink v-slot="{ href }" :to="fallback" custom>
    <a
      :href="href"
      class="flex w-fit items-center gap-1 text-sm text-surface-500 hover:text-surface-900"
      @click.prevent="goBack"
    >
      <ArrowLeft :size="14" /> {{ label }}
    </a>
  </RouterLink>
</template>
