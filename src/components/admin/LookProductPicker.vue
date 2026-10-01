<script setup>
import { storeToRefs } from 'pinia'
import { Check, Image as ImageIcon, Plus, Search } from '@primeicons/vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Tag from 'primevue/tag'

import { useAdminList } from '@/composables/useAdminList.js'
import {
  availabilityLabels,
  availabilityOptions,
  availabilitySeverities,
  publicityLabels,
  publicityOptions,
  publicitySeverities,
} from '@/constants/product.js'
import { useAdminLooksStore } from '@/stores/admin/looks.js'
import { ImageWidths, toOptimizedImageUrl } from '@/utils/image.js'

const PAGE_SIZE = 10

// Every product, page by page, with search and filters, to add to the look. Emits `add` with
// the chosen product; the parent saves it.
defineProps({
  addedSkus: { type: Array, required: true },
  isFull: { type: Boolean, default: false },
  isSaving: { type: Boolean, default: false },
})
const emit = defineEmits(['add'])

const adminLooksStore = useAdminLooksStore()
const { productChoices, productChoicesPagination } = storeToRefs(adminLooksStore)
const { fetchProductChoicesRequest } = adminLooksStore

const { filters, first, isLoading, handlePage } = useAdminList({
  fetch: fetchProductChoicesRequest,
  pageSize: PAGE_SIZE,
  filters: { search: '', availabilityStatus: null, publicityStatus: null },
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap gap-3">
      <IconField class="w-full sm:w-64">
        <InputIcon><Search :size="16" /></InputIcon>
        <InputText v-model="filters.search" placeholder="Search name or SKU" fluid />
      </IconField>
      <Select
        v-model="filters.availabilityStatus"
        :options="availabilityOptions"
        option-label="label"
        option-value="value"
        placeholder="Any availability"
        show-clear
        class="w-44"
      />
      <Select
        v-model="filters.publicityStatus"
        :options="publicityOptions"
        option-label="label"
        option-value="value"
        placeholder="Any visibility"
        show-clear
        class="w-40"
      />
    </div>

    <DataTable
      :value="productChoices"
      :loading="isLoading"
      lazy
      paginator
      :rows="PAGE_SIZE"
      :first="first"
      :total-records="productChoicesPagination?.total ?? 0"
      data-key="id"
      size="small"
      @page="handlePage"
    >
      <template #empty>No products match.</template>
      <Column header="Product">
        <template #body="{ data }">
          <div class="flex items-center gap-3">
            <div class="size-10 shrink-0 overflow-hidden bg-surface-100">
              <img
                v-if="data.images[0]"
                :src="toOptimizedImageUrl(data.images[0].url, ImageWidths.THUMBNAIL)"
                alt=""
                class="size-full object-cover"
              />
              <div v-else class="flex size-full items-center justify-center">
                <ImageIcon :size="16" color="var(--p-surface-400)" />
              </div>
            </div>
            <div class="flex min-w-0 flex-col">
              <span class="truncate">{{ data.name }}</span>
              <span class="text-xs text-surface-500">{{ data.sku }}</span>
            </div>
          </div>
        </template>
      </Column>
      <Column header="Availability">
        <template #body="{ data }">
          <Tag
            :value="availabilityLabels[data.availabilityStatus]"
            :severity="availabilitySeverities[data.availabilityStatus]"
          />
        </template>
      </Column>
      <Column header="Visibility">
        <template #body="{ data }">
          <Tag :value="publicityLabels[data.publicityStatus]" :severity="publicitySeverities[data.publicityStatus]" />
        </template>
      </Column>
      <Column header="" class="w-px whitespace-nowrap">
        <template #body="{ data }">
          <Button
            v-if="addedSkus.includes(data.sku)"
            label="Added"
            size="small"
            severity="secondary"
            variant="text"
            disabled
          >
            <template #icon><Check :size="14" /></template>
          </Button>
          <Button
            v-else
            label="Add"
            size="small"
            variant="outlined"
            :disabled="isFull || isSaving"
            @click="emit('add', data)"
          >
            <template #icon><Plus :size="14" /></template>
          </Button>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
