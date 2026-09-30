// Only same-app paths are allowed as post-login redirects: "/orders" yes,
// "//evil.com" or "https://evil.com" no (open-redirect protection).
export const getSafeRedirect = (redirect) => {
  if (typeof redirect !== 'string' || !redirect.startsWith('/') || redirect.startsWith('//')) {
    return null
  }
  return redirect
}
