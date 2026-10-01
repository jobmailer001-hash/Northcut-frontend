<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Image as ImageIcon, Times } from '@primeicons/vue'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import { useConfirm } from 'primevue/useconfirm'

import LookProductPicker from '@/components/admin/LookProductPicker.vue'
import { MAX_PRODUCTS_PER_LOOK } from '@/constants/look.js'
import { PublicityStatuses, publicityLabels } from '@/constants/product.js'
import { handleApiError } from '@/error/handleApiError.js'
import { useAdminLooksStore } from '@/stores/admin/looks.js'
import { ImageWidths, toOptimizedImageUrl } from '@/utils/image.js'
import { successToast } from '@/utils/toastService.js'

// The products that make up the look, stored by SKU, and the product list to add more from.
// Adding or removing one saves straight away.
const props = defineProps({
  lookItem: { type: Object, required: true },
})

const confirm = useConfirm()
const { updateLookRequest } = useAdminLooksStore()

const isSaving = ref(false)

const productSkus = computed(() => props.lookItem.products.map((product) => product.sku))
const isFull = computed(() => productSkus.value.length >= MAX_PRODUCTS_PER_LOOK)

const saveProductSkus = async (nextProductSkus, successMessage) => {
  isSaving.value = true
  try {
    await updateLookRequest(props.lookItem.id, { productSkus: nextProductSkus })
    successToast(successMessage)
  } catch (err) {
    handleApiError(err)
  } finally {
    isSaving.value = false
  }
}

const addProduct = async (product) => {
  await saveProductSkus([...productSkus.value, product.sku], `${product.name} added.`)
}

const confirmRemove = (product) => {
  confirm.require({
    header: `Remove ${product.name}?`,
    message: "It's only removed from this look — the product itself isn't changed.",
    acceptProps: { label: 'Remove', severity: 'danger' },
    rejectProps: { label: 'Cancel', severity: 'secondary', variant: 'outlined' },
    accept: () =>
      saveProductSkus(
        productSkus.value.filter((sku) => sku !== product.sku),
        `${product.name} removed.`,
      ),
  })
}
</script>

<template>
  <section class="flex flex-col gap-5 border border-surface-200 bg-surface-0 p-6">
    <div>
      <h2 class="text-lg font-medium">Products</h2>
      <p class="text-sm text-surface-500">
        {{ lookItem.products.length }} of {{ MAX_PRODUCTS_PER_LOOK }}. Every product must be public
        before the look can be.
      </p>
    </div>

    <Message v-if="!lookItem.products.length" severity="secondary" variant="simple">
      No products yet. Add the pieces of this outfit from the list below.
    </Message>

    <ul v-else class="flex flex-col divide-y divide-surface-200">
      <li v-for="product in lookItem.products" :key="product.sku" class="flex items-center gap-4 py-3">
        <div class="size-14 shrink-0 overflow-hidden bg-surface-100">
          <img
            v-if="product.imageUrl"
            :src="toOptimizedImageUrl(product.imageUrl, ImageWidths.THUMBNAIL)"
            alt=""
            class="size-full object-cover"
          />
          <div v-else class="flex size-full items-center justify-center">
            <ImageIcon :size="20" color="var(--p-surface-400)" />
          </div>
        </div>
        <div class="flex min-w-0 flex-1 flex-col gap-1">
          <RouterLink
            :to="{ name: 'admin-product-detail', params: { slug: product.slug } }"
            class="truncate hover:underline"
          >
            {{ product.name }}
          </RouterLink>
          <div class="flex flex-wrap items-center gap-2 text-sm text-surface-500">
            <span>{{ product.sku }}</span>
            <Tag
              v-if="product.publicityStatus === PublicityStatuses.HIDDEN"
              :value="publicityLabels[PublicityStatuses.HIDDEN]"
              severity="warn"
            />
          </div>
        </div>
        <Button
          severity="secondary"
          variant="text"
          size="small"
          :aria-label="`Remove ${product.name}`"
          :disabled="isSaving"
          @click="confirmRemove(product)"
        >
          <template #icon><Times :size="14" /></template>
        </Button>
      </li>
    </ul>

    <div class="flex flex-col gap-3 border-t border-surface-200 pt-5">
      <div>
        <h3 class="font-medium">Add products</h3>
        <p v-if="isFull" class="text-sm text-surface-500">
          This look has the maximum of {{ MAX_PRODUCTS_PER_LOOK }} products. Remove one to add another.
        </p>
      </div>
      <LookProductPicker
        :added-skus="productSkus"
        :is-full="isFull"
        :is-saving="isSaving"
        @add="addProduct"
      />
    </div>
  </section>
</template>
