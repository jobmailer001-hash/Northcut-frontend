// Mirrors the backend's limits and statuses in user.constants.js.
export const MAX_ADDRESSES_PER_USER = 10

export const UserStatuses = {
  ACTIVE: 'ACTIVE',
  DISABLED: 'DISABLED',
}

export const customerStatusSeverities = {
  [UserStatuses.ACTIVE]: 'success',
  [UserStatuses.DISABLED]: 'danger',
}

export const customerStatusOptions = [
  { label: 'Active', value: UserStatuses.ACTIVE },
  { label: 'Disabled', value: UserStatuses.DISABLED },
]
