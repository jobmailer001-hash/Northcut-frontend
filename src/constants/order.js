// Mirrors the backend's order.constants.js.

export const OrderStatuses = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAID: 'PAID',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
}

export const OrderTypes = {
  NORMAL: 'NORMAL',
  PREORDER: 'PREORDER',
}

export const MAX_CART_ITEMS = 50
export const MAX_QUANTITY_PER_ITEM = 20

export const orderStatusLabels = {
  [OrderStatuses.PENDING_PAYMENT]: 'Awaiting payment',
  [OrderStatuses.PAID]: 'Paid',
  [OrderStatuses.SHIPPED]: 'Shipped',
  [OrderStatuses.DELIVERED]: 'Delivered',
  [OrderStatuses.CANCELLED]: 'Cancelled',
  [OrderStatuses.EXPIRED]: 'Expired',
}

export const orderStatusSeverities = {
  [OrderStatuses.PENDING_PAYMENT]: 'warn',
  [OrderStatuses.PAID]: 'info',
  [OrderStatuses.SHIPPED]: 'info',
  [OrderStatuses.DELIVERED]: 'success',
  [OrderStatuses.CANCELLED]: 'secondary',
  [OrderStatuses.EXPIRED]: 'secondary',
}

// { label, value } lists for PrimeVue Select.
export const orderStatusOptions = Object.values(OrderStatuses).map((value) => ({
  label: orderStatusLabels[value],
  value,
}))

export const orderTypeOptions = [
  { label: 'Normal', value: OrderTypes.NORMAL },
  { label: 'Pre-order', value: OrderTypes.PREORDER },
]

// Customer-facing text for each cart item issue from /cart/preview or CART_REQUIRES_UPDATE.
export const itemIssueMessages = {
  NOT_FOUND: () => 'This product no longer exists.',
  NOT_AVAILABLE: () => "This product isn't available right now.",
  OUT_OF_STOCK: () => 'Sold out.',
  PRE_ORDER_ONLY: () => 'Now pre-order only — order it on its own from the product page.',
  INSUFFICIENT_QUANTITY: ({ availableQuantity }) => `Only ${availableQuantity} left.`,
  INVALID_QUANTITY: ({ maxQuantity }) => `Choose between 1 and ${maxQuantity ?? MAX_QUANTITY_PER_ITEM}.`,
}
