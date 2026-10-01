<script setup>
import { ref, watch } from 'vue'
import { Image as ImageIcon } from '@primeicons/vue'
import Carousel from 'primevue/carousel'
import CarouselContent from 'primevue/carouselcontent'
import CarouselItem from 'primevue/carouselitem'

import ImagePreviewDialog from '@/components/shared/ImagePreviewDialog.vue'
import { ImageWidths, toOptimizedImageUrl } from '@/utils/image.js'

// A press that moves further than this is a swipe through the carousel, not a click to enlarge.
const CLICK_MOVE_TOLERANCE_PX = 10

const props = defineProps({
  images: { type: Array, required: true },
  alt: { type: String, required: true },
})

const selectedIndex = ref(0)
const isPreviewVisible = ref(false)
let pressStart = null

// Swiping/dragging the main carousel keeps the thumbnails in step.
const handleSlideChange = (slide) => {
  selectedIndex.value = Number(slide ?? 0)
}

const handlePressStart = (event) => {
  pressStart = { x: event.clientX, y: event.clientY }
}

// Clicking the main image (not a thumbnail) shows it large in a dialog. A keyboard press
// (Enter/Space: `detail` is 0) has no pointer movement, so it always opens.
const openPreview = (event) => {
  const isKeyboardClick = event.detail === 0
  const movedPx =
    !isKeyboardClick && pressStart
      ? Math.hypot(event.clientX - pressStart.x, event.clientY - pressStart.y)
      : 0
  pressStart = null
  if (movedPx <= CLICK_MOVE_TOLERANCE_PX) isPreviewVisible.value = true
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
            <button
              type="button"
              class="size-full cursor-zoom-in"
              :aria-label="`View image ${index + 1} larger`"
              @pointerdown="handlePressStart"
              @click="openPreview"
            >
              <img
                :draggable="false"
                :src="toOptimizedImageUrl(image.url, ImageWidths.DETAIL)"
                :alt="`${alt} — image ${index + 1} of ${images.length}`"
                class="size-full object-cover select-none"
              />
            </button>
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

      <ImagePreviewDialog
        v-model:visible="isPreviewVisible"
        :src="images[selectedIndex]?.url"
        :alt="alt"
      />
    </template>
  </div>
</template>
