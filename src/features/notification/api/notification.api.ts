// features/notification/services/notification.api.ts
import { API } from '../../../app/lib/api';
import type { Notification, NotificationListResult } from '../types/notification.types';

const toNotification = (n: any): Notification => ({
  id:        n._id ?? n.id,
  type:      n.type,
  title:     n.title,
  body:      n.body,
  data:      n.data ?? {},
  isRead:    n.isRead ?? false,
  readAt:    n.readAt ?? null,
  createdAt: n.createdAt,
});

export const notificationApi = {

  getAll: async (page = 1, limit = 20): Promise<NotificationListResult> => {
    const { data } = await API.get('/notifications', { params: { page, limit } });
    const d = data.data;
    return {
      items:       (d.items ?? []).map(toNotification),
      pagination:  d.pagination,
      unreadCount: d.unreadCount ?? 0,
    };
  },

  markAsRead: async (id: string): Promise<void> => {
    await API.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await API.patch('/notifications/read-all');
  },

  deleteOne: async (id: string): Promise<void> => {
    await API.delete(`/notifications/${id}`);
  },

  registerDeviceToken: async (token: string, platform: 'ios' | 'android' | 'web' = 'android'): Promise<void> => {
    await API.post('/notifications/device-token', { token, platform });
  },

  removeDeviceToken: async (token: string): Promise<void> => {
    await API.delete('/notifications/device-token', { data: { token } });
  },
};
