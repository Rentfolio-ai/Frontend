import { z } from 'zod';

export const PropertySearchSchema = z.object({
  location: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  beds: z.number().min(0).optional(),
  baths: z.number().min(0).optional(),
  propertyType: z.enum(['single-family', 'condo', 'townhouse', 'multi-family', 'land']).optional(),
  minCapRate: z.number().min(0).max(100).optional(),
  maxCapRate: z.number().min(0).max(100).optional(),
  minCashOnCash: z.number().min(0).max(100).optional(),
  maxCashOnCash: z.number().min(0).max(100).optional(),
  minYearBuilt: z.number().min(1800).max(new Date().getFullYear()).optional(),
  maxYearBuilt: z.number().min(1800).max(new Date().getFullYear()).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.enum(['price', 'capRate', 'yearBuilt', 'sqft']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const PropertyIdSchema = z.object({
  id: z.string().min(1),
});

export const ReportGenerationSchema = z.object({
  title: z.string().min(1).max(100),
  filters: PropertySearchSchema.omit({ page: true, limit: true, sortBy: true, sortOrder: true }),
});

export type PropertySearchInput = z.infer<typeof PropertySearchSchema>;
export type PropertyIdInput = z.infer<typeof PropertyIdSchema>;
export type ReportGenerationInput = z.infer<typeof ReportGenerationSchema>;
