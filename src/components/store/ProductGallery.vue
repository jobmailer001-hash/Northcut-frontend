<script setup>
import { ref, watch } from 'vue'
import { Image as ImageIcon } from '@primeicons/vue'
import Carousel from 'primevue/carousel'
import CarouselContent from 'primevue/carouselcontent'
import CarouselItem from 'primevue/carouselitem'

import { ImageWidths, toOptimizedImageUrl } from '@/utils/image.js'

const props = defineProps({
  images: { type: Array, required: true },
  alt: { type: String, required: true },
})

const selectedIndex = ref(0)

// Swiping/dragging the main carousel keeps the thumbnails in step.
const handleSlideChange = (slide) => {
  selectedIndex.value = Number(slide ?? 0)
}

// A different product (or removed image) resets to the cover.
watch(
  () => props.images,
  () => {
    selectedIndex.value = 0
  },
)
</script>

<template>
  <div class="flex flex-col gap-3">
    <div v-if="!images.length" class="flex aspect-[4/5] items-center justify-center bg-surface-100">
      <ImageIcon :size="48" color="var(--p-surface-400)" />
    </div>

    <template v-else>
      <Carousel :slide="selectedIndex" align="center" @update:slide="handleSlideChange">
        <CarouselContent class="aspect-[4/5] bg-surface-100">
          <CarouselItem v-for="(image, index) in images" :key="image.id" class="basis-full!">
            <img
              :draggable="false"
              :src="toOptimizedImageUrl(image.url, ImageWidths.DETAIL)"
              :alt="`${alt} — image ${index + 1} of ${images.length}`"
              class="size-full object-cover select-none"
            />
          </CarouselItem>
        </CarouselContent>
      </Carousel>

      <!-- Thumbnails only help when there's more than one image to choose from. -->
      <Carousel v-if="images.length > 1" :spacing="8" align="center" :slide="selectedIndex">
        <CarouselContent class="h-24">
          <CarouselItem
            v-for="(image, index) in images"
            :key="image.id"
            class="basis-1/4! transition-opacity"
            :class="selectedIndex === index ? '' : 'opacity-60 hover:opacity-40'"
          >
            <button
              type="button"
              class="size-full cursor-pointer"
              :aria-label="`Show image ${index + 1}`"
              :aria-current="selectedIndex === index"
              @click="selectedIndex = index"
            >
              <img
                :draggable="false"
                :src="toOptimizedImageUrl(image.url, ImageWidths.THUMBNAIL)"
                alt=""
                class="size-full object-cover select-none"
              />
            </button>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </template>
  </div>
</template>
