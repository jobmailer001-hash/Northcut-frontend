<script setup>
import AutoComplete from 'primevue/autocomplete'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Textarea from 'primevue/textarea'

const form = defineModel('form', { type: Object, required: true })

defineProps({
  fieldErrors: { type: Object, required: true },
  isEditing: { type: Boolean, default: false },
})
const emit = defineEmits(['field-input'])
</script>

<template>
  <div class="grid gap-5 md:grid-cols-2">
    <div class="flex flex-col gap-2 md:col-span-2">
      <label for="product-name" class="text-sm font-medium">Name</label>
      <InputText
        id="product-name"
        v-model="form.name"
        :invalid="Boolean(fieldErrors.name)"
        fluid
        @update:model-value="(value) => emit('field-input', 'name', value)"
      />
      <Message v-if="fieldErrors.name" severity="error" size="small" variant="simple">
        {{ fieldErrors.name }}
      </Message>
    </div>

    <div class="flex flex-col gap-2">
      <label for="product-sku" class="text-sm font-medium">SKU</label>
      <InputText
        id="product-sku"
        v-model="form.sku"
        :disabled="isEditing"
        :invalid="Boolean(fieldErrors.sku)"
        class="uppercase"
        fluid
        @update:model-value="(value) => emit('field-input', 'sku', value)"
      />
      <Message v-if="fieldErrors.sku" severity="error" size="small" variant="simple">
        {{ fieldErrors.sku }}
      </Message>
      <small v-else class="text-surface-500">
        {{ isEditing ? "SKUs can't be changed." : 'Permanent once created.' }}
      </small>
    </div>

    <div class="flex flex-col gap-2">
      <label for="product-slug" class="text-sm font-medium">URL slug</label>
      <InputText
        id="product-slug"
        v-model="form.slug"
        :placeholder="isEditing ? '' : 'Made from the name if left blank'"
        :invalid="Boolean(fieldErrors.slug)"
        fluid
        @update:model-value="(value) => emit('field-input', 'slug', value)"
      />
      <Message v-if="fieldErrors.slug" severity="error" size="small" variant="simple">
        {{ fieldErrors.slug }}
      </Message>
    </div>

    <div class="flex flex-col gap-2 md:col-span-2">
      <label for="product-description" class="text-sm font-medium">Description</label>
      <Textarea
        id="product-description"
        v-model="form.description"
        rows="5"
        auto-resize
        :invalid="Boolean(fieldErrors.description)"
        fluid
        @update:model-value="(value) => emit('field-input', 'description', value)"
      />
      <Message v-if="fieldErrors.description" severity="error" size="small" variant="simple">
        {{ fieldErrors.description }}
      </Message>
    </div>

    <div class="flex flex-col gap-2 md:col-span-2">
      <label for="product-tags" class="text-sm font-medium">Tags</label>
      <AutoComplete
        v-model="form.tags"
        input-id="product-tags"
        multiple
        :typeahead="false"
        :invalid="Boolean(fieldErrors.tags)"
        fluid
      />
      <Message v-if="fieldErrors.tags" severity="error" size="small" variant="simple">
        {{ fieldErrors.tags }}
      </Message>
      <small v-else class="text-surface-500">Type a tag and press Enter. Used for storefront filters.</small>
    </div>
  </div>
</template>
