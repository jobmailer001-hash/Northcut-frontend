<script setup>
import { computed, ref, useTemplateRef } from 'vue'
import { Trash } from '@primeicons/vue'
import Button from 'primevue/button'
import FileUpload from 'primevue/fileupload'
import Message from 'primevue/message'
import { useConfirm } from 'primevue/useconfirm'

import {
  ACCEPTED_IMAGE_TYPE,
  MAX_IMAGE_UPLOAD_TOTAL_BYTES,
  MAX_IMAGES_PER_PRODUCT,
} from '@/constants/product.js'
import { handleApiError } from '@/error/handleApiError.js'
import { useAdminProductsStore } from '@/stores/admin/products.js'
import { ImageWidths, toOptimizedImageUrl } from '@/utils/image.js'
import { successToast, warningToast } from '@/utils/toastService.js'

const MAX_UPLOAD_MB = MAX_IMAGE_UPLOAD_TOTAL_BYTES / (1024 * 1024)

const props = defineProps({
  product: { type: Object, required: true },
})

const confirm = useConfirm()
const { uploadProductImagesRequest, deleteProductImageRequest } = useAdminProductsStore()
const fileUpload = useTemplateRef('fileUpload')

const isUploading = ref(false)
const deletingImageId = ref(null)
// Images accepted this visit that the worker is still uploading. The page doesn't track the job,
// so this lives until the admin refreshes and sees the attached images.
const processingCount = ref(0)

const remainingSlots = computed(
  () => MAX_IMAGES_PER_PRODUCT - props.product.images.length - processingCount.value,
)

// Returns why the chosen files can't be uploaded, or null. The backend runs the same checks.
// No FileUpload `file-limit`: in custom-upload mode PrimeVue keeps its own running count that
// never drops, which would lock the picker before the product is actually full.
const getSelectionProblem = (files) => {
  if (files.length > remainingSlots.value) {
    return `This product can take ${remainingSlots.value} more image(s) — ${files.length} chosen.`
  }
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0)
  if (totalBytes > MAX_IMAGE_UPLOAD_TOTAL_BYTES) {
    return `The chosen images add up to more than ${MAX_UPLOAD_MB} MB. Remove some and try again.`
  }
  return null
}

const handleUpload = async ({ files }) => {
  const problem = getSelectionProblem(files)
  if (problem) {
    warningToast(problem)
    return
  }

  isUploading.value = true
  try {
    const upload = await uploadProductImagesRequest(props.product.id, files)
    processingCount.value += upload.imageCount
    fileUpload.value.clear()
    successToast(`${upload.imageCount} image(s) accepted — processing.`)
  } catch (err) {
    handleApiError(err)
  } finally {
    isUploading.value = false
  }
}

const deleteImage = async (imageId) => {
  deletingImageId.value = imageId
  try {
    await deleteProductImageRequest(props.product.id, imageId)
    successToast('Image removed.')
  } catch (err) {
    handleApiError(err)
  } finally {
    deletingImageId.value = null
  }
}

const confirmDelete = (imageId) => {
  confirm.require({
    header: 'Remove image?',
    message: 'This permanently deletes the image.',
    acceptProps: { label: 'Remove', severity: 'danger' },
    rejectProps: { label: 'Cancel', severity: 'secondary', variant: 'outlined' },
    accept: () => deleteImage(imageId),
  })
}
</script>

<template>
  <section class="flex flex-col gap-5 border border-surface-200 bg-surface-0 p-6">
    <div>
      <h2 class="text-lg font-medium">Images</h2>
      <p class="text-sm text-surface-500">
        {{ product.images.length }} of {{ MAX_IMAGES_PER_PRODUCT }}. JPEG only, up to
        {{ MAX_UPLOAD_MB }} MB per upload. The first image is the cover.
      </p>
    </div>

    <Message v-if="processingCount" severity="info">
      Processing {{ processingCount }} image(s)… They'll appear here once they're uploaded —
      refresh the page in a moment.
    </Message>

    <Message v-if="!product.images.length && !processingCount" severity="secondary" variant="simple">
      No images yet. Products without images show a placeholder in the store.
    </Message>

    <ul v-else-if="product.images.length" class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <li
        v-for="(image, index) in product.images"
        :key="image.id"
        class="relative overflow-hidden border border-surface-200"
      >
        <img
          :src="toOptimizedImageUrl(image.url, ImageWidths.CARD)"
          :alt="`${product.name} image ${index + 1}`"
          class="aspect-square w-full object-cover"
        />
        <span
          v-if="index === 0"
          class="absolute top-2 left-2 bg-surface-900/80 px-2 py-0.5 text-xs text-white"
        >
          Cover
        </span>
        <Button
          class="absolute! top-2 right-2"
          severity="danger"
          size="small"
          :aria-label="`Remove image ${index + 1}`"
          :loading="deletingImageId === image.id"
          @click="confirmDelete(image.id)"
        >
          <template #icon><Trash :size="14" /></template>
        </Button>
      </li>
    </ul>

    <!-- Choose → preview → Upload: nothing is sent until the Upload button is clicked. -->
    <FileUpload
      v-if="remainingSlots > 0"
      ref="fileUpload"
      mode="advanced"
      :accept="ACCEPTED_IMAGE_TYPE"
      :max-file-size="MAX_IMAGE_UPLOAD_TOTAL_BYTES"
      multiple
      custom-upload
      :disabled="isUploading"
      choose-label="Choose images"
      :upload-label="isUploading ? 'Uploading…' : 'Upload'"
      cancel-label="Clear"
      invalid-file-type-message="{0}: only JPEG images are allowed."
      @uploader="handleUpload"
    >
      <template #empty>
        <p class="text-sm text-surface-500">
          Choose up to {{ remainingSlots }} JPEG image(s) — you'll see them here before uploading.
        </p>
      </template>
    </FileUpload>
    <p v-else class="text-sm text-surface-500">
      This product has the maximum of {{ MAX_IMAGES_PER_PRODUCT }} images. Remove one to add another.
    </p>
  </section>
</template>
