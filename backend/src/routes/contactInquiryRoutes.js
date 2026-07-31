
import { Router } from 'express';
import * as inquiryController from '../controllers/contactInquiryController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  createInquirySchema,
  propertyInquiryParamsSchema,
} from '../zodValidation/contactInquirySchema.js';

const inquiryRouter = Router();

inquiryRouter.use(protect);

inquiryRouter.post(
  '/:propertyId',
  validateRequest(createInquirySchema),
  inquiryController.handleCreateInquiry
);

inquiryRouter.get('/my-inquiries', 
  inquiryController.handleGetMySentInquiries);

inquiryRouter.get(
  '/property/:propertyId',
  restrictTo('owner', 'admin'),
  validateRequest(propertyInquiryParamsSchema),
  inquiryController.handleGetPropertyInquiries
);

export default inquiryRouter;