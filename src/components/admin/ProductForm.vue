<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import Message from 'primevue/message'

import ProductBasicsFields from '@/components/admin/ProductBasicsFields.vue'
import ProductSalesFields from '@/components/admin/ProductSalesFields.vue'
import { useFieldValidation } from '@/composables/useFieldValidation.js'
import { AvailabilityStatuses, PublicityStatuses } from '@/constants/product.js'
import { useAdminProductsStore } from '@/stores/admin/products.js'
import { toMajorUnits, toMinorUnits } from '@/utils/money.js'
import { successToast } from '@/utils/toastService.js'
import {
  descriptionSchema,
  launchPriceSchema,
  preorderPriceSchema,
  productNameSchema,
  quantitySchema,
  skuSchema,
  slugSchema,
  tagsSchema,
} from '@/validation/productSchemas.js'

// With `product`, edits its details and emits `saved`; without, creates one and emits `created`.
const props = defineProps({
  product: { type: Object, default: null },
})
const emit = defineEmits(['created', 'saved'])

const { createProductRequest, updateProductRequest } = useAdminProductsStore()
const { fieldErrors, validateForm, validateFieldOnInput, setFieldResult, applyServerFieldErrors } =
  useFieldValidation()

const isEditing = Boolean(props.product)

const schemaByField = {
  name: productNameSchema,
  sku: skuSchema,
  slug: slugSchema,
  description: descriptionSchema,
  launchPrice: launchPriceSchema,
  preorderPrice: preorderPriceSchema,
  stock: quantitySchema,
  preorderLimit: quantitySchema,
}

const buildForm = (product) => ({
  name: product?.name ?? '',
  sku: product?.sku ?? '',
  slug: product?.slug ?? '',
  description: product?.description ?? '',
  tags: [...(product?.tags ?? [])],
  launchPrice: toMajorUnits(product?.pricing.launchPrice),
  preorderPrice: toMajorUnits(product?.pricing.preorderPrice),
  availabilityStatus: product?.availabilityStatus ?? AvailabilityStatuses.OUT_OF_STOCK,
  publicityStatus: product?.publicityStatus ?? PublicityStatuses.HIDDEN,
  stock: 0,
  preorderLimit: product?.preorderLimit ?? 0,
})

const form = ref(buildForm(props.product))
const formError = ref('')
const isSubmitting = ref(false)

const handleFieldInput = (name, value) => {
  if (schemaByField[name]) validateFieldOnInput(name, schemaByField[name], value)
}

const getPreorderPriceError = () => {
  const isPreorder = form.value.availabilityStatus === AvailabilityStatuses.PRE_ORDER
  return isPreorder && !form.value.preorderPrice ? 'Set a pre-order price for pre-order products.' : null
}

const validate = () => {
  const fields = Object.fromEntries(
    Object.entries(schemaByField)
      .filter(([name]) => !(isEditing && (name === 'sku' || name === 'stock')))
      .map(([name, schema]) => [name, { schema, value: form.value[name] }]),
  )
  const areFieldsValid = validateForm({ ...fields, tags: { schema: tagsSchema, value: form.value.tags } })
  const isPreorderPriceValid = fieldErrors.preorderPrice ? false : setFieldResult('preorderPrice', getPreorderPriceError())
  return areFieldsValid && isPreorderPriceValid
}

// Editing leaves visibility out: the Status section's toggle owns it, so saving details
// never overwrites a visibility change made there.
const buildPayload = () => {
  const { sku, slug, stock, launchPrice, preorderPrice, publicityStatus, ...rest } = form.value
  return {
    ...rest,
    ...(slug && { slug }),
    ...(!isEditing && { sku, stock, publicityStatus }),
    pricing: { launchPrice: toMinorUnits(launchPrice), preorderPrice: toMinorUnits(preorderPrice) },
  }
}

const handleSubmit = async () => {
  formError.value = ''
  if (!validate()) return

  isSubmitting.value = true
  try {
    if (isEditing) {
      const { product } = await updateProductRequest(props.product.id, buildPayload())
      form.value = buildForm(product)
      successToast('Product saved.')
      emit('saved', product)
    } else {
      const product = await createProductRequest(buildPayload())
      successToast('Product created. Add some images next.')
      emit('created', product)
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
  <form class="flex flex-col gap-8" novalidate @submit.prevent="handleSubmit">
    <Message v-if="formError" severity="error">{{ formError }}</Message>

    <section class="rounded-lg border border-surface-200 bg-white p-6">
      <h2 class="mb-5 text-lg font-semibold">Details</h2>
      <ProductBasicsFields
        v-model:form="form"
        :field-errors="fieldErrors"
        :is-editing="isEditing"
        @field-input="handleFieldInput"
      />
    </section>

    <section class="rounded-lg border border-surface-200 bg-white p-6">
      <h2 class="mb-5 text-lg font-semibold">Pricing & availability</h2>
      <ProductSalesFields
        v-model:form="form"
        :field-errors="fieldErrors"
        :is-editing="isEditing"
        @field-input="handleFieldInput"
      />
    </section>

    <div class="flex justify-end">
      <Button
        type="submit"
        :label="isEditing ? 'Save changes' : 'Create product'"
        :loading="isSubmitting"
      />
    </div>
  </form>
</template>
