
import prisma from '../config/db.js';
import { AppError } from '../error/AppError.js';

/**
* This service module provides functions to manage property listings in the system. It includes functionalities for both regular users (property owners & buyers) and administrator. The services include:
 * Creates a new property in 'draft' status owned by the authenticated owner
 * Retrieves public (published) properties with search filters and pagination
 * Retrieves a single published property by ID
 * Retrieves all properties owned by the logged in user (draft, published, archived)
 * Updates a draft property owned by the requesting owner
 * Publishes a draft property after verifying required listing fields
 * Performs a soft delete by setting deletedAt timestamp
 * Archives an active property listing (hides from public view)
 * Admin Service: Retrieves ALL properties across all statuses with pagination and filtering
 * Admin Service: Disables/Moderates a property listing for policy violations
 */
export const createNewProperty = async (propertyData, ownerId) => {
  const newProperty = await prisma.property.create({
    data: {
      ...propertyData,
      ownerId: ownerId, 
      status: 'draft', 
    },
  });

  return newProperty;
};


export const fetchPublishedProperties = async (queryParams) => {
  const pageNumber = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limitNumber = Math.max(1, Math.min(100, parseInt(queryParams.limit, 10) || 10));
  const skipCount = (pageNumber - 1) * limitNumber;

  // Build array of AND conditions
  const andConditions = [
    { deletedAt: null },       
    { status: 'published' },
  ];

  // 1. Unified Main Search (Checks Title, Description AND Location)
  if (queryParams.search && queryParams.search.trim() !== '') {
    const searchTerm = queryParams.search.trim();
    andConditions.push({
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { location: { contains: searchTerm, mode: 'insensitive' } }, // FIXED: Location added here!
      ],
    });
  }

  // 2. Separate Location Filter (Only used if explicitly provided without main search)
  if (queryParams.location && queryParams.location.trim() !== '' && !queryParams.search) {
    andConditions.push({
      location: {
        contains: queryParams.location.trim(),
        mode: 'insensitive',
      },
    });
  }

  // 3. Price Filter
  if (queryParams.minPrice || queryParams.maxPrice) {
    const min = parseFloat(queryParams.minPrice);
    const max = parseFloat(queryParams.maxPrice);

    const priceFilter = {};
    if (!isNaN(min)) priceFilter.gte = min;
    if (!isNaN(max)) priceFilter.lte = max;

    if (Object.keys(priceFilter).length > 0) {
      andConditions.push({ price: priceFilter });
    }
  }

  const where = { AND: andConditions };

  const [propertiesList, totalCount] = await Promise.all([
    prisma.property.findMany({
      where,
      skip: skipCount,
      take: limitNumber,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        price: true,
        images: true,
        createdAt: true,
        owner: { select: { id: true, email: true } },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties: propertiesList,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
      totalProperties: totalCount,
      limit: limitNumber,
    },
  };
};


export const fetchPropertyById = async (propertyId) => {
  const propertyRecord = await prisma.property.findFirst({
    where: {
      id: propertyId,
      deletedAt: null,
      status: 'published',
    },
    include: {
      owner: { select: { id: true, email: true } },
    },
  });

  if (!propertyRecord) {
    throw new AppError('Property not found or is no longer active', 404);
  }

  return propertyRecord;
};

export const updatePropertyDraft = async (propertyId, updateData, authenticatedOwnerId) => {
  const existingProperty = await prisma.property.findFirst({
    where: { id: propertyId, deletedAt: null },
  });

  if (!existingProperty) {
    throw new AppError('Property not found', 404);
  }

  if (existingProperty.ownerId !== authenticatedOwnerId) {
    throw new AppError('Forbidden: You do not own this property listing', 403);
  }

  if (existingProperty.status === 'published') {
    throw new AppError('Cannot modify a published property directly', 400);
  }

  const updatedProperty = await prisma.property.update({
    where: { id: propertyId },
    data: updateData,
  });

  return updatedProperty;
};

export const fetchMyProperties = async (ownerId, queryParams) => {
  const pageNumber = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limitNumber = Math.max(1, Math.min(100, parseInt(queryParams.limit, 10) || 10));
  const skipCount = (pageNumber - 1) * limitNumber;

  const filterConditions = {
    ownerId: ownerId,
    deletedAt: null,
  };

  if (queryParams.status) {
    filterConditions.status = queryParams.status;
  }

  const [propertiesList, totalCount] = await Promise.all([
    prisma.property.findMany({
      where: filterConditions,
      skip: skipCount,
      take: limitNumber,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.property.count({ where: filterConditions }),
  ]);

  return {
    properties: propertiesList,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
      totalProperties: totalCount,
      limit: limitNumber,
    },
  };
};


export const publishPropertyListing = async (propertyId, authenticatedOwnerId) => {
  return await prisma.$transaction(async (tx) => {
    const existingProperty = await tx.property.findFirst({
      where: { id: propertyId, deletedAt: null },
    });

    if (!existingProperty) {
      throw new AppError('Property listing not found', 404);
    }

    if (existingProperty.ownerId !== authenticatedOwnerId) {
      throw new AppError('Forbidden: You do not own this property listing', 403);
    }

    if (!existingProperty.images || existingProperty.images.length === 0) {
      throw new AppError('Property must have at least one image before publishing', 400);
    }

    const publishedProperty = await tx.property.update({
      where: { id: propertyId },
      data: { status: 'published' },
    });

    return publishedProperty;
  });
};

export const removePropertyListing = async (propertyId, userContext) => {
  const existingProperty = await prisma.property.findFirst({
    where: { id: propertyId, deletedAt: null },
  });

  if (!existingProperty) {
    throw new AppError('Property not found', 404);
  }

  const isOwner = existingProperty.ownerId === userContext.id;
  const isAdmin = userContext.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new AppError('Forbidden: You lack permissions to delete this property', 403);
  }

  await prisma.property.update({
    where: { id: propertyId },
    data: { deletedAt: new Date() },
  });

  return { message: 'Property deleted successfully' };
};

export const archivePropertyListing = async (propertyId, authenticatedOwnerId) => {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, ownerId: authenticatedOwnerId, deletedAt: null },
  });

  if (!property) {
    throw new AppError('Property not found or unauthorized', 404);
  }

  return await prisma.property.update({
    where: { id: propertyId },
    data: { status: 'archived' },
  });
};

export const adminFetchAllProperties = async (queryParams) => {
  const pageNumber = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limitNumber = Math.max(1, Math.min(100, parseInt(queryParams.limit, 10) || 10));
  const skipCount = (pageNumber - 1) * limitNumber;

  const filterConditions = {};
  if (queryParams.status) {
    filterConditions.status = queryParams.status;
  }

  if (queryParams.includeDeleted !== 'true') {
    filterConditions.deletedAt = null;
  }

  if (queryParams.search) {
    filterConditions.OR = [
      { title: { contains: queryParams.search, mode: 'insensitive' } },
      { location: { contains: queryParams.search, mode: 'insensitive' } },
    ];
  }

  const [propertiesList, totalCount] = await Promise.all([
    prisma.property.findMany({
      where: filterConditions,
      skip: skipCount,
      take: limitNumber,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.property.count({ where: filterConditions }),
  ]);

  return {
    properties: propertiesList,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
      totalProperties: totalCount,
      limit: limitNumber,
    },
  };
};


export const adminDisablePropertyListing = async (propertyId, reason) => {
 
  const existingProperty = await prisma.property.findFirst({
    where: { id: propertyId, deletedAt: null },
  });

  if (!existingProperty) {
    throw new AppError('Property not found or is already soft-deleted', 404);
  }

  if (existingProperty.status === 'disabled') {
    throw new AppError('This property listing is already disabled', 400);
  }

  const disabledProperty = await prisma.property.update({
    where: { id: propertyId },
    data: {
      status: 'disabled',
    },
    include: {
      owner: {
        select: { id: true, email: true },
      },
    },
  });

  return disabledProperty;
};