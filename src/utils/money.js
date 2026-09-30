const KOBO_PER_NAIRA = 100

const formatters = new Map()

const getFormatter = (currency) => {
  if (!formatters.has(currency)) {
    formatters.set(currency, new Intl.NumberFormat('en-NG', { style: 'currency', currency }))
  }
  return formatters.get(currency)
}

// The API sends and receives every amount as an integer in minor units (kobo).
// These are the only places that convert, so components never do money math.

export const formatMoney = (amountInMinorUnits, currency = 'NGN') => {
  return getFormatter(currency).format(amountInMinorUnits / KOBO_PER_NAIRA)
}

// Integer kobo × integer quantity, so it stays exact.
export const calculateLineTotal = (unitPriceInMinorUnits, quantity) => unitPriceInMinorUnits * quantity

// For money inputs, which edit naira: kobo → naira to show, naira → kobo to send.
export const toMajorUnits = (amountInMinorUnits) => {
  return amountInMinorUnits == null ? null : amountInMinorUnits / KOBO_PER_NAIRA
}

export const toMinorUnits = (amountInMajorUnits) => {
  return amountInMajorUnits == null ? null : Math.round(amountInMajorUnits * KOBO_PER_NAIRA)
}
