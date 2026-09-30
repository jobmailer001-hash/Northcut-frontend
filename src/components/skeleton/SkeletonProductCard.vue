<script setup>
import Skeleton from 'primevue/skeleton'
</script>

<template>
  <div class="flex flex-col" aria-hidden="true">
    <Skeleton class="aspect-[4/5]!" height="auto" />
    <div class="mt-3 flex flex-col gap-1.5">
      <Skeleton width="30%" height="0.75rem" />
      <Skeleton width="70%" height="0.875rem" />
      <Skeleton width="25%" height="0.875rem" />
    </div>
  </div>
</template>
