<script setup>
import { reactive, ref, watch } from 'vue'
import Button from 'primevue/button'
import ColorPicker from 'primevue/colorpicker'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'

import { useFieldValidation } from '@/composables/useFieldValidation.js'
import { useAdminSiteSettingsStore } from '@/stores/admin/siteSettings.js'
import { DEFAULT_PRIMARY_COLOR, DEFAULT_SECONDARY_COLOR } from '@/utils/siteTheme.js'
import { successToast } from '@/utils/toastService.js'
import { hexColorSchema } from '@/validation/siteSettingsSchemas.js'

// Brand colours. Saving applies them to the whole site straight away (see utils/siteTheme.js).
const props = defineProps({
  colors: { type: Object, required: true },
})

const colorFields = [
  {
    name: 'primary',
    key: 'colorPrimary',
    label: 'Primary colour',
    hint: 'Buttons, selected states, focus rings and badges.',
    defaultValue: DEFAULT_PRIMARY_COLOR,
  },
  {
    name: 'secondary',
    key: 'colorSecondary',
    label: 'Secondary colour',
    hint: 'The storefront footer.',
    defaultValue: DEFAULT_SECONDARY_COLOR,
  },
]

const { updateSiteSettingsRequest } = useAdminSiteSettingsStore()
const { fieldErrors, validateForm, validateFieldOnInput } = useFieldValidation()

const form = reactive({})
const formError = ref('')
const isSaving = ref(false)
const isResetting = ref(false)

// A colour that isn't set shows the theme default it falls back to.
watch(
  () => props.colors,
  (colors) => {
    colorFields.forEach(({ name, defaultValue }) => {
      form[name] = colors[name] ?? defaultValue
    })
  },
  { immediate: true },
)

// ColorPicker (format="hex") works without the leading "#".
const setColorFromPicker = (field, value) => {
  form[field.name] = `#${value}`
  validateFieldOnInput(field.key, hexColorSchema, form[field.name])
}

const handleSave = async () => {
  formError.value = ''
  const isValid = validateForm(
    Object.fromEntries(colorFields.map(({ name, key }) => [key, { schema: hexColorSchema, value: form[name] }])),
  )
  if (!isValid) return

  isSaving.value = true
  try {
    await updateSiteSettingsRequest({
      colors: Object.fromEntries(colorFields.map(({ name }) => [name, form[name].trim().toLowerCase()])),
    })
    successToast('Colours saved.')
  } catch (err) {
    formError.value = err.message
  } finally {
    isSaving.value = false
  }
}

// null = "use the theme default".
const handleReset = async () => {
  formError.value = ''
  isResetting.value = true
  try {
    await updateSiteSettingsRequest({
      colors: Object.fromEntries(colorFields.map(({ name }) => [name, null])),
    })
    successToast('Colours reset to the defaults.')
  } catch (err) {
    formError.value = err.message
  } finally {
    isResetting.value = false
  }
}
</script>

<template>
  <form class="flex flex-col gap-5" novalidate @submit.prevent="handleSave">
    <Message v-if="formError" severity="error">{{ formError }}</Message>

    <div class="grid gap-6 sm:grid-cols-2">
      <div v-for="field in colorFields" :key="field.name" class="flex flex-col gap-2">
        <label :for="`site-${field.name}`" class="text-sm font-medium">{{ field.label }}</label>
        <div class="flex items-center gap-3">
          <ColorPicker
            :model-value="form[field.name].replace('#', '')"
            format="hex"
            :aria-label="`${field.label} picker`"
            @update:model-value="(value) => setColorFromPicker(field, value)"
          />
          <InputText
            :id="`site-${field.name}`"
            v-model="form[field.name]"
            class="w-32 font-mono"
            :invalid="Boolean(fieldErrors[field.key])"
            @update:model-value="(value) => validateFieldOnInput(field.key, hexColorSchema, value)"
          />
        </div>
        <Message v-if="fieldErrors[field.key]" severity="error" size="small" variant="simple">
          {{ fieldErrors[field.key] }}
        </Message>
        <small v-else class="text-surface-500">{{ field.hint }}</small>
      </div>
    </div>

    <div class="flex flex-wrap justify-end gap-2">
      <Button
        label="Reset to defaults"
        severity="secondary"
        variant="outlined"
        :loading="isResetting"
        :disabled="isSaving"
        @click="handleReset"
      />
      <Button type="submit" label="Save colours" :loading="isSaving" :disabled="isResetting" />
    </div>
  </form>
</template>
