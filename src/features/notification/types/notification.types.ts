// features/notification/types/notification.types.ts

export type NotificationType =
  | 'order_placed'
  | 'order_confirmed'
  | 'order_processing'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  | 'promo'
  | 'general';

export interface Notification {
  id:        string;
  type:      NotificationType;
  title:     string;
  body:      string;
  data?:     Record<string, string>;
  isRead:    boolean;
  readAt?:   string | null;
  createdAt: string;
}

export interface NotificationListResult {
  items:       Notification[];
  pagination:  { page: number; limit: number; total: number; totalPages: number };
  unreadCount: number;
}
