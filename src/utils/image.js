// Product images are stored as their original Cloudinary upload URL. Inserting transformations
// after `/image/upload/` makes Cloudinary serve an optimized copy from its CDN instead:
//   f_auto  — the best format the browser supports (WebP/AVIF, else JPEG)
//   q_auto  — automatic compression with no visible quality loss
//   c_limit + w_N — scale down to at most N px wide, never up
// The original is untouched; each variant is generated once and cached.
const CLOUDINARY_HOST = 'res.cloudinary.com'
const UPLOAD_PATH_SEGMENT = '/image/upload/'

// Widths (px) per place an image is shown — about 2× the displayed size, for sharp high-DPI screens.
export const ImageWidths = {
  THUMBNAIL: 200,
  CARD: 600,
  DETAIL: 1200,
}

export const toOptimizedImageUrl = (url, width) => {
  if (!url?.includes(CLOUDINARY_HOST) || !url.includes(UPLOAD_PATH_SEGMENT)) {
    return url
  }
  return url.replace(UPLOAD_PATH_SEGMENT, `${UPLOAD_PATH_SEGMENT}f_auto,q_auto,c_limit,w_${width}/`)
}
