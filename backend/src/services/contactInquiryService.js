
import prisma from '../config/db.js';
import { AppError } from '../error/AppError.js';

export const createInquiry = async (buyerId, propertyId, inquiryData) => {
  
  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      status: 'published',
      deletedAt: null,
    },
  });

  if (!property) {
    throw new AppError('Property not found or is no longer available for inquiries', 404);
  }

  if (property.ownerId === buyerId) {
    throw new AppError('You cannot send an inquiry to your own property listing', 400);
  }

  const inquiry = await prisma.contact.create({
    data: {
      message: inquiryData.message,
      phone: inquiryData.phone || null,
      userId: buyerId,
      propertyId: propertyId,
    },
    include: {
      property: {
        select: { id: true, title: true, ownerId: true },
      },
      user: {
        select: { id: true, email: true },
      },
    },
  });

  return inquiry;
};


export const fetchInquiriesByProperty = async (ownerId, propertyId) => {
  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      deletedAt: null,
    },
  });

  if (!property) {
    throw new AppError('Property not found', 404);
  }

  if (property.ownerId !== ownerId) {
    throw new AppError('Forbidden: You can only view inquiries for your own properties', 403);
  }

  const inquiries = await prisma.contact.findMany({
    where: { propertyId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      message: true,
      phone: true,
      createdAt: true,
      user: {
        select: { id: true, email: true },
      },
    },
  });

  return inquiries;
};


export const fetchMySentInquiries = async (buyerId) => {
  const inquiries = await prisma.contact.findMany({
    where: { userId: buyerId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      message: true,
      phone: true,
      createdAt: true,
      property: {
        select: {
          id: true,
          title: true,
          location: true,
          price: true,
          owner: { select: { id: true, email: true } },
        },
      },
    },
  });

  return inquiries;
};