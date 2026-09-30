<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { Heart, HeartFill } from '@primeicons/vue'
import Button from 'primevue/button'

import { handleApiError } from '@/error/handleApiError.js'
import { useAuthStore } from '@/stores/auth.js'
import { useProfileStore } from '@/stores/profile.js'

// `iconOnly` is the compact heart used on product cards; the default is the labelled button.
const props = defineProps({
  product: { type: Object, required: true },
  iconOnly: { type: Boolean, default: false },
})

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = storeToRefs(useAuthStore())
const { ensureFavouritesLoadedRequest, isFavourite, addFavouriteRequest, removeFavouriteRequest } =
  useProfileStore()

const isSaving = ref(false)
const isSaved = computed(() => isFavourite(props.product.sku))

const toggleFavourite = async () => {
  // Guests are sent to log in, then brought back here.
  if (!isAuthenticated.value) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  isSaving.value = true
  try {
    if (isSaved.value) {
      await removeFavouriteRequest(props.product.sku)
    } else {
      await addFavouriteRequest(props.product)
    }
  } catch (err) {
    handleApiError(err)
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  if (!isAuthenticated.value) return
  try {
    await ensureFavouritesLoadedRequest()
  } catch (err) {
    handleApiError(err)
  }
})
</script>

<template>
  <Button
    v-if="iconOnly"
    severity="secondary"
    variant="text"
    size="small"
    class="bg-surface-0/80! backdrop-blur-sm"
    :aria-label="isSaved ? `Remove ${product.name} from favourites` : `Save ${product.name} to favourites`"
    :aria-pressed="isSaved"
    :disabled="isSaving"
    @click="toggleFavourite"
  >
    <template #icon>
      <HeartFill v-if="isSaved" :size="16" color="var(--p-red-500)" />
      <Heart v-else :size="16" />
    </template>
  </Button>
  <Button
    v-else
    :label="isSaved ? 'Saved to favourites' : 'Save to favourites'"
    severity="secondary"
    variant="outlined"
    :loading="isSaving"
    :aria-pressed="isSaved"
    @click="toggleFavourite"
  >
    <template #icon>
      <HeartFill v-if="isSaved" :size="16" color="var(--p-red-500)" />
      <Heart v-else :size="16" />
    </template>
  </Button>
</template>
