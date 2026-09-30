<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'

import { useMockGatewayStore } from '@/stores/mockGateway.js'
import { formatMoney } from '@/utils/money.js'

// DEVELOPMENT ONLY — stands in for a real provider's hosted checkout page. The backend only
// serves /mock-gateway with PAYMENT_PROVIDER=mock outside production.

const route = useRoute()
const mockGatewayStore = useMockGatewayStore()
const { payment } = storeToRefs(mockGatewayStore)
const { fetchMockPaymentRequest, completeMockPaymentRequest } = mockGatewayStore

const isLoading = ref(true)
const loadError = ref('')
const submittingOutcome = ref(null)
const formError = ref('')

const isPending = computed(() => payment.value?.status === 'PENDING')

const complete = async (outcome) => {
  submittingOutcome.value = outcome
  formError.value = ''
  try {
    const { returnUrl } = await completeMockPaymentRequest(route.params.reference, outcome)
    // Back to the store, like a real provider's redirect.
    window.location.assign(returnUrl)
  } catch (err) {
    formError.value = err.message
    submittingOutcome.value = null
  }
}

onMounted(async () => {
  try {
    await fetchMockPaymentRequest(route.params.reference)
  } catch (err) {
    loadError.value = err.message
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-surface-100 px-4 py-12">
    <div class="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-lg">
      <p class="bg-amber-400 px-4 py-2 text-center text-xs font-bold tracking-wide text-amber-950 uppercase">
        Test payment gateway — no real money moves
      </p>

      <div class="flex flex-col gap-5 p-6">
        <p class="text-sm font-semibold text-surface-500">MockPay</p>

        <Message v-if="loadError" severity="error">{{ loadError }}</Message>

        <template v-else-if="isLoading">
          <Skeleton height="2.5rem" width="60%" />
          <Skeleton height="6rem" />
        </template>

        <template v-else>
          <div>
            <p class="text-sm text-surface-500">Pay Northcut</p>
            <p class="text-3xl font-semibold">{{ formatMoney(payment.amount, payment.currency) }}</p>
            <p class="mt-1 truncate text-xs text-surface-400">{{ payment.reference }}</p>
          </div>

          <Message v-if="formError" severity="error">{{ formError }}</Message>

          <template v-if="isPending">
            <Button
              :label="`Pay ${formatMoney(payment.amount, payment.currency)}`"
              :loading="submittingOutcome === 'success'"
              :disabled="Boolean(submittingOutcome)"
              fluid
              @click="complete('success')"
            />
            <Button
              label="Simulate a failed payment"
              severity="secondary"
              variant="outlined"
              :loading="submittingOutcome === 'failure'"
              :disabled="Boolean(submittingOutcome)"
              fluid
              @click="complete('failure')"
            />
          </template>

          <template v-else>
            <Message severity="secondary">This payment is already {{ payment.status.toLowerCase() }}.</Message>
            <Button as="a" :href="payment.returnUrl" label="Return to Northcut" fluid />
          </template>
        </template>
      </div>
    </div>
  </div>
</template>
