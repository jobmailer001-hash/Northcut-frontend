import { updatePreset } from '@primeuix/themes'

// The theme's own colours (main.js preset / main.css), used when the admin hasn't set one.
export const DEFAULT_PRIMARY_COLOR = '#111111'
export const DEFAULT_SECONDARY_COLOR = '#0e0e0e'

const DARK_TEXT = '#111111'
const LIGHT_TEXT = '#ffffff'

// Black or white — whichever reads better on `hex` (WCAG relative luminance).
const getContrastText = (hex) => {
  const [red, green, blue] = [1, 3, 5].map((start) => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue
  return luminance > 0.4 ? DARK_TEXT : LIGHT_TEXT
}

// Applies the site's brand colours; `null` falls back to the theme default.
//   primary   → PrimeVue's primary colour (buttons, selected states, focus rings, badges)
//   secondary → the storefront footer background (CSS variables used in StoreLayout)
export const applySiteColors = ({ primary, secondary }) => {
  const primaryColor = primary ?? DEFAULT_PRIMARY_COLOR
  const primaryText = getContrastText(primaryColor)

  updatePreset({
    semantic: {
      colorScheme: {
        light: {
          primary: {
            color: primaryColor,
            contrastColor: primaryText,
            hoverColor: `color-mix(in srgb, ${primaryColor} 85%, ${primaryText})`,
            activeColor: `color-mix(in srgb, ${primaryColor} 75%, ${primaryText})`,
          },
          highlight: {
            background: primaryColor,
            focusBackground: `color-mix(in srgb, ${primaryColor} 85%, ${primaryText})`,
            color: primaryText,
            focusColor: primaryText,
          },
        },
      },
    },
  })

  const secondaryColor = secondary ?? DEFAULT_SECONDARY_COLOR
  const rootStyle = document.documentElement.style
  rootStyle.setProperty('--site-secondary', secondaryColor)
  rootStyle.setProperty('--site-secondary-contrast', getContrastText(secondaryColor))
}
