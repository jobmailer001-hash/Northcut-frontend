const TOAST_LIFE_MS = 4000

let toastInstance = null

// Called once from App.vue's onMounted with the result of useToast().
export const setToastInstance = (toast) => {
  toastInstance = toast
}

const showToast = (severity, detail, summary) => {
  toastInstance?.add({ severity, summary, detail, life: TOAST_LIFE_MS })
}

export const successToast = (detail, summary = 'Success') => showToast('success', detail, summary)

export const errorToast = (detail, summary = 'Error') => showToast('error', detail, summary)

export const warningToast = (detail, summary = 'Warning') => showToast('warn', detail, summary)

export const infoToast = (detail, summary = 'Info') => showToast('info', detail, summary)
