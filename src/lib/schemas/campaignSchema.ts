import { z } from 'zod';

// Schema for canvas elements
const canvasElementSchema = z.object({
  id: z.string(),
  type: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  rotation: z.number().optional(),
  content: z.any().optional(),
  style: z.record(z.string(), z.any()).optional(),
});

// Schema for modular page
const moduleSchema = z.object({
  id: z.string(),
  type: z.string(),
  props: z.record(z.string(), z.any()).optional(),
  content: z.any().optional(),
});

const modularPageSchema = z.object({
  screens: z.record(z.string(), z.array(moduleSchema)).optional(),
  globalStyles: z.record(z.string(), z.any()).optional(),
});

// Schema for campaign config
export const campaignConfigSchema = z.object({
  canvasConfig: z.object({
    elements: z.array(canvasElementSchema).optional(),
    background: z.string().optional(),
    dimensions: z.object({
      width: z.number(),
      height: z.number(),
    }).optional(),
  }).optional(),
  customImages: z.record(z.string(), z.string()).optional(),
  customFonts: z.array(z.string()).optional(),
  modularPage: modularPageSchema.optional(),
}).passthrough(); // Allow additional fields

// Schema for design
export const campaignDesignSchema = z.object({
  colors: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    accent: z.string().optional(),
    background: z.string().optional(),
    text: z.string().optional(),
  }).optional(),
  fonts: z.object({
    heading: z.string().optional(),
    body: z.string().optional(),
  }).optional(),
  layout: z.string().optional(),
  customImages: z.record(z.string(), z.string()).optional(),
  backgroundImage: z.string().optional(),
  quizConfig: z.any().optional(),
  quizModules: modularPageSchema.optional(),
}).passthrough();

// Schema for game config
export const gameConfigSchema = z.object({
  wheel: z.any().optional(),
  jackpot: z.any().optional(),
  quiz: z.any().optional(),
  scratchCard: z.any().optional(),
}).passthrough();

// Schema for article config
export const articleConfigSchema = z.object({
  content: z.string().optional(),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
}).passthrough();

// Schema for form fields
export const formFieldsSchema = z.array(z.object({
  id: z.string(),
  type: z.string(),
  label: z.string(),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
}));

// Main campaign schema
export const campaignSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Le nom est requis').max(200, 'Le nom est trop long'),
  slug: z.string().optional(),
  type: z.enum(['wheel', 'jackpot', 'quiz', 'scratchCard', 'article']),
  status: z.enum(['draft', 'scheduled', 'active', 'paused', 'ended']).optional(),
  description: z.string().max(500, 'La description est trop longue').optional(),
  thumbnail_url: z.string().url('URL invalide').optional().or(z.literal('')),
  banner_url: z.string().url('URL invalide').optional().or(z.literal('')),
  
  config: campaignConfigSchema.optional(),
  design: campaignDesignSchema.optional(),
  game_config: gameConfigSchema.optional(),
  article_config: articleConfigSchema.optional(),
  form_fields: formFieldsSchema.optional(),
  
  start_date: z.string().datetime().optional().or(z.literal('')),
  end_date: z.string().datetime().optional().or(z.literal('')),
  
  revision: z.number().int().positive().optional(),
  editor_mode: z.enum(['fullscreen', 'article']).optional(),
  
  created_by: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  published_at: z.string().datetime().optional(),
  
  total_participants: z.number().int().nonnegative().optional(),
  total_views: z.number().int().nonnegative().optional(),
}).refine(
  (data) => {
    if (data.start_date && data.end_date) {
      return new Date(data.start_date) < new Date(data.end_date);
    }
    return true;
  },
  {
    message: 'La date de fin doit être après la date de début',
    path: ['end_date'],
  }
);

export type CampaignValidation = z.infer<typeof campaignSchema>;

// Validation helper
export const validateCampaign = (campaign: any) => {
  try {
    return {
      success: true,
      data: campaignSchema.parse(campaign),
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        errors: error.issues.map((e: any) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      };
    }
    return {
      success: false,
      data: null,
      errors: [{ path: 'unknown', message: 'Erreur de validation inconnue' }],
    };
  }
};
