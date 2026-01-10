import { Response, NextFunction } from 'express';
import { ApplicationService } from '../services/application.service';
import { AuthRequest } from '../middleware/auth';

const applicationService = new ApplicationService();

export const createApplication = async (
  req: AuthRequest | any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Заявки можно создавать без авторизации
    const userId = req.user?.userId || null;
    const application = await applicationService.createApplication({
      ...req.body,
      userId,
    });
    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (
  req: AuthRequest | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const application = await applicationService.getApplicationById(parseInt(id), userId || undefined);
    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyApplications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const applications = await applicationService.getUserApplications(userId);
    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllApplications = async (
  req: AuthRequest | any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Только для админов (можно добавить проверку роли)
    const { status, providerId, dateFrom, dateTo } = req.query;
    const applications = await applicationService.getAllApplications({
      status: status as string | undefined,
      providerId: providerId ? parseInt(providerId as string) : undefined,
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
    });
    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (
  req: AuthRequest | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const application = await applicationService.updateApplicationStatus(parseInt(id), status);
    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const assignApplication = async (
  req: AuthRequest | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;
    const application = await applicationService.assignApplication(parseInt(id), assignedTo);
    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};


