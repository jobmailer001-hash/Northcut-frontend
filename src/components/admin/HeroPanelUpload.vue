<script setup>
import { ref, useTemplateRef } from 'vue'
import { Image as ImageIcon } from '@primeicons/vue'
import Button from 'primevue/button'
import FileUpload from 'primevue/fileupload'
import Message from 'primevue/message'
import { useConfirm } from 'primevue/useconfirm'

import { ACCEPTED_IMAGE_TYPE, MAX_IMAGE_UPLOAD_TOTAL_BYTES } from '@/constants/product.js'
import { handleApiError } from '@/error/handleApiError.js'
import { useAdminSiteSettingsStore } from '@/stores/admin/siteSettings.js'
import { ImageWidths, toOptimizedImageUrl } from '@/utils/image.js'
import { successToast } from '@/utils/toastService.js'

// One landing-page hero panel: its current image, and choose → preview → Upload to replace it.
const props = defineProps({
  panel: { type: String, required: true },
  label: { type: String, required: true },
  image: { type: Object, default: null },
})

const confirm = useConfirm()
const { uploadHeroImageRequest, removeHeroImageRequest } = useAdminSiteSettingsStore()
const fileUpload = useTemplateRef('fileUpload')

const isUploading = ref(false)
const isRemoving = ref(false)
// The worker uploads the image; the page doesn't track the job, so this lasts until a refresh.
const isProcessing = ref(false)
// Remounts FileUpload after an upload: with `file-limit` PrimeVue keeps its own uploaded-file
// count that never resets, which would otherwise block choosing the next image.
const uploaderKey = ref(0)

const handleUpload = async ({ files }) => {
  isUploading.value = true
  try {
    await uploadHeroImageRequest(props.panel, files[0])
    isProcessing.value = true
    uploaderKey.value += 1
    successToast(`${props.label} image accepted — processing.`)
  } catch (err) {
    handleApiError(err)
    fileUpload.value?.clear()
  } finally {
    isUploading.value = false
  }
}

const removeImage = async () => {
  isRemoving.value = true
  try {
    await removeHeroImageRequest(props.panel)
    successToast(`${props.label} image removed.`)
  } catch (err) {
    handleApiError(err)
  } finally {
    isRemoving.value = false
  }
}

const confirmRemove = () => {
  confirm.require({
    header: 'Remove hero image?',
    message: `The ${props.label.toLowerCase()} panel will show a plain grey background.`,
    acceptProps: { label: 'Remove', severity: 'danger' },
    rejectProps: { label: 'Cancel', severity: 'secondary', variant: 'outlined' },
    accept: removeImage,
  })
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between gap-2">
      <h3 class="text-sm font-medium">{{ label }} panel</h3>
      <Button
        v-if="image"
        label="Remove"
        size="small"
        variant="text"
        severity="danger"
        :loading="isRemoving"
        @click="confirmRemove"
      />
    </div>

    <div class="aspect-[3/4] overflow-hidden bg-surface-200">
      <img
        v-if="image"
        :src="toOptimizedImageUrl(image.url, ImageWidths.CARD)"
        :alt="`${label} hero image`"
        class="size-full object-cover"
      />
      <div v-else class="flex size-full items-center justify-center">
        <ImageIcon :size="28" color="var(--p-surface-400)" />
      </div>
    </div>

    <Message v-if="isProcessing" severity="info" size="small">
      Processing… the new image appears here and on the site once uploaded — refresh in a moment.
    </Message>

    <!-- Choose → preview → Upload: nothing is sent until Upload is clicked. -->
    <FileUpload
      :key="uploaderKey"
      ref="fileUpload"
      mode="advanced"
      :accept="ACCEPTED_IMAGE_TYPE"
      :max-file-size="MAX_IMAGE_UPLOAD_TOTAL_BYTES"
      :file-limit="1"
      custom-upload
      :disabled="isUploading"
      choose-label="Choose"
      :upload-label="isUploading ? 'Uploading…' : 'Upload'"
      cancel-label="Clear"
      invalid-file-type-message="{0}: only JPEG images are allowed."
      @uploader="handleUpload"
    >
      <template #empty>
        <p class="text-xs text-surface-500">One JPEG, up to 10 MB. It replaces the current image.</p>
      </template>
    </FileUpload>
  </div>
</template>
