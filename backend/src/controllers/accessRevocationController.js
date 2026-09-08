import { AccessRevocation, ACCESS_STATUS } from '../models/AccessRevocation.js';
import { AccessRevocationService } from '../services/accessRevocationService.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const getAllAccessRevocations = async (req, res, next) => {
  try {
    const records = await AccessRevocation.find()
      .populate('employeeId', 'firstName lastName email employeeCode department designation')
      .populate('offboardingId', 'status lastWorkingDay resignationDate')
      .sort({ updatedAt: -1 });

    return successResponse(res, 'Access revocation records retrieved', records);
  } catch (error) {
    next(error);
  }
};

export const getAccessRevocationByCase = async (req, res, next) => {
  try {
    const { offboardingId } = req.params;
    const record = await AccessRevocation.findOne({ offboardingId })
      .populate('employeeId')
      .populate('offboardingId');

    if (!record) {
      return errorResponse(res, 'Access revocation record not found', 'NOT_FOUND', 404);
    }

    return successResponse(res, 'Access revocation details retrieved', record);
  } catch (error) {
    next(error);
  }
};

export const revokeSingleAccess = async (req, res, next) => {
  try {
    const { offboardingId } = req.params;
    const { accessKey, auditNote } = req.body;

    if (!accessKey) {
      return errorResponse(res, 'accessKey is required', 'VALIDATION_ERROR', 400);
    }

    const result = await AccessRevocationService.revokeAccess({
      offboardingId,
      accessKey,
      user: req.user,
      auditNote
    });

    return successResponse(res, `Access for ${result.item.systemName} revoked successfully (Simulated)`, result);
  } catch (error) {
    next(error);
  }
};

export const revokeAllCaseAccess = async (req, res, next) => {
  try {
    const { offboardingId } = req.params;
    const { auditNote } = req.body;

    const result = await AccessRevocationService.revokeAllAccess({
      offboardingId,
      user: req.user,
      auditNote
    });

    return successResponse(res, `All ${result.count} systems revoked successfully (Simulated)`, result);
  } catch (error) {
    next(error);
  }
};
