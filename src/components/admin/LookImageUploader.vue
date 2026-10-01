<script setup>
import { ref, useTemplateRef } from 'vue'
import { Image as ImageIcon } from '@primeicons/vue'
import FileUpload from 'primevue/fileupload'
import Message from 'primevue/message'

import { ACCEPTED_IMAGE_TYPE, MAX_IMAGE_UPLOAD_TOTAL_BYTES } from '@/constants/product.js'
import { handleApiError } from '@/error/handleApiError.js'
import { useAdminLooksStore } from '@/stores/admin/looks.js'
import { ImageWidths, toOptimizedImageUrl } from '@/utils/image.js'
import { successToast } from '@/utils/toastService.js'

const MAX_UPLOAD_MB = MAX_IMAGE_UPLOAD_TOTAL_BYTES / (1024 * 1024)

// The look's one image — e.g. the whole outfit worn together. Uploading replaces it.
const props = defineProps({
  lookItem: { type: Object, required: true },
})

const { uploadLookImageRequest } = useAdminLooksStore()
const fileUpload = useTemplateRef('fileUpload')

const isUploading = ref(false)
// The worker uploads the image in the background; the page doesn't track the job, so this
// stays until the admin refreshes and sees the new image.
const isProcessing = ref(false)

const handleUpload = async ({ files }) => {
  isUploading.value = true
  try {
    await uploadLookImageRequest(props.lookItem.id, files[0])
    isProcessing.value = true
    fileUpload.value.clear()
    successToast('Image accepted — processing.')
  } catch (err) {
    handleApiError(err)
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <section class="flex flex-col gap-5 border border-surface-200 bg-surface-0 p-6">
    <div>
      <h2 class="text-lg font-medium">Image</h2>
      <p class="text-sm text-surface-500">
        One JPEG, up to {{ MAX_UPLOAD_MB }} MB — ideally the whole outfit worn together. Uploading a
        new image replaces the current one. Required before the look can be public.
      </p>
    </div>

    <Message v-if="isProcessing" severity="info">
      Processing the new image… It'll appear here once it's uploaded — refresh the page in a moment.
    </Message>

    <div class="aspect-[4/5] w-48 overflow-hidden border border-surface-200 bg-surface-100">
      <img
        v-if="lookItem.imageUrl"
        :src="toOptimizedImageUrl(lookItem.imageUrl, ImageWidths.CARD)"
        :alt="lookItem.name"
        class="size-full object-cover"
      />
      <div v-else class="flex size-full items-center justify-center">
        <ImageIcon :size="32" color="var(--p-surface-400)" />
      </div>
    </div>

    <!-- Choose → preview → Upload: nothing is sent until the Upload button is clicked. -->
    <FileUpload
      ref="fileUpload"
      mode="advanced"
      :accept="ACCEPTED_IMAGE_TYPE"
      :max-file-size="MAX_IMAGE_UPLOAD_TOTAL_BYTES"
      :multiple="false"
      custom-upload
      :disabled="isUploading"
      :choose-label="lookItem.imageUrl ? 'Choose a new image' : 'Choose image'"
      :upload-label="isUploading ? 'Uploading…' : 'Upload'"
      cancel-label="Clear"
      invalid-file-type-message="{0}: only JPEG images are allowed."
      @uploader="handleUpload"
    >
      <template #empty>
        <p class="text-sm text-surface-500">Choose one JPEG image — you'll see it here before uploading.</p>
      </template>
    </FileUpload>
  </section>
</template>
