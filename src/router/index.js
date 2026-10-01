import { createRouter, createWebHistory } from 'vue-router'

import StoreLayout from '@/layouts/StoreLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { authGuard } from './guards.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: StoreLayout,
      children: [
        { path: '', name: 'landing', component: () => import('@/views/store/LandingView.vue') },
        {
          path: 'products',
          name: 'products',
          component: () => import('@/views/store/ProductsView.vue'),
        },
        {
          path: 'products/:slug',
          name: 'product-detail',
          component: () => import('@/views/store/ProductDetailView.vue'),
        },
        // Suggested outfits. Not in the header nav — reached from the landing page's Looks section.
        {
          path: 'looks',
          name: 'looks',
          component: () => import('@/views/store/LooksView.vue'),
        },
        {
          path: 'looks/:slug',
          name: 'look-detail',
          component: () => import('@/views/store/LookDetailView.vue'),
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/store/ProfileView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'favourites',
          name: 'favourites',
          component: () => import('@/views/store/FavouritesView.vue'),
          meta: { requiresAuth: true },
        },
        { path: 'cart', name: 'cart', component: () => import('@/views/store/CartView.vue') },
        {
          path: 'checkout',
          name: 'checkout',
          component: () => import('@/views/store/CheckoutView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'checkout/preorder/:slug',
          name: 'checkout-preorder',
          component: () => import('@/views/store/PreorderCheckoutView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'orders',
          name: 'orders',
          component: () => import('@/views/store/OrdersView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'orders/:orderNumber',
          name: 'order-detail',
          component: () => import('@/views/store/OrderDetailView.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/',
      component: AuthLayout,
      meta: { guestOnly: true },
      children: [
        { path: 'login', name: 'login', component: () => import('@/views/auth/LoginView.vue') },
        { path: 'signup', name: 'signup', component: () => import('@/views/auth/SignupView.vue') },
        {
          path: 'reset-password',
          name: 'reset-password',
          component: () => import('@/views/auth/ResetPasswordView.vue'),
        },
      ],
    },
    {
      path: '/admin',
      component: AdminLayout,
      // `area` is inherited by every child; the shared product views read it (useProductRoutes).
      meta: { requiresAdmin: true, area: 'admin' },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/DashboardView.vue'),
        },
        // The storefront's product list, shown inside the admin layout with admin controls.
        {
          path: 'products',
          name: 'admin-products',
          component: () => import('@/views/store/ProductsView.vue'),
        },
        {
          path: 'products/new',
          name: 'admin-product-new',
          component: () => import('@/views/admin/ProductFormView.vue'),
        },
        // The admin product page: status, details and images, each edited in its own section.
        {
          path: 'products/:slug',
          name: 'admin-product-detail',
          component: () => import('@/views/admin/ProductFormView.vue'),
        },
        // The storefront's looks list, shown inside the admin layout with admin controls.
        {
          path: 'looks',
          name: 'admin-looks',
          component: () => import('@/views/store/LooksView.vue'),
        },
        {
          path: 'looks/new',
          name: 'admin-look-new',
          component: () => import('@/views/admin/LookFormView.vue'),
        },
        // The admin look page: status, details, image and products, each saved on its own.
        {
          path: 'looks/:slug',
          name: 'admin-look-detail',
          component: () => import('@/views/admin/LookFormView.vue'),
        },
        {
          path: 'orders',
          name: 'admin-orders',
          component: () => import('@/views/admin/OrdersView.vue'),
        },
        {
          path: 'orders/:id',
          name: 'admin-order-detail',
          component: () => import('@/views/admin/OrderDetailView.vue'),
        },
        {
          path: 'transactions',
          name: 'admin-transactions',
          component: () => import('@/views/admin/TransactionsView.vue'),
        },
        {
          path: 'transactions/:id',
          name: 'admin-transaction-detail',
          component: () => import('@/views/admin/TransactionDetailView.vue'),
        },
        {
          path: 'customers',
          name: 'admin-customers',
          component: () => import('@/views/admin/CustomersView.vue'),
        },
        {
          path: 'customers/:id',
          name: 'admin-customer-detail',
          component: () => import('@/views/admin/CustomerDetailView.vue'),
        },
        { path: 'logs', name: 'admin-logs', component: () => import('@/views/admin/LogsView.vue') },
        {
          path: 'site-settings',
          name: 'admin-site-settings',
          component: () => import('@/views/admin/SiteSettingsView.vue'),
        },
        {
          path: 'profile',
          name: 'admin-profile',
          component: () => import('@/views/admin/ProfileView.vue'),
        },
      ],
    },
    // Development only: the mock payment provider's checkout page (no store layout — it's "another site").
    {
      path: '/mock-pay/:reference',
      name: 'mock-pay',
      component: () => import('@/views/MockPayView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      component: StoreLayout,
      children: [
        { path: '', name: 'not-found', component: () => import('@/views/NotFoundView.vue') },
      ],
    },
  ],
})

router.beforeEach(authGuard)

export default router
