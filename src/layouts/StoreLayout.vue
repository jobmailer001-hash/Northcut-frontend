<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { Heart, HeartFill, ShoppingBag, User } from '@primeicons/vue'
import OverlayBadge from 'primevue/overlaybadge'

import { useAuthStore } from '@/stores/auth.js'
import { useCartStore } from '@/stores/cart.js'

// Logging out lives on the profile page only, not in the header.
const { user, isAuthenticated, isAdmin } = storeToRefs(useAuthStore())
const { itemCount } = storeToRefs(useCartStore())

const cartCountLabel = computed(() => (itemCount.value > 99 ? '99+' : itemCount.value))

// The header hides while scrolling down and slides back when scrolling up.
// Movements smaller than the threshold (trackpad jitter) are ignored, so it doesn't flicker.
const SCROLL_THRESHOLD_PX = 10
// Near the top of the page the header is always shown.
const ALWAYS_SHOWN_WITHIN_PX = 80

const route = useRoute()
const isHeaderHidden = ref(false)
// Scroll position where the header last changed (or was confirmed) — small movements
// accumulate against it until they pass the threshold.
let anchorScrollY = 0

const handleScroll = () => {
  const scrollY = window.scrollY

  if (scrollY < ALWAYS_SHOWN_WITHIN_PX) {
    isHeaderHidden.value = false
  } else if (scrollY > anchorScrollY + SCROLL_THRESHOLD_PX) {
    isHeaderHidden.value = true
  } else if (scrollY < anchorScrollY - SCROLL_THRESHOLD_PX) {
    isHeaderHidden.value = false
  } else {
    return
  }
  anchorScrollY = scrollY
}

// A new page always starts with the header visible.
watch(
  () => route.fullPath,
  () => {
    isHeaderHidden.value = false
  },
)

onMounted(() => window.addEventListener('scroll', handleScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))

const footerLinks = computed(() => [
  { label: 'Shop', to: { name: 'products' } },
  { label: 'Cart', to: { name: 'cart' } },
  isAuthenticated.value
    ? { label: 'Orders', to: { name: 'orders' } }
    : { label: 'Log in', to: { name: 'login' } },
])
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <!-- Sticky, sliding out of view on scroll down (see handleScroll). Focusing anything inside
         (keyboard users) brings it back, so focus never lands on a hidden link. -->
    <header
      class="sticky top-0 z-40 border-b border-surface-200 bg-surface-50 transition-transform duration-300 motion-reduce:transition-none"
      :class="{ '-translate-y-full': isHeaderHidden }"
      @focusin="isHeaderHidden = false"
    >
      <!-- Two siblings: the wordmark, and one parent holding both link groups. When the row
           gets too narrow, the links parent wraps as a whole under the wordmark (flex-wrap).
           `grow` (not flex-1) keeps its natural width as the basis, so it wraps as soon as the
           full row doesn't fit, then stretches full width with the groups pinned left and right. -->
      <div class="flex flex-wrap items-center gap-x-10 gap-y-4 px-4 py-4 md:px-6">
        <div>
          <RouterLink
            :to="{ name: 'landing' }"
            class="font-display text-3xl leading-none tracking-tight uppercase"
          >
            Northcut
          </RouterLink>
        </div>

        <div class="flex grow items-center justify-between gap-6 text-sm">
          <!-- Text links on the left. -->
          <nav class="flex items-center gap-6">
            <RouterLink
              :to="{ name: 'products' }"
              class="underline-offset-4 hover:underline"
              active-class="underline"
            >
              Shop
            </RouterLink>
            <RouterLink
              v-if="isAuthenticated"
              :to="{ name: 'orders' }"
              class="underline-offset-4 hover:underline"
              active-class="underline"
            >
              Orders
            </RouterLink>
            <RouterLink
              v-if="isAdmin"
              :to="{ name: 'admin-dashboard' }"
              class="underline-offset-4 hover:underline"
            >
              Admin
            </RouterLink>
          </nav>

          <!-- Icon links on the right. -->
          <nav class="flex items-center gap-5">
            <template v-if="!isAuthenticated">
              <RouterLink :to="{ name: 'login' }" class="underline-offset-4 hover:underline">
                Log in
              </RouterLink>
              <RouterLink :to="{ name: 'signup' }" class="underline-offset-4 hover:underline">
                Sign up
              </RouterLink>
            </template>
            <RouterLink
              v-if="isAuthenticated"
              v-slot="{ href, navigate, isActive }"
              :to="{ name: 'favourites' }"
              custom
            >
              <a :href="href" class="flex items-center" aria-label="Favourites" @click="navigate">
                <HeartFill v-if="isActive" :size="20" />
                <Heart v-else :size="20" />
              </a>
            </RouterLink>
            <RouterLink
              :to="{ name: 'cart' }"
              class="flex items-center"
              :aria-label="`Bag, ${itemCount} item(s)`"
            >
              <!-- No badge on an empty bag; OverlayBadge would show a "0". -->
              <OverlayBadge v-if="itemCount" :value="cartCountLabel">
                <ShoppingBag :size="20" />
              </OverlayBadge>
              <ShoppingBag v-else :size="20" />
            </RouterLink>
            <RouterLink
              v-if="isAuthenticated"
              :to="{ name: 'profile' }"
              class="flex items-center"
              :aria-label="`Profile — ${user.name}`"
            >
              <User :size="18" />
            </RouterLink>
          </nav>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-[1600px] flex-1 px-4 py-10 md:px-6">
      <RouterView />
    </main>

    <footer
      class="mt-24 bg-(--site-secondary) bg-[radial-gradient(circle,var(--p-surface-800)_1px,transparent_1px)] bg-[size:88px_88px] px-4 pt-24 pb-8 text-(--site-secondary-contrast) md:px-6"
    >
      <nav class="flex flex-col items-center gap-2">
        <RouterLink
          v-for="(link, index) in footerLinks"
          :key="link.label"
          :to="link.to"
          class="text-5xl font-light tracking-tight hover:text-surface-400 md:text-7xl"
        >
          {{ link.label }}
          <sup class="align-super text-xs tracking-[0.12em] text-surface-500">
            [ {{ index + 1 }} ]
          </sup>
        </RouterLink>
      </nav>

      <div
        class="mt-28 flex flex-col items-center justify-between gap-4 text-sm text-surface-500 md:flex-row"
      >
        <p>© {{ new Date().getFullYear() }} Northcut. All rights reserved.</p>
        <p class="font-display text-2xl leading-none tracking-tight text-surface-700 uppercase">
          Northcut
        </p>
      </div>
    </footer>
  </div>
</template>
