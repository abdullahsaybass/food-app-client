// features/notification/screens/Notification.screen.tsx
import React, { useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

import { useNotificationStore } from '../store/notification.store';
import type { Notification } from '../types/notification.types';
import type { RootStackParamList } from '../../../app/navigation/navigation.types';
import { Colors, FontFamily } from '../../../theme';

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconBack = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12L12 19M5 12L12 5"
      stroke="#1a1a1a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconBell = () => (
  <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8C18 6.4 17.4 4.9 16.2 3.8C15.1 2.6 13.6 2 12 2C10.4 2 8.9 2.6 7.8 3.8C6.6 4.9 6 6.4 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
      stroke={Colors.grey300} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13.73 21C13.55 21.3 13.3 21.55 13 21.73C12.7 21.9 12.35 22 12 22C11.65 22 11.3 21.9 11 21.73C10.7 21.55 10.45 21.3 10.27 21"
      stroke={Colors.grey300} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconOrder = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
      stroke={Colors.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      stroke={Colors.primary} strokeWidth={1.8} />
  </Svg>
);

const IconPromo = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      stroke="#F59E0B" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconCheck = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12"
      stroke={Colors.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ORDER_TYPES = new Set([
  'order_placed', 'order_confirmed', 'order_processing',
  'order_shipped', 'order_delivered', 'order_cancelled',
]);

const getIconBg = (type: string): string => {
  if (type === 'order_cancelled') return '#FEF2F2';
  if (ORDER_TYPES.has(type)) return Colors.primarySurface;
  return '#FFFBEB';
};

const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-MV', { day: 'numeric', month: 'short' });
};

// ─── Notification row ─────────────────────────────────────────────────────────
const NotifRow: React.FC<{
  item:        Notification;
  onPress:     (n: Notification) => void;
  onDelete:    (id: string) => void;
}> = ({ item, onPress, onDelete }) => {
  const isOrder = ORDER_TYPES.has(item.type);
  const isCancelled = item.type === 'order_cancelled';

  return (
    <TouchableOpacity
      style={[styles.row, !item.isRead && styles.rowUnread]}
      activeOpacity={0.75}
      onPress={() => onPress(item)}
      onLongPress={() => {
        Alert.alert('Delete notification?', undefined, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) },
        ]);
      }}
    >
      {/* Icon pill */}
      <View style={[styles.iconPill, { backgroundColor: getIconBg(item.type) }]}>
        {isOrder ? <IconOrder /> : <IconPromo />}
      </View>

      {/* Content */}
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.rowTime}>{timeAgo(item.createdAt)}</Text>
        </View>
        <Text style={styles.rowBody} numberOfLines={2}>{item.body}</Text>

        {/* Status chip for order notifications */}
        {isOrder && (
          <View style={[
            styles.chip,
            isCancelled ? styles.chipRed : styles.chipGreen,
          ]}>
            <Text style={[
              styles.chipText,
              isCancelled ? styles.chipTextRed : styles.chipTextGreen,
            ]}>
              {item.type.replace('order_', '').replace(/_/g, ' ')}
            </Text>
          </View>
        )}
      </View>

      {/* Unread dot */}
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────
export const NotificationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const { notifications, unreadCount, pagination, isFetching, fetchError, fetch, markAsRead, markAllAsRead, deleteOne } =
    useNotificationStore();

  useEffect(() => { fetch(1); }, []);

  const handlePress = useCallback(async (n: Notification) => {
    if (!n.isRead) await markAsRead(n.id);

    // Deep-link into order detail if notification carries orderId
    if (n.data?.orderId) {
      (navigation as any).navigate('OrderDetail', { orderId: n.data.orderId });
    }
  }, [markAsRead, navigation]);

  const handleLoadMore = () => {
    if (!pagination || !isFetching) return;
    const nextPage = (pagination.page ?? 1) + 1;
    if (nextPage <= (pagination.totalPages ?? 1)) fetch(nextPage);
  };

  const renderEmpty = () => {
    if (isFetching) return null;
    return (
      <View style={styles.emptyWrap}>
        <IconBell />
        <Text style={styles.emptyTitle}>No notifications yet</Text>
        <Text style={styles.emptyBody}>Order updates and promotions will appear here.</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <IconBack />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
            <IconCheck />
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 100 }} />
        )}
      </View>

      {/* Unread count pill */}
      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadBannerText}>
            {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {fetchError ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.errorText}>{fetchError}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetch(1)}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={n => n.id}
          renderItem={({ item }) => (
            <NotifRow item={item} onPress={handlePress} onDelete={deleteOne} />
          )}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={isFetching
            ? <ActivityIndicator color={Colors.primary} style={{ margin: 20 }} />
            : null
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingVertical:   12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: Colors.grey100,
    alignItems:      'center',
    justifyContent:  'center',
  },
  headerTitle: {
    flex:       1,
    fontFamily: FontFamily.bold,
    fontSize:   18,
    color:      '#1a1a1a',
    marginLeft: 12,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
    paddingRight:  4,
  },
  markAllText: {
    fontFamily: FontFamily.medium,
    fontSize:   12,
    color:      Colors.primary,
  },

  unreadBanner: {
    backgroundColor: Colors.primarySurface,
    paddingHorizontal: 16,
    paddingVertical:   8,
  },
  unreadBannerText: {
    fontFamily: FontFamily.medium,
    fontSize:   13,
    color:      Colors.primary,
  },

  listContent:    { paddingVertical: 8 },
  emptyContainer: { flexGrow: 1 },

  // Row
  row: {
    flexDirection:     'row',
    alignItems:        'flex-start',
    paddingHorizontal: 16,
    paddingVertical:   14,
    gap:               12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    position:          'relative',
  },
  rowUnread: { backgroundColor: '#FAFFFE' },

  iconPill: {
    width:          46,
    height:         46,
    borderRadius:   12,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },

  rowContent: { flex: 1 },
  rowTop: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   4,
  },
  rowTitle: {
    flex:       1,
    fontFamily: FontFamily.semiBold,
    fontSize:   14,
    color:      '#1a1a1a',
    marginRight: 8,
  },
  rowTime: {
    fontFamily: FontFamily.regular,
    fontSize:   11,
    color:      Colors.grey400,
  },
  rowBody: {
    fontFamily:  FontFamily.regular,
    fontSize:    13,
    color:       Colors.grey500,
    lineHeight:  19,
    marginBottom: 6,
  },

  // Chip
  chip: {
    alignSelf:         'flex-start',
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      20,
    marginTop:         2,
  },
  chipGreen:    { backgroundColor: Colors.primarySurface },
  chipRed:      { backgroundColor: '#FEF2F2' },
  chipText:     { fontFamily: FontFamily.semiBold, fontSize: 11, textTransform: 'capitalize' },
  chipTextGreen: { color: Colors.primary },
  chipTextRed:  { color: Colors.error },

  // Unread dot
  unreadDot: {
    position:        'absolute',
    top:             16,
    right:           16,
    width:           8,
    height:          8,
    borderRadius:    4,
    backgroundColor: Colors.primary,
  },

  // Empty
  emptyWrap: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingBottom:  60,
    gap:            12,
  },
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize:   18,
    color:      '#1a1a1a',
  },
  emptyBody: {
    fontFamily: FontFamily.regular,
    fontSize:   14,
    color:      Colors.grey500,
    textAlign:  'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontFamily: FontFamily.regular,
    fontSize:   14,
    color:      Colors.error,
    textAlign:  'center',
  },
  retryBtn: {
    marginTop:         12,
    paddingHorizontal: 24,
    paddingVertical:   10,
    borderRadius:      8,
    backgroundColor:   Colors.primary,
  },
  retryText: {
    fontFamily: FontFamily.semiBold,
    fontSize:   14,
    color:      '#fff',
  },
});
