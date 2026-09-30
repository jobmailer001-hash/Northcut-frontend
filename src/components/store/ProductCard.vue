<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Image as ImageIcon } from '@primeicons/vue'

import FavouriteButton from '@/components/store/FavouriteButton.vue'
import { useProductRoutes } from '@/composables/useProductRoutes.js'
import {
  AvailabilityStatuses,
  HIDDEN_LABEL_TONE,
  PublicityStatuses,
  availabilityLabels,
  availabilityTones,
  publicityLabels,
} from '@/constants/product.js'
import { ImageWidths, toOptimizedImageUrl } from '@/utils/image.js'
import { formatMoney } from '@/utils/money.js'

const props = defineProps({
  product: { type: Object, required: true },
})

const { isAdminArea, detailRoute } = useProductRoutes()

const coverImage = computed(() => props.product.images[0])
const isSoldOut = computed(
  () => props.product.availabilityStatus === AvailabilityStatuses.OUT_OF_STOCK
)
// The bracket label shows availability (In stock / Pre-order / Sold out); in the admin area a
// hidden product shows "Hidden" instead, since that matters most there.
const label = computed(() => {
  const { availabilityStatus, publicityStatus } = props.product
  if (isAdminArea.value && publicityStatus === PublicityStatuses.HIDDEN) {
    return { text: publicityLabels[publicityStatus], tone: HIDDEN_LABEL_TONE }
  }
  return {
    text: availabilityLabels[availabilityStatus],
    tone: availabilityTones[availabilityStatus],
  }
})
</script>

<template>
  <!-- The heart sits beside the link (not inside it): a button nested in a link is invalid HTML,
       and clicking it must only save the favourite, never open the product. -->
  <div class="group relative">
    <RouterLink :to="detailRoute(product.slug)" class="flex flex-col">
      <div class="aspect-[4/5] overflow-hidden bg-surface-100">
        <img
          v-if="coverImage"
          :src="toOptimizedImageUrl(coverImage.url, ImageWidths.CARD)"
          :alt="product.name"
          loading="lazy"
          class="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          :class="{ 'opacity-60': isSoldOut }"
        />
        <div v-else class="flex size-full items-center justify-center">
          <ImageIcon :size="32" color="var(--p-surface-400)" />
        </div>
      </div>
      <div class="mt-3 flex flex-col gap-1 text-sm">
        <!-- Only the state gets the tint; the brackets stay plain grey outside it. -->
        <p class="flex items-center text-xs tracking-[0.12em] text-surface-500">
          <span aria-hidden="true" class="font-bold text-sm">[</span>
          <span class="" :class="label.tone">{{ label.text }}</span>
          <span aria-hidden="true" class="font-bold text-sm">]</span>
        </p>
        <h3 class="underline-offset-4 group-hover:underline">{{ product.name }}</h3>
        <p>{{ product.price != null ? formatMoney(product.price) : '' }}</p>
      </div>
    </RouterLink>

    <FavouriteButton
      v-if="!isAdminArea"
      :product="product"
      icon-only
      class="absolute! top-3 right-3"
    />
  </div>
</template>
