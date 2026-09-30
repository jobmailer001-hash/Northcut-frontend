import { z } from 'zod'

// Mirrors northcut-backend/src/app/validators/product.validator.js.
// Prices here are in naira (what the admin types); they're converted to kobo on submit.

export const productNameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters.')
  .max(120, 'Name must be at most 120 characters.')

export const skuSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9-]{3,32}$/, 'SKU must be 3–32 letters, numbers or dashes.')

// Optional: left blank, the server makes one from the name.
export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^([a-z0-9]+(?:-[a-z0-9]+)*)?$/, 'Only lowercase letters, numbers and single dashes.')
  .max(120, 'Slug must be at most 120 characters.')

export const descriptionSchema = z.string().max(5000, 'Description must be at most 5000 characters.')

export const tagsSchema = z
  .array(z.string().trim().min(1).max(30, 'Tags must be at most 30 characters.'))
  .max(20, 'At most 20 tags.')

export const launchPriceSchema = z
  .number({ error: 'Launch price is required.' })
  .positive('Launch price must be more than zero.')

export const preorderPriceSchema = z
  .number()
  .positive('Pre-order price must be more than zero.')
  .nullable()

export const quantitySchema = z
  .number({ error: 'Enter a number.' })
  .int('Must be a whole number.')
  .nonnegative('Can’t be negative.')

export const stockAdjustmentSchema = z
  .number({ error: 'Enter how many units to add or remove.' })
  .int('Must be a whole number.')
  .refine((value) => value !== 0, 'Adjustment can’t be zero.')

export const stockReasonSchema = z.string().trim().max(200, 'Reason must be at most 200 characters.')
