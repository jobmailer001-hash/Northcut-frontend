<script setup>
import { ref } from 'vue'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import TabPanel from 'primevue/tabpanel'
import TabPanels from 'primevue/tabpanels'
import Tabs from 'primevue/tabs'

import SystemLogsTable from '@/components/admin/SystemLogsTable.vue'
import UserLogsTable from '@/components/admin/UserLogsTable.vue'
import BackLink from '@/components/shared/BackLink.vue'

const activeTab = ref('system')
</script>

<template>
  <section class="flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <BackLink :fallback="{ name: 'admin-dashboard' }" />
      <h1 class="text-2xl font-semibold">Logs</h1>
      <p class="text-sm text-surface-500">
        System events are what the store did on its own (expiries, payments, refunds). User activity is what
        customers and admins did.
      </p>
    </div>

    <!-- `lazy` renders a panel (and loads its data) only when first opened. -->
    <Tabs v-model:value="activeTab" lazy>
      <TabList>
        <Tab value="system">System events</Tab>
        <Tab value="users">User activity</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="system"><SystemLogsTable /></TabPanel>
        <TabPanel value="users"><UserLogsTable /></TabPanel>
      </TabPanels>
    </Tabs>
  </section>
</template>
