import { Notification } from '../models/Notification.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [{ userId: req.user._id }, { targetRole: req.user.role }]
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      $or: [{ userId: req.user._id }, { targetRole: req.user.role }],
      isRead: false
    });

    return successResponse(res, 'Notifications retrieved', {
      notifications,
      unreadCount
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!notification) {
      return errorResponse(res, 'Notification not found', 'NOT_FOUND', 404);
    }
    return successResponse(res, 'Notification marked as read', notification);
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        $or: [{ userId: req.user._id }, { targetRole: req.user.role }],
        isRead: false
      },
      { isRead: true, readAt: new Date() }
    );

    return successResponse(res, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};
