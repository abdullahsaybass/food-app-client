import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Modal, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

import { Colors, FontFamily } from '../../../theme';
import { useAuthStore }  from '../../auth/store/auth.store';
import { useOrderStore } from '../../order/store/order.store';
import { useNotificationStore } from '../../notification/store/notification.store';
import type { RootStackParamList } from '../../../app/navigation/navigation.types';
import { switchMainTab } from '../../../app/navigation/MainNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileHome'>;

const IC = Colors.primary || '#22A45D';

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconSettings = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={3} stroke="#1A1A1A" strokeWidth={1.8} />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="#1A1A1A" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconBell = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#1A1A1A" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#1A1A1A" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconChevronRight = (props: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={props.color || '#1A1A1A'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconChevronRightSmall = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke="#B5B7BC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconUser = () => (
  <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill={IC} stroke={IC} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={7} r={4} fill={IC} stroke={IC} strokeWidth={1.8} />
  </Svg>
);
const IconUserGuest = () => (
  <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={4} stroke="#FFFFFF" strokeWidth={1.6} />
    <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#FFFFFF" strokeWidth={1.6} strokeLinecap="round" />
  </Svg>
);
const IconPhone = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.5 2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke={IC} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconCrown = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M3 18h18l-2-10-5 4-4-6-4 6-5-4-2 10z" stroke={IC} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconAllOrders = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke={IC} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={3} y1={6} x2={21} y2={6} stroke={IC} strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M16 10a4 4 0 0 1-8 0" stroke={IC} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconMapPin = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={IC} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={9} r={2.5} stroke={IC} strokeWidth={1.8} />
  </Svg>
);
const IconCart = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx={9} cy={20} r={1.5} stroke={IC} strokeWidth={1.8} />
    <Circle cx={18} cy={20} r={1.5} stroke={IC} strokeWidth={1.8} />
    <Path d="M2 3h3l2.2 10.4A2 2 0 0 0 9.15 15H18.5a2 2 0 0 0 1.95-1.55L22 6H6" stroke={IC} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconTruck = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Rect x={1} y={6} width={14} height={11} rx={1.5} stroke={IC} strokeWidth={1.8} />
    <Path d="M15 9h4l3 3v5h-7z" stroke={IC} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={6} cy={19} r={1.6} stroke={IC} strokeWidth={1.8} />
    <Circle cx={17.5} cy={19} r={1.6} stroke={IC} strokeWidth={1.8} />
  </Svg>
);
const IconBolt = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z" stroke={IC} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconPackage = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke={IC} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3.27 6.96L12 12.01l8.73-5.05" stroke={IC} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={12} y1={22.08} x2={12} y2={12} stroke={IC} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);
const IconHeadset = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M3 14v-2a9 9 0 1 1 18 0v2" stroke={IC} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Rect x={1} y={14} width={6} height={7} rx={2} stroke={IC} strokeWidth={1.8} />
    <Rect x={17} y={14} width={6} height={7} rx={2} stroke={IC} strokeWidth={1.8} />
  </Svg>
);
const IconHelpCircle = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke={IC} strokeWidth={1.8} />
    <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke={IC} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={12} y1={17} x2={12.01} y2={17} stroke={IC} strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);
const IconShield = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={IC} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconDocument = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" stroke={IC} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="14 2 14 8 20 8" stroke={IC} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={8} y1={13} x2={16} y2={13} stroke={IC} strokeWidth={1.8} strokeLinecap="round" />
    <Line x1={8} y1={17} x2={13} y2={17} stroke={IC} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);
const IconInfo = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke={IC} strokeWidth={1.8} />
    <Line x1={12} y1={11} x2={12} y2={16} stroke={IC} strokeWidth={2} strokeLinecap="round" />
    <Circle cx={12} cy={7.5} r={1} fill={IC} />
  </Svg>
);
const IconLogOut = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M16 17l5-5-5-5" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={21} y1={12} x2={9} y2={12} stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconLogOutRed = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="#E53935" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="16 17 21 12 16 7" stroke="#E53935" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={21} y1={12} x2={9} y2={12} stroke="#E53935" strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

// ─── Guest Screen ─────────────────────────────────────────────────────────────
const GuestProfile: React.FC<{ rootNav: NavigationProp<RootStackParamList> }> = ({ rootNav }) => {
  const SUPPORT_ITEMS = [
    { label: 'Help & Support',     sub: 'Contact customer support',        Icon: IconHeadset,    type: 'help'    },
    { label: 'FAQ',                sub: 'Find answers to common questions', Icon: IconHelpCircle, type: 'faq'     },
    { label: 'Privacy Policy',     sub: 'Read about our privacy practices', Icon: IconShield,     type: 'privacy' },
    { label: 'Terms & Conditions', sub: 'Read our terms and conditions',    Icon: IconDocument,   type: 'terms'   },
    { label: 'About Us',           sub: 'Learn more about us',             Icon: IconInfo,       type: 'about'   },
  ];

  const PERKS = [
    { label: 'Free Delivery', Icon: IconTruck  },
    { label: 'Fast Checkout', Icon: IconBolt   },
    { label: 'Track Orders',  Icon: IconPackage },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={g.scroll}>

      {/* ── Hero Card ── */}
      <View style={g.heroCard}>
        <View style={g.avatarCircle}>
          <IconUserGuest />
        </View>
        <Text style={g.heroTitle}>Welcome to VFresh</Text>
        <Text style={g.heroSub}>Sign in to track orders, manage addresses, and enjoy a fresh grocery shopping experience</Text>

        <TouchableOpacity
          style={g.signInBtn}
          activeOpacity={0.88}
          onPress={() => rootNav.navigate('Login')}
        >
          <Text style={g.signInBtnText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={g.registerBtn}
          activeOpacity={0.88}
          onPress={() => rootNav.navigate('Register')}
        >
          <Text style={g.registerBtnText}>Create Account</Text>
        </TouchableOpacity>
      </View>

      {/* ── Perks Row ── */}
      <View style={g.perksRow}>
        {PERKS.map(({ label, Icon }) => (
          <View key={label} style={g.perkCard}>
            <View style={g.perkIconWrap}>
              <Icon />
            </View>
            <Text style={g.perkLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* ── Support & Info ── */}
      <Text style={g.sectionTitle}>Support & Info</Text>
      <View style={g.menuCard}>
        {SUPPORT_ITEMS.map(({ label, sub, Icon, type }, i) => (
          <React.Fragment key={label}>
            <TouchableOpacity
              style={g.menuRow}
              activeOpacity={0.72}
              onPress={() => rootNav.navigate('StaticContent', { type } as any)}
            >
              <View style={g.menuIconWrap}>
                <Icon />
              </View>
              <View style={g.menuText}>
                <Text style={g.menuLabel}>{label}</Text>
                <Text style={g.menuSub}>{sub}</Text>
              </View>
              <IconChevronRightSmall />
            </TouchableOpacity>
            {i < SUPPORT_ITEMS.length - 1 && <View style={g.divider} />}
          </React.Fragment>
        ))}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const rootNav         = useNavigation<NavigationProp<RootStackParamList>>();
  const user            = useAuthStore(s => s.user);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const logout          = useAuthStore(s => s.logout);
  const fetchUser       = useAuthStore(s => s.fetchUser);
  const fetchOrders     = useOrderStore(s => s.fetchOrderHistory);
  const orders          = useOrderStore(s => s.orders ?? []);
  const pagination      = useOrderStore(s => s.pagination);
  const unreadCount     = useNotificationStore(s => s.unreadCount);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const goTo = (fn: () => void) => fn();

  useEffect(() => { if (isAuthenticated) fetchUser(); }, [fetchUser, isAuthenticated]);
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated) fetchOrders({ page: 1, limit: 50 });
    }, [fetchOrders, isAuthenticated])
  );

  const totalOrders = pagination?.total ?? orders.length;

  const displayName = user?.name
    ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
    : 'User';

  const ACCOUNT_ITEMS = [
    {
      label: 'My Orders', sub: 'View and track your orders', Icon: IconAllOrders,
      onPress: () => goTo(() => rootNav.navigate('OrderHistory')),
    },
    {
      label: 'My Addresses', sub: 'Manage your delivery addresses', Icon: IconMapPin,
      onPress: () => goTo(() => rootNav.navigate('SelectAddress' as any)),
    },
    {
      label: 'Cart', sub: 'View items in your cart', Icon: IconCart,
      onPress: () => switchMainTab('Cart'),
    },
    {
      label: 'Free Delivery', sub: 'On all orders, no minimum', Icon: IconTruck,
      onPress: () => {},
    },
  ];

  const SUPPORT_ITEMS = [
    { label: 'Help & Support',     sub: 'Contact customer support',        Icon: IconHeadset,    type: 'help'    },
    { label: 'FAQ',                sub: 'Find answers to common questions', Icon: IconHelpCircle, type: 'faq'     },
    { label: 'Privacy Policy',     sub: 'Read about our privacy practices', Icon: IconShield,     type: 'privacy' },
    { label: 'Terms & Conditions', sub: 'Read our terms and conditions',    Icon: IconDocument,   type: 'terms'   },
    { label: 'About Us',           sub: 'Learn more about us',             Icon: IconInfo,       type: 'about'   },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      {/* ── Top Bar ── */}
      <View style={s.topBar}>
        <Text style={s.topTitle}>My Profile</Text>
        <View style={s.topActions}>
          <TouchableOpacity style={s.iconBtn} activeOpacity={0.85}>
            <IconSettings />
          </TouchableOpacity>
          <TouchableOpacity
            style={s.iconBtn}
            activeOpacity={0.85}
            onPress={() => rootNav.navigate('Notifications')}
          >
            <IconBell />
            {unreadCount > 0 && (
              <View style={s.bellBadge}>
                <Text style={s.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Guest vs Authenticated ── */}
      {!isAuthenticated ? (
        <GuestProfile rootNav={rootNav} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* ── Profile Card (dark) ── */}
          <View style={s.profileCard}>
            <View style={s.profileTopRow}>
              <TouchableOpacity
                onPress={() => goTo(() => rootNav.navigate('EditProfile' as any))}
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

              <TouchableOpacity
                style={s.profileRightTouchable}
                onPress={() => goTo(() => rootNav.navigate('EditProfile' as any))}
                activeOpacity={0.8}
              >
                <View style={s.profileRight}>
                  <Text style={s.profileName} numberOfLines={1}>{displayName}</Text>
                  {!!user?.email && (
                    <Text style={s.profileEmail} numberOfLines={1}>{user.email}</Text>
                  )}
                  {!!user?.phone && (
                    <View style={s.infoRow}>
                      <IconPhone />
                      <Text style={s.infoText}>+960 {user.phone}</Text>
                    </View>
                  )}
                </View>
                <View style={s.chevronBtn}>
                  <IconChevronRight color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>

            <View style={s.profileDivider} />

            <View style={s.profileStatsRow}>
              <View style={[s.statBlock, { paddingLeft: 12 }]}>
                <Text style={s.statLabel}>Total Orders</Text>
                <Text style={s.statValue}>{totalOrders}</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statBlock}>
                <Text style={s.statLabel}>Account</Text>
                <Text style={s.statValue}>Active</Text>
              </View>
            </View>
          </View>

          {/* ── Free & Fast Delivery Banner ── */}
          <View style={s.freeDeliveryCard}>
            <View style={s.crownIconWrap}>
              <IconCrown />
            </View>
            <View style={s.freeDeliveryText}>
              <Text style={s.freeDeliveryTitle}>Free & Fast Delivery</Text>
              <Text style={s.freeDeliverySub}>Enjoy free, fast delivery on every order — no minimum needed</Text>
            </View>
          </View>

          {/* ── Account ── */}
          <Text style={s.sectionTitle}>Account</Text>
          <View style={s.gridWrap}>
            {ACCOUNT_ITEMS.map(({ label, sub, Icon, onPress }) => (
              <TouchableOpacity
                key={label}
                style={s.gridCard}
                activeOpacity={0.8}
                onPress={onPress}
              >
                <View style={s.gridIconWrap}>
                  <Icon />
                </View>
                <Text style={s.gridLabel}>{label}</Text>
                <View style={s.gridSubRow}>
                  <Text style={s.gridSub}>{sub}</Text>
                  <IconChevronRightSmall />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Support & Info ── */}
          <Text style={s.sectionTitle}>Support & Info</Text>
          <View style={s.menuCard}>
            {SUPPORT_ITEMS.map(({ label, sub, Icon, type }, i) => (
              <React.Fragment key={label}>
                <TouchableOpacity
                  style={s.menuRow}
                  onPress={() => rootNav.navigate('StaticContent', { type } as any)}
                  activeOpacity={0.72}
                >
                  <View style={s.menuIconWrap}>
                    <Icon />
                  </View>
                  <View style={s.menuText}>
                    <Text style={s.menuLabel}>{label}</Text>
                    <Text style={s.menuSub}>{sub}</Text>
                  </View>
                  <IconChevronRightSmall />
                </TouchableOpacity>
                {i < SUPPORT_ITEMS.length - 1 && <View style={s.divider} />}
              </React.Fragment>
            ))}
          </View>

          {/* ── Logout ── */}
          <TouchableOpacity
            style={s.logoutBtn}
            activeOpacity={0.85}
            onPress={() => setShowLogoutModal(true)}
          >
            <IconLogOut />
            <Text style={s.logoutText}>Logout</Text>
          </TouchableOpacity>

          <View style={{ height: 16 }} />
        </ScrollView>
      )}

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
              <IconLogOutRed />
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

// ─── Guest Styles ─────────────────────────────────────────────────────────────
const g = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },

  heroCard: {
    backgroundColor: '#0F1320',
    borderRadius:    12,
    padding:         24,
    alignItems:      'center',
    marginTop:       8,
  },
  avatarCircle: {
    width:           80,
    height:          80,
    borderRadius:    40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    16,
    borderWidth:     1.5,
    borderColor:     'rgba(255,255,255,0.15)',
  },
  heroTitle: {
    fontFamily:        FontFamily.extraBold,
    fontSize:          20,
    color:             '#FFFFFF',
    marginBottom:      8,
    textAlign:         'center',
  },
  heroSub: {
    fontFamily:        FontFamily.regular,
    fontSize:          13,
    color:             '#9BA1AC',
    textAlign:         'center',
    lineHeight:        20,
    marginBottom:      24,
    paddingHorizontal: 8,
  },
  signInBtn: {
    width:           '100%',
    height:          50,
    borderRadius:    10,
    backgroundColor: IC,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    10,
  },
  signInBtnText: {
    fontFamily: FontFamily.bold,
    fontSize:   15,
    color:      '#FFFFFF',
  },
  registerBtn: {
    width:           '100%',
    height:          50,
    borderRadius:    10,
    borderWidth:     1.5,
    borderColor:     'rgba(255,255,255,0.2)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  registerBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize:   15,
    color:      '#FFFFFF',
  },

  perksRow: {
    flexDirection: 'row',
    gap:           10,
    marginTop:     14,
    marginBottom:  4,
  },
  perkCard: {
    flex:            1,
    backgroundColor: '#FFFFFF',
    borderRadius:    10,
    paddingVertical: 14,
    alignItems:      'center',
    gap:             8,
  },
  perkIconWrap: {
    width:           40,
    height:          40,
    borderRadius:    10,
    backgroundColor: '#E8F6ED',
    alignItems:      'center',
    justifyContent:  'center',
  },
  perkLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize:   11,
    color:      '#1A1A1A',
    textAlign:  'center',
  },

  sectionTitle: {
    fontFamily:   FontFamily.bold,
    fontSize:     15,
    color:        '#8D939D',
    marginTop:    20,
    marginBottom: 10,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius:    10,
    overflow:        'hidden',
  },
  menuRow: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 14,
    paddingVertical:   14,
    gap:               14,
  },
  menuIconWrap: {
    width:           40,
    height:          40,
    borderRadius:    8,
    backgroundColor: '#E8F6ED',
    alignItems:      'center',
    justifyContent:  'center',
  },
  menuText: { flex: 1 },
  menuLabel: {
    fontFamily: FontFamily.bold,
    fontSize:   14,
    color:      '#1A1A1A',
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
    marginLeft:      14 + 40 + 14,
  },
});

// ─── Authenticated Styles ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F5F5F5' },
  scroll: { paddingBottom: 24, paddingHorizontal: 16 },

  topBar: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 20,
    paddingTop:        6,
    paddingBottom:     12,
    backgroundColor:   '#F5F5F5',
  },
  topTitle: {
    fontFamily: FontFamily.extraBold,
    fontSize:   26,
    color:      '#161616',
  },
  topActions: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  iconBtn: {
    width:          42,
    height:         42,
    alignItems:     'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position:          'absolute',
    top:               4,
    right:             4,
    minWidth:          16,
    height:            16,
    borderRadius:      8,
    backgroundColor:   IC,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: 3,
    borderWidth:       1.5,
    borderColor:       '#F5F5F5',
  },
  bellBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize:   9,
    color:      '#FFFFFF',
  },

  profileCard: {
    backgroundColor: '#0F1320',
    borderRadius:    8,
    padding:         18,
    marginTop:       4,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           14,
  },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarFallback: {
    width:           64,
    height:          64,
    borderRadius:    32,
    backgroundColor: '#1F2A30',
    alignItems:      'center',
    justifyContent:  'center',
  },
  profileRightTouchable: {
    flex:          1,
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           8,
  },
  profileRight: { flex: 1, gap: 4, paddingTop: 2 },
  profileName: {
    fontFamily: FontFamily.bold,
    fontSize:   17,
    color:      '#FFFFFF',
  },
  profileEmail: {
    fontFamily: FontFamily.regular,
    fontSize:   13,
    color:      '#B7BCC6',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
    marginTop:     2,
  },
  infoText: {
    fontFamily: FontFamily.regular,
    fontSize:   13,
    color:      IC,
  },
  chevronBtn: { paddingTop: 4 },
  profileDivider: {
    height:           1,
    backgroundColor:  'rgba(255,255,255,0.1)',
    marginVertical:   16,
    marginHorizontal: 18,
  },
  profileStatsRow: { flexDirection: 'row', alignItems: 'center' },
  statBlock:       { flex: 1, gap: 4 },
  statDivider: {
    width:            1,
    height:           32,
    backgroundColor:  'rgba(255,255,255,0.12)',
    marginHorizontal: 12,
  },
  statLabel: {
    fontFamily: FontFamily.regular,
    fontSize:   12,
    color:      '#9BA1AC',
  },
  statValue: {
    fontFamily: FontFamily.extraBold,
    fontSize:   18,
    color:      '#FFFFFF',
  },

  freeDeliveryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius:    8,
    padding:         14,
    marginTop:       16,
    flexDirection:   'row',
    alignItems:      'center',
    gap:             12,
  },
  crownIconWrap: {
    width:           40,
    height:          40,
    borderRadius:    8,
    backgroundColor: '#E8F6ED',
    alignItems:      'center',
    justifyContent:  'center',
  },
  freeDeliveryText:  { flex: 1 },
  freeDeliveryTitle: {
    fontFamily: FontFamily.bold,
    fontSize:   14,
    color:      '#1A1A1A',
  },
  freeDeliverySub: {
    fontFamily: FontFamily.regular,
    fontSize:   12,
    color:      '#8D939D',
    marginTop:  2,
  },

  sectionTitle: {
    fontFamily:   FontFamily.bold,
    fontSize:     15,
    color:        '#8D939D',
    marginTop:    20,
    marginBottom: 10,
  },

  gridWrap: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    gap:            12,
    justifyContent: 'space-between',
  },
  gridCard: {
    flex:            1,
    minWidth:        '47%',
    maxWidth:        '47%',
    backgroundColor: '#FFFFFF',
    borderRadius:    8,
    padding:         14,
    gap:             10,
  },
  gridIconWrap: {
    width:           40,
    height:          40,
    borderRadius:    8,
    backgroundColor: '#E8F6ED',
    alignItems:      'center',
    justifyContent:  'center',
  },
  gridLabel: {
    fontFamily: FontFamily.bold,
    fontSize:   14,
    color:      '#1A1A1A',
  },
  gridSubRow: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    justifyContent: 'space-between',
    gap:            6,
  },
  gridSub: {
    flex:       1,
    fontFamily: FontFamily.regular,
    fontSize:   12,
    color:      '#8D939D',
    lineHeight: 16,
  },

  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius:    8,
    overflow:        'hidden',
  },
  menuRow: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 14,
    paddingVertical:   14,
    gap:               14,
  },
  menuIconWrap: {
    width:           40,
    height:          40,
    borderRadius:    8,
    backgroundColor: '#E8F6ED',
    alignItems:      'center',
    justifyContent:  'center',
  },
  menuText: { flex: 1 },
  menuLabel: {
    fontFamily: FontFamily.bold,
    fontSize:   14,
    color:      '#1A1A1A',
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
    marginLeft:      14 + 40 + 14,
  },

  logoutBtn: {
    marginTop:       20,
    height:          56,
    borderRadius:    8,
    backgroundColor: '#0F1320',
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             10,
  },
  logoutText: {
    fontFamily: FontFamily.bold,
    fontSize:   15,
    color:      '#FFFFFF',
  },

  modalOverlay: {
    flex:              1,
    backgroundColor:   'rgba(0,0,0,0.38)',
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: 30,
  },
  modalCard: {
    width:           '100%',
    backgroundColor: '#FFFFFF',
    borderRadius:    8,
    padding:         24,
    alignItems:      'center',
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
  modalActions: { flexDirection: 'row', gap: 10, width: '100%' },
  modalCancel: {
    flex:            1,
    height:          46,
    borderRadius:    8,
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
    borderRadius:    8,
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