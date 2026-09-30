# Project Context

Northcut — clothing-brand e-commerce MVP frontend. One Vue app serving the storefront, auth pages and the `/admin/*` panel. **What** to build lives in `../plan.md` (routes in §8, flows in §5, auth in §3); **how** to write it lives here.

## Stack
- Vue 3 (Composition API + `<script setup>`)
- PrimeVue (UI components) + `@primeuix/themes`
- `@primeicons/vue` (component-based icons)
- Vue Router
- Pinia (state management)
- Vite (build tool)
- Tailwind CSS (`@tailwindcss/vite` + `tailwindcss-primeui`)
- Axios
- Zod (form validation)

## Code Style
- Always use ES Modules (`import`/`export`), never `require()`
- Always use `<script setup>` syntax in Vue SFCs, and always put the `<script setup>` block above the `<template>` block
- Use `const` by default, `let` only when reassignment is needed
- Async/await over `.then()` chains
- Global state, and every function that fetches/manipulates/changes that global state, lives in the relevant Pinia store (a store is what "global" means here). Composables (`src/composables/useXxx.js`) are used when reasonable for reusable logic that *isn't* global state — e.g. `useFieldValidation.js` (form validation).
- Every Pinia store is a **setup store** (Composition API function style: `defineStore('name', () => { ... })` using `ref`/`computed`/plain functions, with an explicit `return {...}`) — never the Options-API object form (`defineStore('name', { state, getters, actions })`). The scaffolded `src/stores/counter.js` is placeholder code, not a pattern to follow.
- Keep components focused — split if a component grows beyond ~150 lines
- Use the (`skeleton-<componentName>`) prefix whenever creating a skeleton loading component with PrimeVue
- All store functions that make API requests must use the camelCase `<name>Request` naming convention (e.g. `loginRequest`, `fetchProductsRequest`, `placeOrderRequest`, `previewCartRequest`)
- Whenever a component uses a ref/state or an action from a Pinia store, destructure it — never access via `store.someRef` or `store.someAction()`. Use `storeToRefs` to destructure reactive state/getters (e.g. `const { user } = storeToRefs(useAuthStore())`), and destructure actions directly off the store instance (e.g. `const { loginRequest } = useAuthStore()`)

## Backend API Reference
`northcut-backend/docs/openapi.yaml` is the source of truth for every endpoint (auth, request/response shapes, data types, error codes) — one hand-written file, with every shape defined once under `components/schemas`. Read it directly, or browse it in Swagger UI at `/api/docs` while the backend runs. `../plan.md` §6 lists every route at a glance. Check these to know what API is available and how to shape requests/responses when wiring up a store action.

Every response uses the envelope `{ data: { ... } }` on success or `{ error: { code, message, details? } }` on failure — read the payload from `data.data.<key>` (e.g. `const { data } = await http.get('/products'); products.value = data.data.products`).

## API Requests (Axios)
Always import and use the pre-configured Axios instance for every API call — never use `axios` directly or `fetch`. The instance lives at `src/api/http.js` and already has the base URL (`/api/v1`, from `VITE_API_URL`), `withCredentials: true` (so the refresh cookie is sent), the `Authorization: Bearer` header from the auth store, and the interceptors set up. There is no `services/` or `*.api.js` layer in this project — store actions call `http` directly.

```js
// Correct
import http from '@/api/http.js'
const { data } = await http.get('/orders')

// Wrong — missing baseURL/credentials/interceptors, and bypasses the store
import axios from 'axios'
const { data } = await axios.get('http://localhost:4000/api/v1/orders')
```

## Auth & session
- The access token lives **in memory only** in the auth store — never in `localStorage`, `sessionStorage` or a cookie. The refresh token is an `httpOnly` cookie the frontend never reads.
- On app start (before the first navigation resolves), call `refreshRequest()` once to restore the session from the cookie; a failure just means "logged out".
- Route access is enforced by `src/router/guards.js` (`requiresAuth`, `requiresAdmin`, `guestOnly`) via route `meta`, never by checks inside views.

## Cart
- The cart store is backed by `localStorage` as `{ items: [{ sku, quantity }] }` — only SKUs and quantities are stored, never names, prices or images.
- Anything shown to the user about cart items (name, image, price, availability, issues) comes from `previewCartRequest()` (`POST /cart/preview`), never from local data.
- When `placeOrderRequest` fails with `CART_REQUIRES_UPDATE`, update the cart/preview from `err.details.items` / `err.details.issues` and send the user to `/cart` to fix it.

## Money
All amounts from the API are integers in minor units (kobo). Display them only through the formatter in `src/utils/money.js` (e.g. `formatMoney(order.total)`) — never divide, round or do float math on money in components.

## Icon creation instructions
When creating an SVG icon component, save it in `src/components/icons/` as `Icon<Name>.vue` (always prefixed with "Icon", e.g. `IconBag.vue`, `IconHeart.vue` — never suffixed like `BagIcon.vue`) using `<script setup>`, define props: `size` (Number, default 16), `fill` (String, default 'none'), `stroke` (String, default 'currentColor'), `strokeWidth` (Number, default 2), bind all props to the `<svg>` tag as `:width="size" :height="size" :fill="fill" :stroke="stroke" :stroke-width="strokeWidth"`, keep `viewBox="0 0 24 24"` static, then export it from `src/components/icons/index.js`. Every SVG — including decorative/illustration ones — is an icon component; never write SVG inline in a template. When using inside PrimeVue components, always inject via the `#icon` slot using `<template #icon>`.

This project's icon package is `@primeicons/vue` (component-based) — **not** the classic `primeicons` CSS package, so there is no `pi pi-*` class and PrimeVue's string `icon="pi pi-trash"` prop renders nothing here. For a stock PrimeVue icon, import the named component (e.g. `import { Trash } from '@primeicons/vue'`) and inject it the same way as a custom icon, via the `#icon` slot: `<Button><template #icon><Trash /></template></Button>`.

## Error handling & toasts
- `src/utils/toastService.js` is a toast singleton: call `setToastInstance(toast)` once, in `App.vue`'s `onMounted` (`const toast = useToast()`), and everywhere else import `successToast` / `errorToast` / `warningToast` / `infoToast` from that file instead of calling `useToast()` per component.
- `src/error/errors.js` defines the typed errors (`NetworkError`, `RequestTimeoutError`, `ApiError`, `SessionExpiredError`); `ApiError` exposes `status`, `code`, `message` and `details` straight from the backend's `error` envelope. `src/error/handleApiError.js` is the default `catch`-block handler for actions that don't need bespoke handling (it toasts an appropriate message based on error type/code, and sends the user to `/login` on `SessionExpiredError`).
- **The Axios response interceptor (in `src/api/http.js`) never handles an error for the user — no toast, no redirect.** It only does three things: normalizes the raw Axios error into one of the typed errors above (so a `catch` block reads `err.message` / `err.code` / `err.details` directly instead of poking at `err.response.data.error`); on a `401` transparently calls `/auth/refresh` once and retries the original request (concurrent 401s share a single in-flight refresh); and if that refresh fails, clears the auth store and rejects with `SessionExpiredError`. Deciding *how* to surface an error (which toast, which message, whether to navigate) is always the job of the first caller that awaited the request (a component's `catch` block, usually via `handleApiError`), never the interceptor.
- Forms that submit to the API (auth forms, checkout, address/profile forms, admin product form, etc.) don't rely on the toast for the failure case — they keep a local `formError` ref, clear it at the start of `handleSubmit`, set it to `err.message` in the `catch` block, and render it as a persistent `<Message severity="error">{{ formError }}</Message>` at the top of the form (above the fields). The toast is reserved for the success case (`successToast(...)`) and for actions outside of a form (list reloads, row actions, add-to-favourites, etc.), where `handleApiError`/`errorToast` is the right call instead of `formError`.

## Form validation
- `src/validation/*.js` exports **per-field** Zod schemas (e.g. `emailSchema`, `passwordSchema`, `phoneSchema`), not one combined object schema per form. A schema used identically by more than one form (e.g. `passwordSchema` for signup, reset-password and change-password) is written once and reused.
- `src/composables/useFieldValidation.js` exposes `fieldErrors`/`fieldValidity` (reactive objects keyed by field name, one message per field — not arrays), `validateField(name, schema, value)`, `validateForm(fields)` (`{ name: { schema, value } }`, used on submit), and `validateFieldOnInput(name, schema, value)`.
- Every field on every form validates on `@input` via `validateFieldOnInput`, not just on submit — but throttled to at most once every 2 seconds while the user keeps typing (trailing edge, so the latest value is always eventually checked), so fast typing doesn't flash an error on every keystroke. A field with a custom (non-schema) check, like confirm-password matching, uses the composable's lower-level `throttleValidate(name, checkFn)` directly instead.
- `validateForm(...)` still runs in full on submit regardless of what's already been validated on input, and the submit handler bails out if it returns `false`.
- A component with more than one form/dialog sharing a single `useFieldValidation()` call (e.g. an admin order view with cancel and status dialogs) must give each dialog's fields distinct names — `fieldErrors`/`fieldValidity` are keyed by name across the *whole* component, so two dialogs both using `reason` would silently clobber each other's error state. Prefix per dialog instead (`cancelReason` vs `statusNote`), and clear that dialog's own keys (`delete fieldErrors.xxx`) when it opens, so a stale error from last time doesn't flash before the user's typed anything.
- Dynamic repeater rows (e.g. product image list, tag list) stay submit-only via an array-shaped Zod schema rather than per-row on-input validation — indexed field names would need cleanup on row removal for little practical benefit on these admin-only inputs.

## File Structure
```
src/
  api/
    http.js       # axios instance + interceptors, in one file — no services/ layer
  assets/
    main.css      # tailwind + primeui
  components/
    icons/        # IconName.vue components + index.js barrel
    skeleton/     # skeleton loading components — see `skeleton-<componentName>` naming above
    auth/         # auth form steps (e.g. the password-reset request/verify/complete forms)
    store/        # storefront components (product card, cart line, address picker…)
    admin/        # admin panel components (tables, forms, status tags…)
    shared/       # used by both: buttons, modals, empty states, money display
  composables/    # reusable non-global logic, e.g. useFieldValidation.js
  constants/      # small shared literals (order statuses, availability, roles, route names)
  error/
    errors.js         # typed error classes
    handleApiError.js # default catch-block handler — see "Error handling & toasts" above
  layouts/
    StoreLayout.vue
    AuthLayout.vue
    AdminLayout.vue
  router/
    index.js
    guards.js     # requiresAuth, requiresAdmin, guestOnly
  stores/         # Pinia — every store action that hits the API, and every
                  # global/shared function, lives here (auth, cart, products,
                  # orders, profile; admin/ for admin-only stores)
  utils/
    toastService.js  # toast singleton — see "Error handling & toasts" above
    money.js         # kobo → display formatting
  validation/     # Zod schemas
  views/
    store/        # Landing, Products, ProductDetail, Cart, Checkout, Orders, OrderDetail, Profile
    auth/         # Login, Signup, ResetPassword
    admin/        # Dashboard, Products, ProductForm, Orders, OrderDetail, Transactions,
                  # TransactionDetail, Customers, CustomerDetail, Profile
  App.vue
  main.js
```

## PrimeVue conventions
- Use PrimeVue components directly, don't wrap them unless adding real logic
- Use Tailwind for layout, not custom CSS grids where avoidable
- Prefer `severity` props and PrimeVue's built-in theming over manual color classes (e.g. map order/transaction statuses to `Tag` severities in one place in `constants/`)

## What I want from Claude Code
- Help with individual components or functions — not full rewrites
- Always explain what changed and why
- Don't modify files I haven't mentioned
- Ask before creating new files
- Keep changes minimal and reviewable
