<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Image as ImageIcon } from '@primeicons/vue'
import Tag from 'primevue/tag'

import { useProductRoutes } from '@/composables/useProductRoutes.js'
import { PublicityStatuses, publicityLabels } from '@/constants/product.js'
import { ImageWidths, toOptimizedImageUrl } from '@/utils/image.js'

// A look in a list: its image, name, how many items it has and its description. In the admin
// area a hidden look is also tagged as such.
const props = defineProps({
  lookSummary: { type: Object, required: true },
})

const { isAdminArea } = useProductRoutes()

const detailRoute = computed(() => ({
  name: isAdminArea.value ? 'admin-look-detail' : 'look-detail',
  params: { slug: props.lookSummary.slug },
}))

const itemCountLabel = computed(() => {
  const { productCount } = props.lookSummary
  return `${productCount} ${productCount === 1 ? 'item' : 'items'}`
})

const isHiddenInAdmin = computed(
  () => isAdminArea.value && props.lookSummary.publicityStatus === PublicityStatuses.HIDDEN,
)
</script>

<template>
  <RouterLink :to="detailRoute" class="group flex flex-col">
    <div class="relative aspect-[4/5] overflow-hidden bg-surface-100">
      <img
        v-if="lookSummary.imageUrl"
        :src="toOptimizedImageUrl(lookSummary.imageUrl, ImageWidths.CARD)"
        :alt="lookSummary.name"
        loading="lazy"
        class="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div v-else class="flex size-full items-center justify-center">
        <ImageIcon :size="32" color="var(--p-surface-400)" />
      </div>
      <Tag
        v-if="isHiddenInAdmin"
        :value="publicityLabels[PublicityStatuses.HIDDEN]"
        severity="secondary"
        class="absolute top-3 left-3"
      />
    </div>
    <div class="mt-3 flex flex-col gap-1 text-sm">
      <h3 class="underline-offset-4 group-hover:underline">{{ lookSummary.name }}</h3>
      <p class="text-surface-500">{{ itemCountLabel }}</p>
      <p v-if="lookSummary.description" class="line-clamp-2 text-surface-600">
        {{ lookSummary.description }}
      </p>
    </div>
  </RouterLink>
</template>
