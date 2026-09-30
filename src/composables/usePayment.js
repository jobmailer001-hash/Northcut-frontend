import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { handleApiError } from '@/error/handleApiError.js'
import { useOrdersStore } from '@/stores/orders.js'
import { successToast, warningToast } from '@/utils/toastService.js'

// Sending the customer to the payment provider's hosted checkout. Shared by both checkouts
// (right after placing an order) and the order page ("Pay now" / retry).
export const usePayment = () => {
  const router = useRouter()
  const { startPaymentRequest } = useOrdersStore()
  const isStartingPayment = ref(false)

  // The provider's page is a different site, so this is a full navigation, not a route change.
  const redirectToCheckout = (checkoutUrl) => {
    window.location.assign(checkoutUrl)
  }

  // After placing an order: go pay, or — if payment couldn't be started — land on the order,
  // which offers "Pay now".
  const continueToPayment = ({ order, payment }) => {
    successToast(`Order ${order.orderNumber} placed.`)
    if (payment?.checkoutUrl) {
      redirectToCheckout(payment.checkoutUrl)
      return
    }
    warningToast("We couldn't open payment just now. Use “Pay now” on your order to try again.")
    router.replace({ name: 'order-detail', params: { orderNumber: order.orderNumber } })
  }

  const payForOrder = async (orderNumber) => {
    isStartingPayment.value = true
    try {
      const { checkoutUrl } = await startPaymentRequest(orderNumber)
      redirectToCheckout(checkoutUrl)
    } catch (err) {
      handleApiError(err)
      isStartingPayment.value = false
    }
  }

  return { isStartingPayment, continueToPayment, payForOrder }
}
