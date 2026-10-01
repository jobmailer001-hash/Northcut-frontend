<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ArrowUpRight } from '@primeicons/vue'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'

import LookDetailsForm from '@/components/admin/LookDetailsForm.vue'
import LookImageUploader from '@/components/admin/LookImageUploader.vue'
import LookProductsManager from '@/components/admin/LookProductsManager.vue'
import PublicityToggle from '@/components/admin/PublicityToggle.vue'
import BackLink from '@/components/shared/BackLink.vue'
import { PublicityStatuses } from '@/constants/product.js'
import { handleApiError } from '@/error/handleApiError.js'
import { useAdminLooksStore } from '@/stores/admin/looks.js'
import { successToast } from '@/utils/toastService.js'

// Serves /admin/looks/new (create) and /admin/looks/:slug — the admin look page, where a look
// is managed in separate sections: status, details, image and products.
const LIST_ROUTE = { name: 'admin-looks' }

const route = useRoute()
const router = useRouter()
const adminLooksStore = useAdminLooksStore()
const { look: lookItem } = storeToRefs(adminLooksStore)
const { fetchAdminLookBySlugRequest, updateLookRequest } = adminLooksStore

const slug = computed(() => route.params.slug)
const isEditing = computed(() => Boolean(slug.value))
const isLoading = ref(false)
const loadError = ref('')
const isSavingPublicity = ref(false)

const isPublic = computed(() => lookItem.value?.publicityStatus === PublicityStatuses.PUBLIC)
const hasHiddenProducts = computed(() =>
  lookItem.value?.products.some((product) => product.publicityStatus === PublicityStatuses.HIDDEN),
)

const detailRoute = (lookSlug) => ({ name: 'admin-look-detail', params: { slug: lookSlug } })

// Set when the URL follows a slug change after saving: the saved look is already loaded.
let isFollowingSavedSlug = false

const loadLook = async () => {
  if (isFollowingSavedSlug) {
    isFollowingSavedSlug = false
    return
  }
  if (!isEditing.value) return
  isLoading.value = true
  loadError.value = ''
  try {
    await fetchAdminLookBySlugRequest(slug.value)
  } catch (err) {
    loadError.value = err.message
  } finally {
    isLoading.value = false
  }
}

// The toggle saves on its own. The API refuses to publish a look that isn't ready
// (no products, hidden products or no image) and says why.
const setPublicity = async (shouldBePublic) => {
  isSavingPublicity.value = true
  try {
    await updateLookRequest(lookItem.value.id, {
      publicityStatus: shouldBePublic ? PublicityStatuses.PUBLIC : PublicityStatuses.HIDDEN,
    })
    successToast(shouldBePublic ? 'Look is now public.' : 'Look is now hidden.')
  } catch (err) {
    handleApiError(err)
  } finally {
    isSavingPublicity.value = false
  }
}

const handleCreated = (createdLook) => {
  router.replace(detailRoute(createdLook.slug))
}

// The page is addressed by slug, so a renamed slug moves the URL with it.
const handleSaved = (savedLook) => {
  if (savedLook.slug !== slug.value) {
    isFollowingSavedSlug = true
    router.replace(detailRoute(savedLook.slug))
  }
}

watch(slug, loadLook, { immediate: true })
</script>

<template>
  <section class="mx-auto flex max-w-4xl flex-col gap-6">
    <template v-if="!isEditing">
      <div class="flex flex-col gap-2">
        <BackLink :fallback="LIST_ROUTE" />
        <h1 class="text-2xl font-medium">New look</h1>
        <p class="text-sm text-surface-500">
          Name the outfit first — you'll add its products and image next.
        </p>
      </div>
      <LookDetailsForm @created="handleCreated" />
    </template>

    <Message v-else-if="loadError" severity="error">{{ loadError }}</Message>

    <template v-else-if="isLoading || !lookItem">
      <Skeleton height="2rem" width="16rem" />
      <Skeleton height="6rem" />
      <Skeleton height="24rem" />
    </template>

    <template v-else>
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div class="flex flex-col gap-2">
          <BackLink :fallback="LIST_ROUTE" />
          <h1 class="text-2xl font-medium">{{ lookItem.name }}</h1>
          <p class="text-sm text-surface-500">{{ lookItem.products.length }} item(s)</p>
        </div>
        <RouterLink
          v-if="isPublic"
          :to="{ name: 'look-detail', params: { slug: lookItem.slug } }"
          target="_blank"
          class="flex items-center gap-1 text-sm text-surface-500 hover:text-surface-900"
        >
          View in store <ArrowUpRight :size="12" />
        </RouterLink>
      </div>

      <!-- Status: visibility, saved by its own action. -->
      <section class="flex flex-col gap-3 border border-surface-200 bg-surface-0 p-6">
        <PublicityToggle :is-public="isPublic" :is-saving="isSavingPublicity" @change="setPublicity" />
        <p class="text-sm text-surface-500">
          {{
            isPublic
              ? 'Customers can see this look.'
              : "Customers can't see this look. To publish it, it needs products — all of them public — and its image."
          }}
        </p>
        <Message v-if="hasHiddenProducts" severity="warn" size="small">
          Some products in this look are hidden. Make them public (or remove them) before publishing.
        </Message>
        <Message v-if="!lookItem.imageUrl" severity="warn" size="small">
          Upload the look's image before publishing.
        </Message>
      </section>

      <LookDetailsForm :key="lookItem.id" :look-item="lookItem" @saved="handleSaved" />
      <LookImageUploader :key="lookItem.id" :look-item="lookItem" />
      <LookProductsManager :look-item="lookItem" />
    </template>
  </section>
</template>
