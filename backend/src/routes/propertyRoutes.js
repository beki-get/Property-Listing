
import { Router } from 'express';
import * as propertyController from '../controllers/propertyController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  createPropertySchema,
  updatePropertySchema,
  getPropertiesQuerySchema,
} from '../zodValidation/propertySchema.js';

const propertyRouter = Router();

// PUBLIC / USER ROUTES

propertyRouter.get(
  '/',
  validateRequest(getPropertiesQuerySchema),
  propertyController.handleGetAllProperties
);

propertyRouter.get('/:id', propertyController.handleGetPropertyById);


// OWNER-ONLY ROUTES 

// Create a draft 
propertyRouter.post(
  '/',
  protect,
  restrictTo('owner'),
  validateRequest(createPropertySchema),
  propertyController.handleCreateProperty
);

//Get all properties owned by logged-in owner
propertyRouter.get(
  '/my-properties',
  protect,
  restrictTo('owner'),
  propertyController.handleGetMyProperties
);

// Edit draft 
propertyRouter.patch(
  '/:id',
  protect,
  restrictTo('owner'),
  validateRequest(updatePropertySchema),
  propertyController.handleUpdateProperty
);

// Publish property 
propertyRouter.patch(
  '/:id/publish',
  protect,
  restrictTo('owner'),
  propertyController.handlePublishProperty
);

// Archive property 
propertyRouter.patch(
  '/:id/archive',
  protect,
  restrictTo('owner'),
  propertyController.handleArchiveProperty
);


// OWNER & ADMIN DELETION

// Soft Delete (Owner deletes own property, Admin can delete any property)
propertyRouter.delete(
  '/:id',
  protect,
  restrictTo('owner', 'admin'),
  propertyController.handleDeleteProperty
);


// ADMIN ONLY ROUTES

// Admin views ALL properties (draft, published, archived, disabled)
propertyRouter.get(
  '/admin/all',
  protect,
  restrictTo('admin'),
  propertyController.handleAdminGetAllProperties
);

// Admin disables a property
propertyRouter.patch(
  '/:id/disable',
  protect,
  restrictTo('admin'),
  propertyController.handleAdminDisableProperty
);
export default propertyRouter;