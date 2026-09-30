import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

import App from './App.vue'
import router from './router'
import { useSiteSettingsStore } from './stores/siteSettings.js'
import './assets/main.css'

// Aura restyled to the brand: monochrome (near-black primary on cool greys) and square corners.
const NorthcutPreset = definePreset(Aura, {
  primitive: {
    borderRadius: { none: '0', xs: '0', sm: '0', md: '0', lg: '0', xl: '0' },
  },
  semantic: {
    primary: {
      50: '{neutral.50}',
      100: '{neutral.100}',
      200: '{neutral.200}',
      300: '{neutral.300}',
      400: '{neutral.400}',
      500: '{neutral.500}',
      600: '{neutral.600}',
      700: '{neutral.700}',
      800: '{neutral.800}',
      900: '{neutral.900}',
      950: '{neutral.950}',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f2f2f2',
          100: '#e9e9e9',
          200: '#dcdcdc',
          300: '#c4c4c4',
          400: '#a3a3a3',
          500: '#8a8a8a',
          600: '#6b6b6b',
          700: '#4a4a4a',
          800: '#2a2a2a',
          900: '#171717',
          950: '#0e0e0e',
        },
        primary: {
          color: '#111111',
          contrastColor: '#ffffff',
          hoverColor: '{neutral.800}',
          activeColor: '{neutral.700}',
        },
        highlight: {
          background: '#111111',
          focusBackground: '{neutral.800}',
          color: '#ffffff',
          focusColor: '#ffffff',
        },
      },
    },
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: NorthcutPreset,
    options: {
      // Dark mode only when `.app-dark` is on <html>, not automatically from the OS.
      darkModeSelector: '.app-dark',
      // PrimeVue styles sit below Tailwind's utilities layer so utility classes win.
      cssLayer: { name: 'primevue', order: 'theme, base, primevue' },
    },
  },
})
app.use(ToastService)
app.use(ConfirmationService)

// Site settings (brand colours, hero images) load before the first render, so the theme never
// flashes from the defaults. If they can't be loaded, the app still starts with the defaults.
const { fetchSiteSettingsRequest } = useSiteSettingsStore()
fetchSiteSettingsRequest()
  .catch(() => {})
  .finally(() => app.mount('#app'))
