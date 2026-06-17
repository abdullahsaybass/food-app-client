import React, { useEffect, useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert, Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FontFamily } from '../../../theme';
import { useOrderStore } from '../../order/store/order.store';
import { useAuthStore } from '../../auth/store/auth.store';

type Props = NativeStackScreenProps<any, 'SelectAddress'>;

const PRIMARY = '#16A34A';
const DANGER  = '#EF4444';

export interface Address {
  _id: string;
  type: 'home' | 'work' | 'other';
  label?: string;          // optional free-text display name
  recipientName: string;
  recipientPhone: string;
  street: string;
  atoll: string;
  island: string;
  city?: string;           // auto-derived on backend as "<island>, <atoll>"
  zip?: string;
  phone?: string;
  isDefault: boolean;
}

// Stable empty-array reference. Using `s.user?.addresses ?? []` directly inside
// a Zustand selector creates a brand new array on every call when `addresses`
// is undefined, which breaks useSyncExternalStore's reference check and causes
// "Maximum update depth exceeded".
const EMPTY_ADDRESSES: Address[] = [];

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconArrowLeft = ({ size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#111111" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconChevronRight = ({ size = 18, color = '#AAAAAA' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconDots = ({ size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={5} r={1.2} fill="#555555" />
    <Circle cx={12} cy={12} r={1.2} fill="#555555" />
    <Circle cx={12} cy={19} r={1.2} fill="#555555" />
  </Svg>
);

const IconPlus = ({ size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1={12} y1={5} x2={12} y2={19} stroke="#111111" strokeWidth={2} strokeLinecap="round" />
    <Line x1={5} y1={12} x2={19} y2={12} stroke="#111111" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const IconShield = ({ size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#333333" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconPinFilled = ({ size = 18, color = PRIMARY }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill={color} />
    <Circle cx={12} cy={9} r={2.5} fill="#FFFFFF" />
  </Svg>
);

// ── Address type icons (used as small badges + in the action sheet header) ───
const IconHomeType = ({ size = 14, color = PRIMARY }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="9 22 9 12 15 12 15 22" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconBriefcaseType = ({ size = 14, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={2} y={7} width={20} height={14} rx={2} stroke={color} strokeWidth={2} />
    <Path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={8} y1={14} x2={16} y2={14} stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const IconMapPinType = ({ size = 14, color = '#9333EA' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={9} r={2.5} stroke={color} strokeWidth={2} />
  </Svg>
);

// ── Action-sheet icons ────────────────────────────────────────────────────────
const IconEdit = ({ size = 18, color = '#111111' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconStar = ({ size = 18, color = '#F59E0B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.8-6.3 3.8 1.7-7-5.4-4.7 7.1-.6z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
  </Svg>
);

const IconTrash = ({ size = 18, color = DANGER }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={10} y1={11} x2={10} y2={17} stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1={14} y1={11} x2={14} y2={17} stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// ─── Address type → icon / color mapping ───────────────────────────────────────
const TYPE_META: Record<Address['type'], {
  bg: string; fg: string; Icon: React.FC<{ size?: number; color?: string }>;
}> = {
  home:  { bg: '#F0FDF4', fg: PRIMARY,    Icon: IconHomeType },
  work:  { bg: '#EFF6FF', fg: '#2563EB',  Icon: IconBriefcaseType },
  other: { bg: '#FAF5FF', fg: '#9333EA',  Icon: IconMapPinType },
};

const capitalizeFirst = (str: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

const displayLabel = (address: Address) =>
  capitalizeFirst(address.label ? address.label : address.type);

// ─── Address Card ─────────────────────────────────────────────────────────────
const AddressCard: React.FC<{
  address: Address;
  selected: boolean;
  onSelect: () => void;
  onMenuPress: () => void;
}> = ({ address, selected, onSelect, onMenuPress }) => {
  const meta = TYPE_META[address.type] ?? TYPE_META.other;
  const TypeIcon = meta.Icon;

  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onSelect}
      activeOpacity={0.88}
    >
      <View style={styles.cardInner}>
        {/* Radio */}
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected && <View style={styles.radioDot} />}
        </View>

        {/* Body */}
        <View style={styles.cardBody}>
          <View style={styles.labelRow}>
            <View style={[styles.typeIconWrap, { backgroundColor: meta.bg }]}>
              <TypeIcon size={13} color={meta.fg} />
            </View>
            <Text style={styles.cardLabel}>{displayLabel(address)}</Text>
            {address.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
          </View>

          {!!address.recipientName && (
            <Text style={styles.cardLine}>{capitalizeFirst(address.recipientName)}</Text>
          )}
          <Text style={styles.cardLine}>{address.street}</Text>
          {!!address.island && (
            <Text style={styles.cardLine}>{address.island}</Text>
          )}
          <Text style={styles.cardLine}>
            {address.atoll}{address.zip ? ` ${address.zip}` : ''}, Maldives
          </Text>
          {!!(address.recipientPhone || address.phone) && (
            <Text style={styles.cardLine}>{address.recipientPhone || address.phone}</Text>
          )}
        </View>

        {/* 3-dot menu */}
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={onMenuPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconDots size={18} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────
export const SelectAddressScreen: React.FC<Props> = ({ navigation }) => {
  const storeAddresses     = useAuthStore(s => s.user?.addresses ?? EMPTY_ADDRESSES) as Address[];
  const fetchAddresses     = useAuthStore(s => s.fetchAddresses);
  const storeDelete        = useAuthStore(s => s.deleteAddress);
  const storeSetDefault    = useAuthStore(s => s.setDefaultAddress);
  const setPendingAddress  = useOrderStore(s => s.setPendingAddress);

  const [selected, setSelected] = React.useState<string | null>(null);
  const [loading, setLoading]   = React.useState(true);

  // Action-sheet (3-dot menu) + remove confirmation
  const [menuAddress, setMenuAddress]   = useState<Address | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<Address | null>(null);
  const [removing, setRemoving]         = useState(false);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const loadAddresses = useCallback(async () => {
    try {
      setLoading(true);
      await fetchAddresses();
    } catch {
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  }, [fetchAddresses]);

  useEffect(() => { loadAddresses(); }, [loadAddresses]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadAddresses);
    return unsubscribe;
  }, [navigation, loadAddresses]);

  useEffect(() => {
    if (storeAddresses.length && !selected) {
      const def = storeAddresses.find(a => a.isDefault);
      if (def) setSelected(def._id);
    }
  }, [storeAddresses]);

  const closeMenu = useCallback(() => setMenuAddress(null), []);

  // ── Edit ─────────────────────────────────────────────────────────────────
  const handleEdit = useCallback((addr: Address) => {
    setMenuAddress(null);
    setTimeout(() => (navigation as any).navigate('AddAddress', { address: addr }), 220);
  }, [navigation]);

  // ── Set as default ──────────────────────────────────────────────────────
  const handleSetDefault = useCallback(async (addr: Address) => {
    if (addr.isDefault) { closeMenu(); return; }
    setSettingDefaultId(addr._id);
    try {
      await storeSetDefault(addr._id);
      setSelected(addr._id);
      closeMenu();
    } catch {
      Alert.alert('Error', 'Failed to set default address');
    } finally {
      setSettingDefaultId(null);
    }
  }, [storeSetDefault, closeMenu]);

  // ── Remove ───────────────────────────────────────────────────────────────
  const handleRemoveRequest = useCallback((addr: Address) => {
    setMenuAddress(null);
    setTimeout(() => setConfirmRemove(addr), 220);
  }, []);

  const handleConfirmRemove = useCallback(async () => {
    if (!confirmRemove) return;
    setRemoving(true);
    try {
      await storeDelete(confirmRemove._id);
      if (selected === confirmRemove._id) setSelected(null);
      setConfirmRemove(null);
    } catch {
      Alert.alert('Error', 'Failed to remove address');
    } finally {
      setRemoving(false);
    }
  }, [confirmRemove, storeDelete, selected]);

  const selectedAddress = storeAddresses.find(a => a._id === selected);

  const handleUseAddress = () => {
    if (!selected || !selectedAddress) return;
    setPendingAddress({
      _id:        selectedAddress._id,
      label:      selectedAddress.label ?? selectedAddress.type,
      fullName:   selectedAddress.recipientName,
      phone:      selectedAddress.recipientPhone ?? selectedAddress.phone,
      street:     selectedAddress.street,
      city:       selectedAddress.city ?? `${selectedAddress.island}, ${selectedAddress.atoll}`,
      state:      selectedAddress.atoll,
      zip:        selectedAddress.zip,
      isDefault:  selectedAddress.isDefault,
    });
    navigation.goBack();
  };

  const menuMeta = menuAddress ? (TYPE_META[menuAddress.type] ?? TYPE_META.other) : null;
  const MenuTypeIcon = menuMeta?.Icon;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconArrowLeft size={22} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>My Addresses</Text>
        <TouchableOpacity
          style={styles.addNewTopBtn}
          onPress={() => (navigation as any).navigate('AddAddress')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconPlus size={15} />
          <Text style={styles.addNewTopText}>Add New Address</Text>
        </TouchableOpacity>
      </View>

      {/* ── Deliver To banner ── */}
      <View style={styles.deliverBanner}>
        <View style={styles.deliverIconWrap}>
          <IconPinFilled size={18} color={PRIMARY} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.deliverToLabel}>Deliver to</Text>
          <Text style={styles.deliverToCity} numberOfLines={1}>
            {selectedAddress
              ? [selectedAddress.island, selectedAddress.atoll, 'Maldives'].filter(Boolean).join(', ')
              : 'Select an address below'}
          </Text>
        </View>
      </View>

      {/* ── List ── */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#111111" size="large" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          <Text style={styles.sectionHeading}>Saved Addresses</Text>

          {storeAddresses.map(addr => (
            <AddressCard
              key={addr._id}
              address={addr}
              selected={selected === addr._id}
              onSelect={() => setSelected(addr._id)}
              onMenuPress={() => setMenuAddress(addr)}
            />
          ))}

          {storeAddresses.length === 0 && (
            <Text style={styles.emptyText}>No addresses saved yet</Text>
          )}

          {/* ── Security badge ── */}
          <View style={styles.securityBadge}>
            <View style={styles.securityLeft}>
              <IconShield size={18} />
              <View style={styles.securityText}>
                <Text style={styles.securityTitle}>Your addresses are secure</Text>
                <Text style={styles.securitySub}>
                  We use industry-standard encryption{'\n'}to protect your information.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* ── Footer CTA ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.useBtn, !selected && styles.useBtnDisabled]}
          activeOpacity={selected ? 0.85 : 1}
          onPress={handleUseAddress}
        >
          <Text style={[styles.useBtnText, !selected && { color: '#CCCCCC' }]}>Deliver to this address</Text>
        </TouchableOpacity>
      </View>

      {/* ── Address actions bottom sheet ── */}
      <Modal
        visible={!!menuAddress}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.sheetOverlay} onPress={closeMenu}>
          <Pressable style={styles.actionSheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />

            {menuAddress && menuMeta && MenuTypeIcon && (
              <>
                <View style={styles.sheetHeader}>
                  <View style={[styles.sheetTypeIcon, { backgroundColor: menuMeta.bg }]}>
                    <MenuTypeIcon size={20} color={menuMeta.fg} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetTitle}>{displayLabel(menuAddress)}</Text>
                    <Text style={styles.sheetSubtitle} numberOfLines={1}>{menuAddress.street}</Text>
                  </View>
                </View>

                <View style={styles.sheetDivider} />

                <TouchableOpacity style={styles.sheetRow} onPress={() => handleEdit(menuAddress)} activeOpacity={0.7}>
                  <View style={styles.sheetRowIcon}>
                    <IconEdit size={17} />
                  </View>
                  <Text style={styles.sheetRowText}>Edit address</Text>
                  <IconChevronRight size={16} />
                </TouchableOpacity>

                {!menuAddress.isDefault && (
                  <TouchableOpacity style={styles.sheetRow} onPress={() => handleSetDefault(menuAddress)} activeOpacity={0.7}>
                    <View style={styles.sheetRowIcon}>
                      <IconStar size={17} />
                    </View>
                    <Text style={styles.sheetRowText}>Set as default</Text>
                    {settingDefaultId === menuAddress._id
                      ? <ActivityIndicator size="small" color={PRIMARY} />
                      : <IconChevronRight size={16} />
                    }
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.sheetRow} onPress={() => handleRemoveRequest(menuAddress)} activeOpacity={0.7}>
                  <View style={[styles.sheetRowIcon, styles.sheetRowIconDanger]}>
                    <IconTrash size={17} />
                  </View>
                  <Text style={[styles.sheetRowText, styles.sheetRowTextDanger]}>Remove address</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.sheetCancelBtn} onPress={closeMenu} activeOpacity={0.8}>
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Remove confirmation ── */}
      <Modal
        visible={!!confirmRemove}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmRemove(null)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIconWrap}>
              <IconTrash size={26} color={DANGER} />
            </View>
            <Text style={styles.confirmTitle}>Remove this address?</Text>
            <Text style={styles.confirmMessage}>
              {confirmRemove ? `${displayLabel(confirmRemove)} · ${confirmRemove.street} will be removed from your saved addresses.` : ''}
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={() => setConfirmRemove(null)}
                activeOpacity={0.8}
                disabled={removing}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmRemoveBtn}
                onPress={handleConfirmRemove}
                activeOpacity={0.85}
                disabled={removing}
              >
                {removing
                  ? <ActivityIndicator color="#FFFFFF" size="small" />
                  : <Text style={styles.confirmRemoveText}>Remove</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  topBtn: {
    width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  topTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: '#111111',
    letterSpacing: -0.3,
  },
  addNewTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  addNewTopText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 13,
    color: '#111111',
  },

  deliverBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  deliverIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F0FDF4',
    alignItems: 'center', justifyContent: 'center',
  },
  deliverToLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: '#888888',
    marginBottom: 2,
  },
  deliverToCity: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: '#111111',
    letterSpacing: -0.2,
  },

  sectionHeading: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: '#111111',
    marginBottom: 12,
    letterSpacing: -0.2,
  },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 20 },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 32,
  },

  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  cardSelected: {
    borderColor: PRIMARY,
    borderWidth: 1.5,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 14,
  },
  cardBody: { flex: 1 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  typeIconWrap: {
    width: 26, height: 26, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  cardLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: '#111111',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  defaultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 50,
    backgroundColor: '#F0FDF4',
  },
  defaultBadgeText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    color: PRIMARY,
  },
  cardLine: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: '#555555',
    lineHeight: 20,
  },
  menuBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F7F7F7',
    alignItems: 'center', justifyContent: 'center',
  },

  radio: {
    width: 20, height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  radioSelected: { borderColor: PRIMARY, borderWidth: 2 },
  radioDot: {
    width: 10, height: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY,
  },

  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 16,
    marginTop: 8,
  },
  securityLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  securityText: { flex: 1 },
  securityTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: '#111111',
    marginBottom: 3,
  },
  securitySub: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: '#888888',
    lineHeight: 17,
  },

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  useBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  useBtnDisabled: { borderColor: '#CCCCCC' },
  useBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: PRIMARY,
    letterSpacing: -0.2,
  },

  // ── Action sheet ──────────────────────────────────────────────────────────
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17,17,17,0.45)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: '#E5E5E5',
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sheetTypeIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  sheetTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: '#111111',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  sheetSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: '#999999',
  },
  sheetDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 4,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 13,
  },
  sheetRowIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F7F7F7',
    alignItems: 'center', justifyContent: 'center',
  },
  sheetRowIconDanger: {
    backgroundColor: '#FEF2F2',
  },
  sheetRowText: {
    flex: 1,
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: '#111111',
  },
  sheetRowTextDanger: {
    color: DANGER,
  },
  sheetCancelBtn: {
    marginTop: 10,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCancelText: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: '#444444',
  },

  // ── Remove confirmation ──────────────────────────────────────────────────
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17,17,17,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  confirmCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  confirmIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#FEF2F2',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: '#111111',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmMessage: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  confirmCancelBtn: {
    flex: 1, height: 50, borderRadius: 14,
    backgroundColor: '#F5F5F5',
    alignItems: 'center', justifyContent: 'center',
  },
  confirmCancelText: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: '#444444',
  },
  confirmRemoveBtn: {
    flex: 1, height: 50, borderRadius: 14,
    backgroundColor: DANGER,
    alignItems: 'center', justifyContent: 'center',
  },
  confirmRemoveText: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});