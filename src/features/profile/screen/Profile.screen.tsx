import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Modal, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

import { Colors, FontFamily } from '../../../theme';
import { useAuthStore }  from '../../auth/store/auth.store';
import { useOrderStore } from '../../order/store/order.store';
import type { RootStackParamList } from '../../../app/navigation/navigation.types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileHome'>;

const IC = Colors.primary || '#22A45D';

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconBell = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#1A1A1A" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#1A1A1A" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={18} cy={7} r={3.2} fill={IC} />
  </Svg>
);
const IconEdit2 = () => (
  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={IC} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={IC} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconChevronRight = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke="#B5B7BC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconUser = () => (
  <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#AAAAAA" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={7} r={4} stroke="#AAAAAA" strokeWidth={1.8} />
  </Svg>
);
const IconPhone = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.5 2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="#6B7280" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconMail = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#6B7280" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="22,6 12,13 2,6" stroke="#6B7280" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconCrown = () => (
  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
    <Path d="M3 18h18l-2-10-5 4-4-6-4 6-5-4-2 10z" stroke="#A67800" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconAllOrders = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="#C58B12" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={3} y1={6} x2={21} y2={6} stroke="#C58B12" strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M16 10a4 4 0 0 1-8 0" stroke="#C58B12" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconProcessing = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={9} stroke="#E0A11B" strokeWidth={1.8} />
    <Path d="M12 7v5l3 2" stroke="#E0A11B" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconShipped = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" stroke="#3F7BEA" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Rect x={9} y={11} width={14} height={10} rx={2} stroke="#3F7BEA" strokeWidth={1.8} />
    <Path d="M14 16h4" stroke="#3F7BEA" strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);
const IconDelivered = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke="#4AAE63" strokeWidth={1.8} />
    <Path d="M9 12l2 2 4-4" stroke="#4AAE63" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconMapPin = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#444" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={9} r={2.5} stroke="#444" strokeWidth={1.8} />
  </Svg>
);
const IconCart = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx={9} cy={20} r={1.5} stroke="#444" strokeWidth={1.8} />
    <Circle cx={18} cy={20} r={1.5} stroke="#444" strokeWidth={1.8} />
    <Path d="M2 3h3l2.2 10.4A2 2 0 0 0 9.15 15H18.5a2 2 0 0 0 1.95-1.55L22 6H6" stroke="#444" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconShield = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M20 12a2 2 0 1 0 0-4V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2a2 2 0 1 0 0 4v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2z" stroke="#444" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={12} y1={7} x2={12} y2={17} stroke="#444" strokeWidth={1.8} strokeLinecap="round" strokeDasharray="2 2" />
  </Svg>
);
const IconDocument = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" stroke="#444" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="14 2 14 8 20 8" stroke="#444" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconHelpCircle = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke="#444" strokeWidth={1.8} />
    <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="#444" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={12} y1={17} x2={12.01} y2={17} stroke="#444" strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);
const IconLogOut = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="#E53935" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="16 17 21 12 16 7" stroke="#E53935" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={21} y1={12} x2={9} y2={12} stroke="#E53935" strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);
const IconCancelled = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke="#E53935" strokeWidth={1.8} />
    <Path d="M15 9l-6 6M9 9l6 6" stroke="#E53935" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Screen ───────────────────────────────────────────────────────────────────
export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const rootNav    = useNavigation<NavigationProp<RootStackParamList>>();
  const user       = useAuthStore(s => s.user);
  const logout     = useAuthStore(s => s.logout);
  const fetchUser  = useAuthStore(s => s.fetchUser);
  const fetchOrders = useOrderStore(s => s.fetchOrderHistory);
  const orders      = useOrderStore(s => s.orders ?? []);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const goTo = (fn: () => void) => setTimeout(fn, 180);

  useEffect(() => { fetchUser(); }, [fetchUser]);
  useEffect(() => { fetchOrders({ page: 1, limit: 100 }); }, [fetchOrders]);

  // ── Real order counts ─────────────────────────────────────────────────
const totalOrders     = orders.length;
const processingCount = orders.filter(o =>
  o.status === 'processing' || o.status === 'confirmed'
).length;
const deliveredCount  = orders.filter(o =>
  o.status === 'delivered'
).length;
const cancelledCount  = orders.filter(o =>
  o.status === 'cancelled'
).length;

const displayName = user?.name
  ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
  : 'User';

const ORDER_STATS = [
  { label: 'All Orders', count: totalOrders,     Icon: IconAllOrders  },
  { label: 'Processing', count: processingCount, Icon: IconProcessing  },
  { label: 'Delivered',  count: deliveredCount,  Icon: IconDelivered   },
  { label: 'Cancelled',  count: cancelledCount,  Icon: IconCancelled   },
];
  const MENU_ITEMS = [
    {
      label: 'Addresses', sub: 'Manage your saved addresses', Icon: IconMapPin,
      onPress: () => goTo(() => rootNav.navigate('SelectAddress' as any)),
    },
    {
      label: 'Cart', sub: 'View items in your cart', Icon: IconCart,
      onPress: () => goTo(() => rootNav.navigate('MainTabs', { screen: 'Cart' } as any)),
    },
    {
      label: 'FAQ', sub: 'Frequently asked questions', Icon: IconHelpCircle,
      onPress: () => goTo(() => rootNav.navigate('StaticContent', { type: 'faq' } as any)),
    },
    {
      label: 'Privacy Policy', sub: 'Read our privacy policy', Icon: IconShield,
      onPress: () => goTo(() => rootNav.navigate('StaticContent', { type: 'privacy' } as any)),
    },
    {
      label: 'Terms & Conditions', sub: 'Terms of service', Icon: IconDocument,
      onPress: () => goTo(() => rootNav.navigate('StaticContent', { type: 'terms' } as any)),
    },
    {
      label: 'Help & Support', sub: 'Get help and support', Icon: IconHelpCircle,
      onPress: () => goTo(() => rootNav.navigate('StaticContent', { type: 'help' } as any)),
    },
    {
      label: 'Log Out', sub: 'Sign out from your account', Icon: IconLogOut,
      onPress: () => setShowLogoutModal(true), danger: true,
    },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      {/* ── Top Bar ── */}
      <View style={s.topBar}>
        <Text style={s.topTitle}>Profile</Text>
        <TouchableOpacity style={s.bellBtn} activeOpacity={0.85}>
          <IconBell />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Profile Card ── */}
        <View style={s.profileCard}>

          {/* Avatar */}
          <TouchableOpacity
            onPress={() => goTo(() => navigation.navigate('EditProfile' as any))}
            activeOpacity={0.85}
          >
            {user?.profilePic?.url ? (
              <Image source={{ uri: user.profilePic.url }} style={s.avatar} />
            ) : (
              <View style={s.avatarFallback}>
                <IconUser />
              </View>
            )}
          </TouchableOpacity>

          {/* Right: name, badge, phone, email */}
          <View style={s.profileRight}>

            {/* Name + Edit */}
            <View style={s.nameRow}>
              <Text style={s.profileName} numberOfLines={1}>{displayName}</Text>
              <TouchableOpacity
                style={s.editBtn}
                onPress={() => goTo(() => navigation.navigate('EditProfile' as any))}
                activeOpacity={0.8}
              >
                <IconEdit2 />
                <Text style={s.editText}>Edit</Text>
              </TouchableOpacity>
            </View>

            {/* Gold Member badge */}
            {/* <View style={s.memberBadge}>
              <IconCrown />
              <Text style={s.memberText}>Gold Member</Text>
            </View> */}

            {/* Phone */}
            {!!user?.phone && (
              <View style={s.infoRow}>
                <IconPhone />
                <Text style={s.infoText}>{user.phone}</Text>
              </View>
            )}

            {/* Email */}
            {!!user?.email && (
              <View style={s.infoRow}>
                <IconMail />
                <Text style={s.infoText}>{user.email}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── My Orders ── */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>My Orders</Text>
          <TouchableOpacity
            onPress={() => goTo(() => rootNav.navigate('OrderHistory'))}
            activeOpacity={0.8}
          >
            <Text style={s.viewAll}>View All ›</Text>
          </TouchableOpacity>
        </View>

        <View style={s.ordersCard}>
          {ORDER_STATS.map((item, i) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity
                style={s.orderItem}
                activeOpacity={0.8}
                onPress={() => goTo(() => rootNav.navigate('OrderHistory'))}
              >
                <View style={s.orderIconWrap}>
                  <item.Icon />
                </View>
                <Text style={s.orderLabel}>{item.label}</Text>
                <Text style={s.orderCount}>{item.count}</Text>
              </TouchableOpacity>
              {i < ORDER_STATS.length - 1 && <View style={s.orderDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Menu ── */}
        <View style={s.menuCard}>
          {MENU_ITEMS.map(({ label, sub, Icon, onPress, danger }, i) => (
            <React.Fragment key={label}>
              <TouchableOpacity style={s.menuRow} onPress={onPress} activeOpacity={0.72}>
                <View style={s.menuText}>
                  <Text style={[s.menuLabel, danger && { color: '#E53935' }]}>{label}</Text>
                  <Text style={[s.menuSub, danger && { color: '#EF9A9A' }]}>{sub}</Text>
                </View>
                <IconChevronRight />
              </TouchableOpacity>
              {i < MENU_ITEMS.length - 1 && <View style={s.divider} />}
            </React.Fragment>
          ))}
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* ── Logout Modal ── */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalIconWrap}>
              <IconLogOut />
            </View>
            <Text style={s.modalTitle}>Log Out</Text>
            <Text style={s.modalBody}>Are you sure you want to log out?</Text>
            <View style={s.modalActions}>
              <TouchableOpacity
                style={s.modalCancel}
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.85}
              >
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.modalConfirm}
                onPress={() => { setShowLogoutModal(false); logout(); }}
                activeOpacity={0.85}
              >
                <Text style={s.modalConfirmText}>Yes, Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F5F5F5' },
  scroll: { paddingBottom: 24 },

  // Top bar
  topBar: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingTop:        6,
    paddingBottom:     12,
    backgroundColor:   '#F5F5F5',
  },
  topTitle: {
    fontFamily: FontFamily.extraBold,
    fontSize:   26,
    color:      '#161616',
  },
  bellBtn: {
    width: 42, height: 42,
    alignItems: 'center', justifyContent: 'center',
  },

  // ── Profile card ──────────────────────────────────────────────────────
  profileCard: {
    marginHorizontal: 16,
    marginTop:        4,
    backgroundColor:  '#EEF8F0',
    borderRadius:     18,
    padding:          16,
    flexDirection:    'row',
    alignItems:       'flex-start',
    gap:              14,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
  },
  avatarFallback: {
    width:           80,
    height:          80,
    borderRadius:    40,
    backgroundColor: '#D7EEDB',
    alignItems:      'center',
    justifyContent:  'center',
  },

  // Right column
  profileRight: {
    flex:       1,
    paddingTop: 2,
    gap:        7,
  },

  // Name + Edit row
  nameRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  profileName: {
    fontFamily: FontFamily.bold,
    fontSize:   17,
    color:      '#111111',
    flex:       1,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
    paddingLeft:   8,
  },
  editText: {
    fontFamily: FontFamily.semiBold,
    fontSize:   13,
    color:      IC,
  },

  // Gold Member badge
  memberBadge: {
    flexDirection:     'row',
    alignItems:        'center',
    alignSelf:         'flex-start',
    gap:               5,
    backgroundColor:   '#FEF3C7',
    borderRadius:      999,
    paddingHorizontal: 10,
    paddingVertical:   4,
  },
  memberText: {
    fontFamily: FontFamily.semiBold,
    fontSize:   12,
    color:      '#92600A',
  },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           7,
  },
  infoText: {
    fontFamily: FontFamily.regular,
    fontSize:   13,
    color:      '#555555',
  },

  // ── Section header ────────────────────────────────────────────────────
  sectionRow: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    marginTop:         20,
    marginBottom:      10,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize:   15,
    color:      '#1A1A1A',
  },
  viewAll: {
    fontFamily: FontFamily.semiBold,
    fontSize:   13,
    color:      IC,
  },

  // ── Orders card ───────────────────────────────────────────────────────
  ordersCard: {
    marginHorizontal: 16,
    backgroundColor:  '#FFFFFF',
    borderRadius:     16,
    paddingVertical:  14,
    flexDirection:    'row',
    alignItems:       'stretch',
  },
  orderItem: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: 4,
  },
  orderIconWrap: {
    width:           44,
    height:          44,
    borderRadius:    22,
    backgroundColor: '#F8F8F8',
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    8,
  },
  orderLabel: {
    fontFamily:   FontFamily.medium,
    fontSize:     10.5,
    color:        '#444444',
    textAlign:    'center',
    marginBottom: 4,
    minHeight:    28,
  },
  orderCount: {
    fontFamily: FontFamily.extraBold,
    fontSize:   17,
    color:      '#1B1B1B',
  },
  orderDivider: {
    width:           1,
    backgroundColor: '#F0F0F0',
    marginVertical:  10,
  },

  // ── Menu card ─────────────────────────────────────────────────────────
  menuCard: {
    marginTop:        16,
    marginHorizontal: 16,
    backgroundColor:  '#FFFFFF',
    borderRadius:     16,
    overflow:         'hidden',
  },
  menuRow: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingVertical:   15,
    gap:               14,
  },
  menuIconWrap: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: '#F5F6F8',
    alignItems:      'center',
    justifyContent:  'center',
  },
  menuText: { flex: 1 },
  menuLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize:   14,
    color:      '#1D1D1D',
  },
  menuSub: {
    fontFamily: FontFamily.regular,
    fontSize:   12,
    color:      '#8D939D',
    marginTop:  1,
  },
  divider: {
    height:          1,
    backgroundColor: '#F1F1F1',
  },

  // ── Logout modal ──────────────────────────────────────────────────────
  modalOverlay: {
    flex:              1,
    backgroundColor:   'rgba(0,0,0,0.38)',
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: 30,
  },
  modalCard: {
    width:         '100%',
    backgroundColor: '#FFFFFF',
    borderRadius:  18,
    padding:       24,
    alignItems:    'center',
  },
  modalIconWrap: {
    width:           54,
    height:          54,
    borderRadius:    27,
    backgroundColor: '#FFF1F1',
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    12,
  },
  modalTitle: {
    fontFamily:   FontFamily.bold,
    fontSize:     17,
    color:        '#111111',
    marginBottom: 6,
  },
  modalBody: {
    fontFamily:   FontFamily.regular,
    fontSize:     13,
    color:        '#7B8088',
    textAlign:    'center',
    marginBottom: 20,
  },
  modalActions:    { flexDirection: 'row', gap: 10, width: '100%' },
  modalCancel: {
    flex:            1,
    height:          46,
    borderRadius:    12,
    backgroundColor: '#F4F6F8',
    alignItems:      'center',
    justifyContent:  'center',
  },
  modalCancelText: {
    fontFamily: FontFamily.semiBold,
    fontSize:   14,
    color:      '#333333',
  },
  modalConfirm: {
    flex:            1,
    height:          46,
    borderRadius:    12,
    backgroundColor: '#E53935',
    alignItems:      'center',
    justifyContent:  'center',
  },
  modalConfirmText: {
    fontFamily: FontFamily.semiBold,
    fontSize:   14,
    color:      '#FFFFFF',
  },
});