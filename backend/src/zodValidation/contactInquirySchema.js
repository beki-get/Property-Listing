
import { z } from 'zod';

export const createInquirySchema = z.object({
  params: z.object({
    propertyId: z.string().uuid('Invalid property ID format'),
  }),
  body: z.object({
    message: z
      .string({ required_error: 'Inquiry message is required' })
      .min(10, 'Message must be at least 10 characters long')
      .max(1000, 'Message cannot exceed 1000 characters')
      .trim(),
    phone: z
      .string()
      .min(8, 'Please enter a valid phone number')
      .trim(),
      
  }),
});


export const propertyInquiryParamsSchema = z.object({
  params: z.object({
    propertyId: z.string().uuid('Invalid property ID format'),
  }),
});