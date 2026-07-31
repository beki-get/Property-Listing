
import * as propertyService from '../services/propertyService.js';

export const handleCreateProperty = async (req, res, next) => {
  try {
    const authenticatedOwnerId = req.user.id;
    const propertyData = req.body;

    const createdProperty = await propertyService.createNewProperty(
      propertyData,
      authenticatedOwnerId
    );

    res.status(201).json({
      status: 'success',
      message: 'Property draft created successfully',
      data: { property: createdProperty },
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetAllProperties = async (req, res, next) => {
  try {
    const queryParameters = req.query;
    const result = await propertyService.fetchPublishedProperties(queryParameters);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetPropertyById = async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    const property = await propertyService.fetchPropertyById(propertyId);

    res.status(200).json({
      status: 'success',
      data: { property },
    });
  } catch (error) {
    next(error);
  }
};

export const handleUpdateProperty = async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    const authenticatedOwnerId = req.user.id;
    const updatePayload = req.body;

    const updatedProperty = await propertyService.updatePropertyDraft(
      propertyId,
      updatePayload,
      authenticatedOwnerId
    );

    res.status(200).json({
      status: 'success',
      message: 'Property updated successfully',
      data: { property: updatedProperty },
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetMyProperties = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const queryParameters = req.query;

    const result = await propertyService.fetchMyProperties(ownerId, queryParameters);

    res.status(200).json({
      status: 'success',
      message: 'Owner properties retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


export const handlePublishProperty = async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    const authenticatedOwnerId = req.user.id;

    const publishedProperty = await propertyService.publishPropertyListing(
      propertyId,
      authenticatedOwnerId
    );

    res.status(200).json({
      status: 'success',
      message: 'Property published successfully',
      data: { property: publishedProperty },
    });
  } catch (error) {
    next(error);
  }
};

export const handleDeleteProperty = async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    const userContext = req.user;

    const deleteResult = await propertyService.removePropertyListing(
      propertyId,
      userContext
    );

    res.status(200).json({
      status: 'success',
      message: deleteResult.message,
    });
  } catch (error) {
    next(error);
  }
};


export const handleArchiveProperty = async (req, res, next) => {
  try {
    const updatedProperty = await propertyService.archivePropertyListing(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      status: 'success',
      message: 'Property archived successfully',
      data: { property: updatedProperty },
    });
  } catch (error) {
    next(error);
  }
};


export const handleAdminGetAllProperties = async (req, res, next) => {
  try {
    const queryParameters = req.query;
    const result = await propertyService.adminFetchAllProperties(queryParameters);

    res.status(200).json({
      status: 'success',
      message: 'Admin property records retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const handleAdminDisableProperty = async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    const { reason } = req.body; 

    const disabledProperty = await propertyService.adminDisablePropertyListing(
      propertyId,
      reason
    );

    res.status(200).json({
      status: 'success',
      message: 'Property listing has been disabled by admin',
      data: { property: disabledProperty },
    });
  } catch (error) {
    next(error);
  }
};