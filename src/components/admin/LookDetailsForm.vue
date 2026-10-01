<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Textarea from 'primevue/textarea'

import { useFieldValidation } from '@/composables/useFieldValidation.js'
import { useAdminLooksStore } from '@/stores/admin/looks.js'
import { successToast } from '@/utils/toastService.js'
import { descriptionSchema, productNameSchema, slugSchema } from '@/validation/productSchemas.js'

// With `lookItem`, edits its name, slug and description and emits `saved`; without, creates
// a (hidden) look and emits `created`. Products, image and visibility have their own sections.
const props = defineProps({
  lookItem: { type: Object, default: null },
})
const emit = defineEmits(['created', 'saved'])

const { createLookRequest, updateLookRequest } = useAdminLooksStore()
const { fieldErrors, validateForm, validateFieldOnInput, applyServerFieldErrors } = useFieldValidation()

const isEditing = Boolean(props.lookItem)

// Looks share the product rules for these fields (and the backend validates them the same way).
const schemaByField = {
  name: productNameSchema,
  slug: slugSchema,
  description: descriptionSchema,
}

const buildForm = (lookItem) => ({
  name: lookItem?.name ?? '',
  slug: lookItem?.slug ?? '',
  description: lookItem?.description ?? '',
})

const form = ref(buildForm(props.lookItem))
const formError = ref('')
const isSubmitting = ref(false)

const handleFieldInput = (name, value) => {
  validateFieldOnInput(name, schemaByField[name], value)
}

const handleSubmit = async () => {
  formError.value = ''
  const fields = Object.fromEntries(
    Object.entries(schemaByField).map(([name, schema]) => [name, { schema, value: form.value[name] }]),
  )
  if (!validateForm(fields)) return

  const { slug, ...rest } = form.value
  const payload = { ...rest, ...(slug && { slug }) }

  isSubmitting.value = true
  try {
    if (isEditing) {
      const savedLook = await updateLookRequest(props.lookItem.id, payload)
      form.value = buildForm(savedLook)
      successToast('Look saved.')
      emit('saved', savedLook)
    } else {
      const createdLook = await createLookRequest(payload)
      successToast('Look created. Add its products and image next.')
      emit('created', createdLook)
    }
  } catch (err) {
    applyServerFieldErrors(err)
    formError.value = err.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="flex flex-col gap-5 border border-surface-200 bg-surface-0 p-6" novalidate @submit.prevent="handleSubmit">
    <h2 class="text-lg font-medium">Details</h2>
    <Message v-if="formError" severity="error">{{ formError }}</Message>

    <div class="grid gap-5 md:grid-cols-2">
      <div class="flex flex-col gap-2">
        <label for="look-name" class="text-sm font-medium">Name</label>
        <InputText
          id="look-name"
          v-model="form.name"
          :invalid="Boolean(fieldErrors.name)"
          fluid
          @update:model-value="(value) => handleFieldInput('name', value)"
        />
        <Message v-if="fieldErrors.name" severity="error" size="small" variant="simple">
          {{ fieldErrors.name }}
        </Message>
      </div>

      <div class="flex flex-col gap-2">
        <label for="look-slug" class="text-sm font-medium">URL slug</label>
        <InputText
          id="look-slug"
          v-model="form.slug"
          :placeholder="isEditing ? '' : 'Made from the name if left blank'"
          :invalid="Boolean(fieldErrors.slug)"
          fluid
          @update:model-value="(value) => handleFieldInput('slug', value)"
        />
        <Message v-if="fieldErrors.slug" severity="error" size="small" variant="simple">
          {{ fieldErrors.slug }}
        </Message>
      </div>

      <div class="flex flex-col gap-2 md:col-span-2">
        <label for="look-description" class="text-sm font-medium">Description</label>
        <Textarea
          id="look-description"
          v-model="form.description"
          rows="4"
          auto-resize
          placeholder="How to wear it, what occasion it suits…"
          :invalid="Boolean(fieldErrors.description)"
          fluid
          @update:model-value="(value) => handleFieldInput('description', value)"
        />
        <Message v-if="fieldErrors.description" severity="error" size="small" variant="simple">
          {{ fieldErrors.description }}
        </Message>
      </div>
    </div>

    <div class="flex justify-end">
      <Button type="submit" :label="isEditing ? 'Save details' : 'Create look'" :loading="isSubmitting" />
    </div>
  </form>
</template>
