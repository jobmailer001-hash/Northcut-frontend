<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ArrowUpRight } from '@primeicons/vue'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import ToggleSwitch from 'primevue/toggleswitch'

import ProductForm from '@/components/admin/ProductForm.vue'
import BackLink from '@/components/shared/BackLink.vue'
import ProductImagesManager from '@/components/admin/ProductImagesManager.vue'
import StockAdjustDialog from '@/components/admin/StockAdjustDialog.vue'
import { useProductRoutes } from '@/composables/useProductRoutes.js'
import { PublicityStatuses } from '@/constants/product.js'
import { handleApiError } from '@/error/handleApiError.js'
import { useAdminProductsStore } from '@/stores/admin/products.js'
import { successToast, warningToast } from '@/utils/toastService.js'

// Serves /admin/products/new (create) and /admin/products/:slug — the admin product page, where
// a product is managed in separate sections: status, details, and images.
const route = useRoute()
const router = useRouter()
const { detailRoute, listRoute } = useProductRoutes()
const adminProductsStore = useAdminProductsStore()
const { product } = storeToRefs(adminProductsStore)
const { fetchAdminProductBySlugRequest, updateProductRequest } = adminProductsStore

const slug = computed(() => route.params.slug)
const isEditing = computed(() => Boolean(slug.value))
const isLoading = ref(false)
const loadError = ref('')
const isStockDialogVisible = ref(false)
const isSavingPublicity = ref(false)

const isPublic = computed(() => product.value?.publicityStatus === PublicityStatuses.PUBLIC)

// Set when the URL follows a slug change after saving: the saved product is already loaded.
let isFollowingSavedSlug = false

const loadProduct = async () => {
  if (isFollowingSavedSlug) {
    isFollowingSavedSlug = false
    return
  }
  if (!isEditing.value) return
  isLoading.value = true
  loadError.value = ''
  try {
    await fetchAdminProductBySlugRequest(slug.value)
  } catch (err) {
    loadError.value = err.message
  } finally {
    isLoading.value = false
  }
}

// The toggle saves on its own, separately from the details form.
const setPublicity = async (shouldBePublic) => {
  isSavingPublicity.value = true
  try {
    const { hiddenLooks } = await updateProductRequest(product.value.id, {
      publicityStatus: shouldBePublic ? PublicityStatuses.PUBLIC : PublicityStatuses.HIDDEN,
    })
    successToast(shouldBePublic ? 'Product is now public.' : 'Product is now hidden.')
    if (hiddenLooks.length) {
      warningToast(`Also hidden, since they include this product: ${hiddenLooks.map(({ name }) => name).join(', ')}.`)
    }
  } catch (err) {
    handleApiError(err)
  } finally {
    isSavingPublicity.value = false
  }
}

const handleCreated = (createdProduct) => {
  router.replace(detailRoute(createdProduct.slug))
}

// The page is addressed by slug, so a renamed slug moves the URL with it.
const handleSaved = (savedProduct) => {
  if (savedProduct.slug !== slug.value) {
    isFollowingSavedSlug = true
    router.replace(detailRoute(savedProduct.slug))
  }
}

watch(slug, loadProduct, { immediate: true })
</script>

<template>
  <section class="mx-auto flex max-w-4xl flex-col gap-6">
    <template v-if="!isEditing">
      <div class="flex flex-col gap-2">
        <BackLink :fallback="listRoute()" />
        <h1 class="text-2xl font-medium">New product</h1>
      </div>
      <ProductForm @created="handleCreated" />
    </template>

    <Message v-else-if="loadError" severity="error">{{ loadError }}</Message>

    <template v-else-if="isLoading || !product">
      <Skeleton height="2rem" width="16rem" />
      <Skeleton height="6rem" />
      <Skeleton height="24rem" />
    </template>

    <template v-else>
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div class="flex flex-col gap-2">
          <BackLink :fallback="listRoute()" />
          <h1 class="text-2xl font-medium">{{ product.name }}</h1>
          <p class="text-sm text-surface-500">{{ product.sku }}</p>
        </div>
        <RouterLink
          v-if="isPublic"
          :to="{ name: 'product-detail', params: { slug: product.slug } }"
          target="_blank"
          class="flex items-center gap-1 text-sm text-surface-500 hover:text-surface-900"
        >
          View in store <ArrowUpRight :size="12" />
        </RouterLink>
      </div>

      <!-- Status: visibility and stock, each saved by its own action. -->
      <section
        class="flex flex-wrap items-center justify-between gap-6 border border-surface-200 bg-surface-0 p-6"
      >
        <!-- Hidden [toggle] Public — the active side is dark, the other greyed out. The words are
             clickable too, and pick that side directly. -->
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="cursor-pointer disabled:cursor-wait"
              :class="isPublic ? 'text-surface-400 hover:text-surface-600' : 'font-medium text-surface-950'"
              :disabled="isSavingPublicity"
              :aria-pressed="!isPublic"
              @click="isPublic && setPublicity(false)"
            >
              Hidden
            </button>
            <ToggleSwitch
              :model-value="isPublic"
              aria-label="Visible to customers"
              :disabled="isSavingPublicity"
              @update:model-value="setPublicity"
            />
            <button
              type="button"
              class="cursor-pointer disabled:cursor-wait"
              :class="isPublic ? 'font-medium text-surface-950' : 'text-surface-400 hover:text-surface-600'"
              :disabled="isSavingPublicity"
              :aria-pressed="isPublic"
              @click="!isPublic && setPublicity(true)"
            >
              Public
            </button>
          </div>
          <p class="text-sm text-surface-500">
            {{ isPublic ? 'Customers can see and buy this product.' : "Customers can't see this product." }}
          </p>
        </div>

        <div class="text-sm">
          <p>
            <span class="font-medium">{{ product.availableStock }}</span> available ·
            {{ product.stock }} in stock · {{ product.reserved }} reserved
          </p>
          <p class="text-surface-500">
            Pre-order: {{ product.preorderReserved }} of {{ product.preorderLimit }} claimed
          </p>
          <Button
            label="Adjust stock"
            size="small"
            variant="link"
            class="mt-1 px-0"
            @click="isStockDialogVisible = true"
          />
        </div>
      </section>

      <ProductForm :key="product.id" :product="product" @saved="handleSaved" />
      <ProductImagesManager :product="product" />
      <StockAdjustDialog v-model:visible="isStockDialogVisible" :product="product" />
    </template>
  </section>
</template>
