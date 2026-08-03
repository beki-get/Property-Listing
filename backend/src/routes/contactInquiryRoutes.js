
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
  restrictTo('user'),
  validateRequest(createInquirySchema),
  inquiryController.handleCreateInquiry
);

//buyer
inquiryRouter.get('/my-inquiries', 
  restrictTo('user'),
  inquiryController.handleGetMySentInquiries);

//owner
inquiryRouter.get('/received', 
   inquiryController.getMyReceivedInquiries);

inquiryRouter.get(
  '/property/:propertyId',
  restrictTo('owner', 'admin'),
  validateRequest(propertyInquiryParamsSchema),
  inquiryController.handleGetPropertyInquiries
);

export default inquiryRouter;