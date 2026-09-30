import { z } from 'zod'

// Brand colours are 6-digit hex, e.g. #111111 — the backend enforces the same rule.
export const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Use a 6-digit hex colour, e.g. #111111.')
