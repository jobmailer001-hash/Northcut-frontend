import { onScopeDispose, reactive } from 'vue'

const INPUT_VALIDATION_THROTTLE_MS = 2000

export const useFieldValidation = () => {
  // One message per field name; a field with no entry has no error.
  const fieldErrors = reactive({})
  const fieldValidity = reactive({})

  const pendingTimers = {}
  const latestChecks = {}

  // `message` is the error text, or null/empty when the field is valid.
  const setFieldResult = (name, message) => {
    if (message) {
      fieldErrors[name] = message
      fieldValidity[name] = false
      return false
    }
    delete fieldErrors[name]
    fieldValidity[name] = true
    return true
  }

  const getSchemaError = (schema, value) => {
    const result = schema.safeParse(value)
    return result.success ? null : result.error.issues[0].message
  }

  const cancelPending = (name) => {
    clearTimeout(pendingTimers[name])
    delete pendingTimers[name]
    delete latestChecks[name]
  }

  const validateField = (name, schema, value) => setFieldResult(name, getSchemaError(schema, value))

  // Runs `checkFn` (returns an error message or null) at most once per throttle window per
  // field, on the trailing edge, always with the latest value — so typing never flashes errors.
  const throttleValidate = (name, checkFn) => {
    latestChecks[name] = checkFn

    if (pendingTimers[name]) {
      return
    }

    pendingTimers[name] = setTimeout(() => {
      const check = latestChecks[name]
      cancelPending(name)
      setFieldResult(name, check())
    }, INPUT_VALIDATION_THROTTLE_MS)
  }

  const validateFieldOnInput = (name, schema, value) => {
    throttleValidate(name, () => getSchemaError(schema, value))
  }

  // `fields` is `{ name: { schema, value } }`. Validates every field (no short-circuit) so all
  // errors show at once, and drops any pending on-input check that would overwrite the result.
  const validateForm = (fields) => {
    const results = Object.entries(fields).map(([name, { schema, value }]) => {
      cancelPending(name)
      return validateField(name, schema, value)
    })
    return results.every(Boolean)
  }

  // Shows a server VALIDATION_ERROR's per-field messages under the matching fields.
  // Server paths like "pricing.launchPrice" map to the field named by their last segment.
  // Returns whether any field error was applied.
  const applyServerFieldErrors = (err) => {
    const serverFields = err?.code === 'VALIDATION_ERROR' ? (err.details?.fields ?? []) : []
    serverFields.forEach(({ path, message }) => {
      const name = path.split('.').pop()
      cancelPending(name)
      setFieldResult(name, message)
    })
    return serverFields.length > 0
  }

  onScopeDispose(() => {
    Object.keys(pendingTimers).forEach(cancelPending)
  })

  return {
    fieldErrors,
    fieldValidity,
    setFieldResult,
    validateField,
    validateForm,
    validateFieldOnInput,
    throttleValidate,
    applyServerFieldErrors,
  }
}
