
import * as contactInquiryService from '../services/contactInquiryService.js';

export const handleCreateInquiry = async (req, res, next) => {
  try {
    const buyerId = req.user.id;
    const { propertyId } = req.params;
    const inquiryPayload = req.body;

    const inquiry = await contactInquiryService.createInquiry(
      buyerId,
      propertyId,
      inquiryPayload
    );

    res.status(201).json({
      status: 'success',
      message: 'Inquiry sent to property owner successfully',
      data: { inquiry },
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetPropertyInquiries = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { propertyId } = req.params;

    const inquiries = await contactInquiryService.fetchInquiriesByProperty(
      ownerId,
      propertyId
    );

    res.status(200).json({
      status: 'success',
      results: inquiries.length,
      data: { inquiries },
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetMySentInquiries = async (req, res, next) => {
  try {
    const buyerId = req.user.id;
    const inquiries = await contactInquiryService.fetchMySentInquiries(buyerId);

    res.status(200).json({
      status: 'success',
      results: inquiries.length,
      data: { inquiries },
    });
  } catch (error) {
    next(error);
  }
};