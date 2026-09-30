import { z } from 'zod'

// Mirrors northcut-backend/src/app/validators/me.validator.js.

export const currentPasswordSchema = z.string().min(1, 'Current password is required.')

// Required: saved addresses are identified by their label (unique per user — the dialog also checks that).
export const addressLabelSchema = z
  .string()
  .trim()
  .min(1, 'Give this address a label, e.g. Home.')
  .max(40, 'Label must be at most 40 characters.')

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, 'Full name is required.')
  .max(80, 'Full name must be at most 80 characters.')

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s-]{7,20}$/, 'Enter a valid phone number.')

export const addressLine1Schema = z
  .string()
  .trim()
  .min(3, 'Address line 1 is required.')
  .max(120, 'Must be at most 120 characters.')

export const addressLine2Schema = z.string().trim().max(120, 'Must be at most 120 characters.')

export const citySchema = z.string().trim().min(2, 'City is required.').max(60)

export const stateSchema = z.string().trim().min(2, 'State is required.').max(60)

export const countrySchema = z.string().trim().min(2, 'Country is required.').max(60)

export const postalCodeSchema = z.string().trim().max(20, 'Must be at most 20 characters.')
