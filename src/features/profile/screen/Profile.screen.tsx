import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Modal, StatusBar, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography, Radius } from '../../../theme';
import { useAuthStore } from '../../auth/store/auth.store';
import type { ProfileStackParamList } from '../../../app/navigation/navigation.types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileHome'>;

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconUser = ({ color = '#555', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={7} r={4} stroke={color} strokeWidth={1.8} />
  </Svg>
);

const IconMapPin = ({ color = '#555', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={9} r={2.5} stroke={color} strokeWidth={1.8} />
  </Svg>
);

const IconPackage = ({ color = '#555', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconShoppingCart = ({ color = '#555', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={3} y1={6} x2={21} y2={6} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M16 10a4 4 0 0 1-8 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconShield = ({ color = '#555', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconFileText = ({ color = '#555', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="14 2 14 8 20 8" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={16} y1={13} x2={8} y2={13} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Line x1={16} y1={17} x2={8} y2={17} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Polyline points="10 9 9 9 8 9" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

const IconLogOut = ({ color = '#E53935', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="16 17 21 12 16 7" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={21} y1={12} x2={9} y2={12} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

const IconBell = ({ color = '#555', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconTag = ({ color = '#555', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={7} y1={7} x2={7.01} y2={7} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

const IconClock = ({ color = '#555', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={1.8} />
    <Polyline points="12 6 12 12 16 14" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconChevronRight = ({ color = '#CBD5E1', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconShoppingBag = ({ color = '#555', size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={3} y1={6} x2={21} y2={6} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M16 10a4 4 0 0 1-8 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Menu config ──────────────────────────────────────────────────────────────
const MENU_ITEMS = [
  { id: 'edit',    label: 'My Profile',         bg: '#EDF7ED', iconColor: '#2E7D32', route: 'EditProfile', Icon: IconUser },
  { id: 'address', label: 'Address Management', bg: '#FFF8E7', iconColor: '#F57F17', route: 'EditProfile', Icon: IconMapPin },
  { id: 'orders',  label: 'Order History',      bg: '#EDF3FF', iconColor: '#1565C0', route: null,          Icon: IconPackage },
  { id: 'cart',    label: 'My Cart',            bg: '#FFF0F7', iconColor: '#AD1457', route: null,          Icon: IconShoppingCart },
  { id: 'privacy', label: 'Privacy Settings',   bg: '#F0F7FF', iconColor: '#0277BD', route: null,          Icon: IconShield },
  { id: 'terms',   label: 'Terms & Conditions', bg: '#F5F0FF', iconColor: '#6A1B9A', route: null,          Icon: IconFileText },
  { id: 'logout',  label: 'Log Out',            bg: '#FFF0F0', iconColor: '#E53935', route: null,          Icon: IconLogOut, isDanger: true },
] as const;

// ─── Animated Menu Item ───────────────────────────────────────────────────────
const AnimatedMenuItem = ({
  item, index, isLast, onPress,
}: {
  item: typeof MENU_ITEMS[number];
  index: number;
  isLast: boolean;
  onPress: () => void;
}) => {
  const translateX = useRef(new Animated.Value(40)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, { toValue: 0, duration: 350, delay: index * 55, useNativeDriver: true }),
      Animated.timing(opacity,    { toValue: 1, duration: 350, delay: index * 55, useNativeDriver: true }),
    ]).start();
  }, []);

  const onPressIn  = () => Animated.spring(scale, { toValue: 0.97, speed: 50, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    speed: 50, useNativeDriver: true }).start();

  const isDanger = (item as any).isDanger;

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }, { scale }] }}>
      <TouchableOpacity
        style={styles.menuRow}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <View style={[styles.menuIconWrap, { backgroundColor: item.bg }]}>
          <item.Icon color={item.iconColor} size={20} />
        </View>

        <Text style={[styles.menuLabel, isDanger && styles.menuLabelDanger]}>
          {item.label}
        </Text>

        <View style={[styles.chevronWrap, isDanger && styles.chevronWrapDanger]}>
          <IconChevronRight color={isDanger ? '#E53935' : '#CBD5E1'} size={16} />
        </View>
      </TouchableOpacity>
      {!isLast && <View style={styles.menuDivider} />}
    </Animated.View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────
export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const user      = useAuthStore(s => s.user);
  const logout    = useAuthStore(s => s.logout);
  const fetchUser = useAuthStore(s => s.fetchUser);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => { fetchUser(); }, []);

  const handleMenuPress = (item: typeof MENU_ITEMS[number]) => {
    if (item.id === 'logout') { setShowLogoutModal(true); return; }
    if (item.route) navigation.navigate(item.route as any);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F9F5" />

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.topBtn}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke={Colors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>

        <Text style={styles.topTitle}>Profile</Text>

        <TouchableOpacity style={styles.topBtn} onPress={() => navigation.navigate('EditProfile')}>
          <IconShoppingBag color={Colors.textPrimary} size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ── Profile header ── */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarWrap}>
              {user?.profilePic?.url ? (
                <Image source={{ uri: user.profilePic.url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>
                    {user?.name?.charAt(0).toUpperCase() ?? '?'}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.userName}>{user?.name ?? 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
        </View>

        {/* ── Quick action tabs ── */}
        <View style={styles.tabsCard}>
          <TouchableOpacity style={styles.tabItem}>
            <View style={styles.tabIconWrap}>
              <IconBell color="#2E7D32" size={20} />
            </View>
            <Text style={styles.tabLabel}>Notification</Text>
          </TouchableOpacity>

          <View style={styles.tabDivider} />

          <TouchableOpacity style={styles.tabItem}>
            <View style={styles.tabIconWrap}>
              <IconTag color="#F57F17" size={20} />
            </View>
            <Text style={styles.tabLabel}>Voucher</Text>
          </TouchableOpacity>

          <View style={styles.tabDivider} />

          <TouchableOpacity style={styles.tabItem}>
            <View style={styles.tabIconWrap}>
              <IconClock color="#1565C0" size={20} />
            </View>
            <Text style={styles.tabLabel}>History</Text>
          </TouchableOpacity>
        </View>

        {/* ── Menu ── */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <AnimatedMenuItem
              key={item.id}
              item={item}
              index={index}
              isLast={index === MENU_ITEMS.length - 1}
              onPress={() => handleMenuPress(item)}
            />
          ))}
        </View>

      </ScrollView>

      {/* ── Logout modal ── */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <IconLogOut color="#E53935" size={26} />
            </View>
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalBody}>Are you sure you want to log out?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={() => { setShowLogoutModal(false); logout(); }}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmText}>Yes, Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F9F5' },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#F5F9F5',
  },
  topBtn:   { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  topTitle: { ...Typography.headingMedium, color: Colors.textPrimary },

  profileHeader: { alignItems: 'center', paddingTop: 12, paddingBottom: 24 },
  avatarRing: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: Colors.primary,
    padding: 3, marginBottom: 14,
  },
  avatarWrap:     { flex: 1, borderRadius: 47, overflow: 'hidden', backgroundColor: Colors.primarySurface },
  avatar:         { width: '100%', height: '100%' },
  avatarFallback: { flex: 1, backgroundColor: Colors.primarySurface, alignItems: 'center', justifyContent: 'center' },
  avatarInitial:  { ...Typography.headingLarge, color: Colors.primary },
  userName:       { ...Typography.headingMedium, color: Colors.textPrimary, marginBottom: 4 },
  userEmail:      { ...Typography.bodyMedium, color: Colors.textSecondary },

  tabsCard: {
    flexDirection: 'row', marginHorizontal: 20,
    backgroundColor: Colors.white, borderRadius: 16,
    paddingVertical: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
  },
  tabItem:    { flex: 1, alignItems: 'center', gap: 8 },
  tabIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: '#F0F7F0', alignItems: 'center', justifyContent: 'center',
  },
  tabLabel:   { ...Typography.bodySmall, color: Colors.textSecondary },
  tabDivider: { width: 1, backgroundColor: '#EEEEEE' },

  menuCard: {
    marginHorizontal: 20, backgroundColor: Colors.white, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13, gap: 12,
  },
  menuIconWrap: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel:       { ...Typography.titleMedium, color: Colors.textPrimary, flex: 1 },
  menuLabelDanger: { color: '#E53935' },
  chevronWrap: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center',
  },
  chevronWrapDanger: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center',
  },
  menuDivider: { height: 1, backgroundColor: '#F5F5F5', marginHorizontal: 16 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: Colors.white, borderRadius: 24,
    padding: 28, width: '100%', alignItems: 'center',
  },
  modalIconWrap: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#FFF0F0', alignItems: 'center',
    justifyContent: 'center', marginBottom: 14,
  },
  modalTitle:       { ...Typography.headingMedium, color: Colors.textPrimary, marginBottom: 8 },
  modalBody:        { ...Typography.bodyMedium, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24 },
  modalActions:     { flexDirection: 'row', gap: 12, width: '100%' },
  modalCancelBtn:   { flex: 1, height: 48, borderRadius: 50, backgroundColor: '#F4F6F8', alignItems: 'center', justifyContent: 'center' },
  modalCancelText:  { ...Typography.labelLarge, color: Colors.textPrimary },
  modalConfirmBtn:  { flex: 1, height: 48, borderRadius: 50, backgroundColor: '#E53935', alignItems: 'center', justifyContent: 'center' },
  modalConfirmText: { ...Typography.labelLarge, color: Colors.white },
});