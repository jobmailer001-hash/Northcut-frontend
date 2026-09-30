<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import TabPanel from 'primevue/tabpanel'
import TabPanels from 'primevue/tabpanels'
import Tabs from 'primevue/tabs'

import BackLink from '@/components/shared/BackLink.vue'
import AddressBook from '@/components/store/AddressBook.vue'
import ChangePasswordForm from '@/components/store/ChangePasswordForm.vue'
import FavouritesList from '@/components/store/FavouritesList.vue'
import ProfileDetailsForm from '@/components/store/ProfileDetailsForm.vue'
import { useLogout } from '@/composables/useLogout.js'
import { useProfileStore } from '@/stores/profile.js'

const ProfileTabs = { ACCOUNT: 'account', ADDRESSES: 'addresses', FAVOURITES: 'favourites' }

const route = useRoute()
const router = useRouter()
const profileStore = useProfileStore()
const { profile } = storeToRefs(profileStore)
const { fetchProfileRequest, fetchAddressesRequest } = profileStore
const { logout, isLoggingOut } = useLogout()

const isLoading = ref(true)
const loadError = ref('')

// The active tab lives in the URL (?tab=addresses) so it can be linked to and survives reloads.
const activeTab = computed({
  get: () =>
    Object.values(ProfileTabs).includes(route.query.tab) ? route.query.tab : ProfileTabs.ACCOUNT,
  set: (tab) => router.replace({ query: { ...route.query, tab } }),
})

onMounted(async () => {
  try {
    await Promise.all([fetchProfileRequest(), fetchAddressesRequest()])
  } catch (err) {
    loadError.value = err.message
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section class="mx-auto flex max-w-4xl flex-col gap-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="flex flex-col gap-2">
        <BackLink :fallback="{ name: 'landing' }" />
        <h1 class="text-3xl font-semibold">My account</h1>
      </div>
      <!-- The only place to log out. -->
      <Button
        label="Log out"
        severity="secondary"
        variant="outlined"
        :loading="isLoggingOut"
        @click="logout"
      />
    </div>

    <Message v-if="loadError" severity="error">{{ loadError }}</Message>

    <template v-else-if="isLoading || !profile">
      <Skeleton height="2.5rem" width="20rem" />
      <Skeleton height="16rem" />
    </template>

    <Tabs v-else v-model:value="activeTab">
      <TabList>
        <Tab :value="ProfileTabs.ACCOUNT">Account</Tab>
        <Tab :value="ProfileTabs.ADDRESSES">Addresses</Tab>
        <Tab :value="ProfileTabs.FAVOURITES">Favourites</Tab>
      </TabList>
      <TabPanels>
        <TabPanel :value="ProfileTabs.ACCOUNT">
          <div class="grid gap-10 pt-4 md:grid-cols-2">
            <ProfileDetailsForm :profile="profile" />
            <ChangePasswordForm />
          </div>
        </TabPanel>
        <TabPanel :value="ProfileTabs.ADDRESSES">
          <div class="pt-4"><AddressBook /></div>
        </TabPanel>
        <TabPanel :value="ProfileTabs.FAVOURITES">
          <div class="pt-4"><FavouritesList /></div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </section>
</template>
