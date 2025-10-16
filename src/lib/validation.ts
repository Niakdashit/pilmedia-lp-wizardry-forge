import { z } from 'zod';

export const participationFormSchema = z.object({
  email: z.string()
    .email({ message: 'Invalid email address' })
    .max(255, { message: 'Email too long' })
    .trim(),
  prenom: z.string()
    .min(1, { message: 'First name required' })
    .max(100, { message: 'First name too long' })
    .trim()
    .optional(),
  nom: z.string()
    .min(1, { message: 'Last name required' })
    .max(100, { message: 'Last name too long' })
    .trim()
    .optional(),
  telephone: z.string()
    .regex(/^[+]?[0-9\s\-()]+$/, { message: 'Invalid phone number' })
    .max(20, { message: 'Phone number too long' })
    .optional(),
});

export const participationSchema = z.object({
  campaign_id: z.string().uuid(),
  user_email: z.string().email().max(255).trim(),
  form_data: z.record(z.string(), z.any())
    .refine(
      (data) => JSON.stringify(data).length < 10000,
      { message: 'Form data too large' }
    ),
  game_result: z.record(z.string(), z.any()).optional(),
  is_winner: z.boolean().optional(),
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
});

export const viewParamsSchema = z.object({
  utm_source: z.string().max(100).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  utm_medium: z.string().max(100).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  utm_campaign: z.string().max(100).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  referrer: z.string().url().max(500).optional().or(z.literal('')),
});
