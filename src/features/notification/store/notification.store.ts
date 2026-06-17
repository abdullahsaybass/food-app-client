// // features/notification/store/notification.store.ts
// import { create } from 'zustand';
// import { notificationApi } from '../api/notification.api';
// import type { Notification, NotificationListResult } from '../types/notification.types';

// interface NotificationStore {
//   notifications: Notification[];
//   unreadCount:   number;
//   pagination:    NotificationListResult['pagination'] | null;

//   isFetching: boolean;
//   fetchError: string | null;

//   fetch:         (page?: number) => Promise<void>;
//   markAsRead:    (id: string) => Promise<void>;
//   markAllAsRead: () => Promise<void>;
//   deleteOne:     (id: string) => Promise<void>;
//   clearError:    () => void;
// }

// export const useNotificationStore = create<NotificationStore>((set, get) => ({
//   notifications: [],
//   unreadCount:   0,
//   pagination:    null,
//   isFetching:    false,
//   fetchError:    null,

//   fetch: async (page = 1) => {
//     set({ isFetching: true, fetchError: null });
//     try {
//       const result = await notificationApi.getAll(page);
//       set(s => ({
//         isFetching:    false,
//         unreadCount:   result.unreadCount,
//         pagination:    result.pagination,
//         notifications: page === 1
//           ? result.items
//           : [...s.notifications, ...result.items],
//       }));
//     } catch (err: any) {
//       set({ isFetching: false, fetchError: err.message ?? 'Failed to load notifications' });
//     }
//   },

//   markAsRead: async (id) => {
//     await notificationApi.markAsRead(id);
//     set(s => ({
//       notifications: s.notifications.map(n =>
//         n.id === id ? { ...n, isRead: true } : n
//       ),
//       unreadCount: Math.max(0, s.unreadCount - 1),
//     }));
//   },

//   markAllAsRead: async () => {
//     await notificationApi.markAllAsRead();
//     set(s => ({
//       notifications: s.notifications.map(n => ({ ...n, isRead: true })),
//       unreadCount:   0,
//     }));
//   },

//   deleteOne: async (id) => {
//     const wasUnread = get().notifications.find(n => n.id === id && !n.isRead);
//     await notificationApi.deleteOne(id);
//     set(s => ({
//       notifications: s.notifications.filter(n => n.id !== id),
//       unreadCount:   wasUnread ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
//     }));
//   },

//   clearError: () => set({ fetchError: null }),
// }));


// features/notification/store/notification.store.ts
import { create } from 'zustand';
import { notificationApi } from '../api/notification.api';
import type { Notification, NotificationListResult } from '../types/notification.types';

interface NotificationStore {
  notifications: Notification[];
  unreadCount:   number;
  pagination:    NotificationListResult['pagination'] | null;

  isFetching: boolean;
  fetchError: string | null;

  fetch:         (page?: number) => Promise<void>;
  markAsRead:    (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteOne:     (id: string) => Promise<void>;
  clearError:    () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount:   0,
  pagination:    null,
  isFetching:    false,
  fetchError:    null,

  fetch: async (page = 1) => {
    set({ isFetching: true, fetchError: null });
    try {
      const result = await notificationApi.getAll(page);
      set(s => ({
        isFetching:    false,
        unreadCount:   result.unreadCount,
        pagination:    result.pagination,
        notifications: page === 1
          ? result.items
          : [...s.notifications, ...result.items],
      }));
    } catch (err: any) {
      set({ isFetching: false, fetchError: err.message ?? 'Failed to load notifications' });
    }
  },

  // FIX: was unguarded — a failure caused an unhandled promise rejection
  markAsRead: async (id) => {
    try {
      await notificationApi.markAsRead(id);
      set(s => ({
        notifications: s.notifications.map(n =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, s.unreadCount - 1),
      }));
    } catch {
      // Silent: mark-as-read failure isn't worth surfacing to the user
    }
  },

  // FIX: was unguarded
  markAllAsRead: async () => {
    try {
      await notificationApi.markAllAsRead();
      set(s => ({
        notifications: s.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount:   0,
      }));
    } catch {
      // Silent
    }
  },

  // FIX: was unguarded
  deleteOne: async (id) => {
    const wasUnread = get().notifications.find(n => n.id === id && !n.isRead);
    try {
      await notificationApi.deleteOne(id);
      set(s => ({
        notifications: s.notifications.filter(n => n.id !== id),
        unreadCount:   wasUnread ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
      }));
    } catch {
      // Silent
    }
  },

  clearError: () => set({ fetchError: null }),
}));