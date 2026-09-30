import { z } from 'zod'

export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters.')
  .max(80, 'Name must be at most 80 characters.')

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required.')
  .pipe(z.email('Enter a valid email address.'))

// Used for every form that sets a password (signup, reset, change). 72 is bcrypt's limit.
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(72, 'Password must be at most 72 characters.')

// Login only checks presence — the rules may have changed since the password was set.
export const loginPasswordSchema = z.string().min(1, 'Password is required.')

export const resetCodeSchema = z.string().regex(/^\d{6}$/, 'Enter the 6-digit code from the email.')
