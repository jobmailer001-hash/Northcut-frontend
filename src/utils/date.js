const dateTimeFormatter = new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
const dateFormatter = new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' })
const timeFormatter = new Intl.DateTimeFormat('en-NG', { timeStyle: 'short' })

export const formatDateTime = (isoDate) => (isoDate ? dateTimeFormatter.format(new Date(isoDate)) : '')

export const formatDate = (isoDate) => (isoDate ? dateFormatter.format(new Date(isoDate)) : '')

export const formatTime = (isoDate) => (isoDate ? timeFormatter.format(new Date(isoDate)) : '')
