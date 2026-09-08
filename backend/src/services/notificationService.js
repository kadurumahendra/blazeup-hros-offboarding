import nodemailer from 'nodemailer';
import { Notification } from '../models/Notification.js';
import { User, ROLES } from '../models/User.js';
import { config } from '../config/env.js';

// Setup optional nodemailer transport
let mailTransporter = null;
if (config.smtp.host && config.smtp.user) {
  try {
    mailTransporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass
      }
    });
  } catch (err) {
    console.warn('[NotificationService] Nodemailer transport setup failed:', err.message);
  }
}

export const sendNotification = async ({
  userId = null,
  targetRole = null,
  title,
  message,
  type = 'INFO',
  relatedEntity = 'OFFBOARDING',
  relatedEntityId = null,
  sendEmail = false,
  recipientEmail = null
}) => {
  try {
    // 1. Create In-App Notification
    let targetUsers = [];
    if (userId) {
      targetUsers = await User.find({ _id: userId, isActive: true });
    } else if (targetRole) {
      targetUsers = await User.find({ role: targetRole, isActive: true });
    }

    const notificationsToInsert = targetUsers.map(user => ({
      userId: user._id,
      targetRole: user.role,
      title,
      message,
      type,
      relatedEntity,
      relatedEntityId,
      isRead: false
    }));

    if (notificationsToInsert.length > 0) {
      await Notification.insertMany(notificationsToInsert);
    }

    // 2. Send email if enabled and configured
    if (sendEmail && mailTransporter) {
      const emailList = recipientEmail
        ? [recipientEmail]
        : targetUsers.map(u => u.email).filter(Boolean);

      if (emailList.length > 0) {
        mailTransporter.sendMail({
          from: config.smtp.from,
          to: emailList.join(','),
          subject: `[BlazeUp HROS] ${title}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
              <h2 style="color: #6366f1;">BlazeUp HROS Notification</h2>
              <p><strong>${title}</strong></p>
              <p>${message}</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748b;">This is an automated notification from BlazeUp HROS Offboarding Engine.</p>
            </div>
          `
        }).catch(err => {
          console.warn('[NotificationService] Email delivery failed (safe fallback):', err.message);
        });
      }
    }

    return { count: notificationsToInsert.length };
  } catch (error) {
    console.error('[NotificationService] Error sending notification:', error.message);
    return { count: 0, error: error.message };
  }
};
