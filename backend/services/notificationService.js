import Notification from '../models/Notification.model.js';
import { emitToUser } from '../config/socket.js';

export const createNotification = async ({ user, title, message, type, link }) => {
  try {
    const notification = await Notification.create({
      user,
      title,
      message,
      type,
      link,
    });

    emitToUser(user.toString(), 'notification', {
      _id: notification._id,
      title,
      message,
      type,
      link,
      read: false,
      createdAt: notification.createdAt,
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error.message);
  }
};
