
import { z } from 'zod';

export const createPropertySchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Property title is required' })
      .min(3, 'Title must be at least 3 characters long')
      .max(120, 'Title cannot exceed 120 characters')
      .trim(),
    description: z
      .string({ required_error: 'Property description is required' })
      .min(10, 'Description must be at least 10 characters long')
      .trim(),
    location: z
      .string({ required_error: 'Location is required' })
      .min(2, 'Location name is too short')
      .trim(),
    price: z
      .number({ required_error: 'Price is required' })
      .positive('Price must be a positive number'),
    images: z
      .array(z.string().url('Each image must be a valid URL string'))
      .optional()
      .default([]),
  }),
});

export const updatePropertySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid property ID format'),
  }),
  body: z.object({
    title: z.string().min(3).max(120).trim().optional(),
    description: z.string().min(10).trim().optional(),
    location: z.string().min(2).trim().optional(),
    price: z.number().positive().optional(),
    images: z.array(z.string().url()).optional(),
  }),
});


export const getPropertiesQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    location: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    search: z.string().optional(),
  }),
});