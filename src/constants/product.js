export const AvailabilityStatuses = {
  IN_STOCK: 'IN_STOCK',
  PRE_ORDER: 'PRE_ORDER',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
}

export const PublicityStatuses = {
  PUBLIC: 'PUBLIC',
  HIDDEN: 'HIDDEN',
}

// Image upload rules — the backend enforces the same ones.
export const MAX_IMAGES_PER_PRODUCT = 4
export const MAX_IMAGE_UPLOAD_TOTAL_BYTES = 10 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPE = 'image/jpeg'

// Stock at or below this shows "Only N left" on the storefront.
export const LOW_STOCK_THRESHOLD = 5

export const availabilityLabels = {
  [AvailabilityStatuses.IN_STOCK]: 'In stock',
  [AvailabilityStatuses.PRE_ORDER]: 'Pre-order',
  [AvailabilityStatuses.OUT_OF_STOCK]: 'Sold out',
}

// Faded, greyed-out tints for the storefront's bracket labels ([ In stock ]) — a hint of colour,
// never loud. Tailwind classes, kept as full literals so Tailwind can find them.
export const availabilityTones = {
  [AvailabilityStatuses.IN_STOCK]: 'bg-[#d8e4d3] text-[#4c6246]',
  [AvailabilityStatuses.PRE_ORDER]: 'bg-[#d5deea] text-[#4a5b77]',
  [AvailabilityStatuses.OUT_OF_STOCK]: 'bg-[#dcdcdc] text-[#6e6e6e]',
}
export const HIDDEN_LABEL_TONE = 'bg-[#e7dcc9] text-[#6d5e45]'

export const availabilitySeverities = {
  [AvailabilityStatuses.IN_STOCK]: 'success',
  [AvailabilityStatuses.PRE_ORDER]: 'info',
  [AvailabilityStatuses.OUT_OF_STOCK]: 'secondary',
}

export const publicityLabels = {
  [PublicityStatuses.PUBLIC]: 'Public',
  [PublicityStatuses.HIDDEN]: 'Hidden',
}

export const publicitySeverities = {
  [PublicityStatuses.PUBLIC]: 'success',
  [PublicityStatuses.HIDDEN]: 'secondary',
}

// { label, value } lists for PrimeVue Select.
export const availabilityOptions = Object.values(AvailabilityStatuses).map((value) => ({
  label: availabilityLabels[value],
  value,
}))

export const publicityOptions = Object.values(PublicityStatuses).map((value) => ({
  label: publicityLabels[value],
  value,
}))
