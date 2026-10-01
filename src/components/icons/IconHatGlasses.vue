<script setup>
defineProps({
  size: { type: Number, default: 16 },
  fill: { type: String, default: 'none' },
  stroke: { type: String, default: 'currentColor' },
  strokeWidth: { type: Number, default: 2 },
})
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    :width="size"
    :height="size"
    :fill="fill"
    :stroke="stroke"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="m6 10 1.5-5.4a1.5 1.5 0 0 1 1.9-1l1.6.5a3 3 0 0 0 2 0l1.6-.5a1.5 1.5 0 0 1 1.9 1L18 10" />
    <path d="M2 10h20" />
    <circle cx="7" cy="17" r="3" />
    <circle cx="17" cy="17" r="3" />
    <path d="M10 16.5a2 2 0 0 1 4 0" />
  </svg>
</template>
