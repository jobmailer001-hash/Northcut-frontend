import { computed } from 'vue'
import { useRoute } from 'vue-router'

// The product list and detail views are mounted in both the storefront and the admin layout.
// `meta.area` (set once on the /admin parent route) says which one we're in: it decides whether
// admin data and controls are shown, and keeps every product link inside the same area.
export const useProductRoutes = () => {
  const route = useRoute()

  const isAdminArea = computed(() => route.meta.area === 'admin')

  const listRoute = (query) => ({
    name: isAdminArea.value ? 'admin-products' : 'products',
    ...(query && { query }),
  })

  const detailRoute = (slug) => ({
    name: isAdminArea.value ? 'admin-product-detail' : 'product-detail',
    params: { slug },
  })

  return { isAdminArea, listRoute, detailRoute }
}
