// Mirrors the backend's transaction.constants.js.

export const TransactionTypes = {
  PAYMENT: 'PAYMENT',
  REFUND: 'REFUND',
}

export const TransactionStatuses = {
  PENDING: 'PENDING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
}

export const transactionStatusSeverities = {
  [TransactionStatuses.PENDING]: 'warn',
  [TransactionStatuses.SUCCEEDED]: 'success',
  [TransactionStatuses.FAILED]: 'danger',
  [TransactionStatuses.EXPIRED]: 'secondary',
}

export const transactionTypeOptions = Object.values(TransactionTypes).map((value) => ({
  label: value === TransactionTypes.PAYMENT ? 'Payment' : 'Refund',
  value,
}))

export const transactionStatusOptions = Object.values(TransactionStatuses).map((value) => ({
  label: value.charAt(0) + value.slice(1).toLowerCase(),
  value,
}))
