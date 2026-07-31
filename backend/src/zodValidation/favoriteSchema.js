
import { z } from 'zod';


export const favoritePropertySchema = z.object({
  params: z.object({
    propertyId: z.string().uuid('Invalid property ID format'),
  }),
});