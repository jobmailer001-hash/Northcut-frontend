import { computed, ref, watch } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import http from '@/api/http.js'
import { useAuthStore } from '@/stores/auth.js'

// The logged-in customer's own data: profile, saved addresses and favourites.
export const useProfileStore = defineStore('profile', () => {
  const { user } = storeToRefs(useAuthStore())

  const profile = ref(null)
  const addresses = ref([])
  const favourites = ref([])
  const favouriteSkus = ref(new Set())
  let favouritesLoad = null

  const defaultAddress = computed(() => addresses.value.find((address) => address.isDefault) ?? null)

  const reset = () => {
    profile.value = null
    addresses.value = []
    favourites.value = []
    favouriteSkus.value = new Set()
    favouritesLoad = null
  }

  // A different (or no) user must never see the previous user's data.
  watch(() => user.value?.id, reset)

  const fetchProfileRequest = async () => {
    const { data } = await http.get('/me')
    profile.value = data.data.profile
  }

  const updateProfileRequest = async ({ name }) => {
    const { data } = await http.patch('/me', { name })
    profile.value = data.data.profile
    // Keep the header's greeting in sync.
    user.value = { ...user.value, name: profile.value.name }
  }

  const fetchAddressesRequest = async () => {
    const { data } = await http.get('/me/addresses')
    addresses.value = data.data.addresses
  }

  const addAddressRequest = async (fields) => {
    const { data } = await http.post('/me/addresses', fields)
    addresses.value = data.data.addresses
    return addresses.value.at(-1)
  }

  const updateAddressRequest = async (addressId, changes) => {
    const { data } = await http.patch(`/me/addresses/${addressId}`, changes)
    addresses.value = data.data.addresses
    return addresses.value.find((address) => address.id === addressId)
  }

  const deleteAddressRequest = async (addressId) => {
    const { data } = await http.delete(`/me/addresses/${addressId}`)
    addresses.value = data.data.addresses
  }

  const fetchFavouritesRequest = async () => {
    const { data } = await http.get('/me/favourites')
    favourites.value = data.data.products
    favouriteSkus.value = new Set(favourites.value.map((product) => product.sku))
  }

  // Loads favourites once per session (for heart buttons); a failed load can be retried.
  const ensureFavouritesLoadedRequest = async () => {
    favouritesLoad ??= fetchFavouritesRequest().catch((err) => {
      favouritesLoad = null
      throw err
    })
    return favouritesLoad
  }

  const isFavourite = (sku) => favouriteSkus.value.has(sku)

  const addFavouriteRequest = async (product) => {
    await http.put(`/me/favourites/${encodeURIComponent(product.sku)}`)
    favouriteSkus.value.add(product.sku)
    if (!favourites.value.some((item) => item.sku === product.sku)) {
      favourites.value.unshift(product)
    }
  }

  const removeFavouriteRequest = async (sku) => {
    await http.delete(`/me/favourites/${encodeURIComponent(sku)}`)
    favouriteSkus.value.delete(sku)
    favourites.value = favourites.value.filter((product) => product.sku !== sku)
  }

  return {
    profile,
    addresses,
    favourites,
    defaultAddress,
    fetchProfileRequest,
    updateProfileRequest,
    fetchAddressesRequest,
    addAddressRequest,
    updateAddressRequest,
    deleteAddressRequest,
    fetchFavouritesRequest,
    ensureFavouritesLoadedRequest,
    isFavourite,
    addFavouriteRequest,
    removeFavouriteRequest,
  }
})
