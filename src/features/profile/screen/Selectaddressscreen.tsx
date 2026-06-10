import React, { useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography, FontFamily } from '../../../theme';
import { useOrderStore } from '../../order/store/order.store';
import { useAuthStore } from '../../auth/store/auth.store';

type Props = NativeStackScreenProps<any, 'SelectAddress'>;

export interface Address {
  _id: string;
  label: string;
  recipientName: string;
  recipientPhone: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state?: string;
  zip?: string;
  phone?: string;
  isDefault: boolean;
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconArrowLeft = ({ size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#111111" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconChevronDown = ({ size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 9l6 6 6-6" stroke="#111111" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconChevronRight = ({ size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke="#AAAAAA" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconDots = ({ size = 20 }) => (
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

// ─── Address Card ─────────────────────────────────────────────────────────────
const AddressCard: React.FC<{
  address: Address;
  selected: boolean;
  onSelect: () => void;
  onMenuPress: () => void;
}> = ({ address, selected, onSelect, onMenuPress }) => {
  const displayLabel = address.label
    ? address.label.charAt(0).toUpperCase() + address.label.slice(1)
    : address.type.charAt(0).toUpperCase() + address.type.slice(1);

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
            <Text style={styles.cardLabel}>{displayLabel}</Text>
            {address.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
          </View>

          {!!address.recipientName && (
            <Text style={styles.cardLine}>{address.recipientName}</Text>
          )}
          <Text style={styles.cardLine}>{address.street}</Text>
          {!!address.state && (
            <Text style={styles.cardLine}>{address.state}</Text>
          )}
          <Text style={styles.cardLine}>
            {address.city}{address.zip ? ` ${address.zip}` : ''}, Maldives
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
          <IconDots size={20} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────
export const SelectAddressScreen: React.FC<Props> = ({ navigation }) => {
  const storeAddresses    = useAuthStore(s => s.user?.addresses ?? []) as Address[];
  const fetchAddresses    = useAuthStore(s => s.fetchAddresses);
  const storeDelete       = useAuthStore(s => s.deleteAddress);
  const setPendingAddress = useOrderStore(s => s.setPendingAddress);

  const [selected, setSelected] = React.useState<string | null>(null);
  const [loading, setLoading]   = React.useState(true);

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

  const handleMenuPress = (addr: Address) => {
    Alert.alert(
      addr.label || addr.type,
      undefined,
      [
        {
          text: 'Edit',
          onPress: () => (navigation as any).navigate('AddAddress', { address: addr }),
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Remove Address', 'Are you sure you want to remove this address?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Remove', style: 'destructive', onPress: async () => {
                  try {
                    await storeDelete(addr._id);
                    if (selected === addr._id) setSelected(null);
                  } catch {
                    Alert.alert('Error', 'Failed to remove address');
                  }
                },
              },
            ]),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const selectedAddress = storeAddresses.find(a => a._id === selected);

  const handleUseAddress = () => {
    if (!selected || !selectedAddress) return;
    setPendingAddress({
      _id:        selectedAddress._id,
      label:      selectedAddress.type,
      fullName:   selectedAddress.recipientName,
      phone:      selectedAddress.recipientPhone ?? selectedAddress.phone,
      street:     selectedAddress.street,
      city:       selectedAddress.city,
      state:      selectedAddress.state,
      postalCode: selectedAddress.zip,
      isDefault:  selectedAddress.isDefault,
    });
    navigation.goBack();
  };

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
      <TouchableOpacity style={styles.deliverBanner} activeOpacity={0.8}>
        <View>
          <Text style={styles.deliverToLabel}>Deliver to</Text>
          <Text style={styles.deliverToCity}>
            {selectedAddress
              ? [selectedAddress.city?.replace(/\b\w/g, c => c.toUpperCase()), 'Maldives'].filter(Boolean).join(', ')
              : 'Select an address'}
          </Text>
        </View>
        <IconChevronDown size={20} />
      </TouchableOpacity>

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
              onMenuPress={() => handleMenuPress(addr)}
            />
          ))}

          {storeAddresses.length === 0 && (
            <Text style={styles.emptyText}>No addresses saved yet</Text>
          )}

          {/* ── Security badge ── */}
          <TouchableOpacity style={styles.securityBadge} activeOpacity={0.8}>
            <View style={styles.securityLeft}>
              <IconShield size={18} />
              <View style={styles.securityText}>
                <Text style={styles.securityTitle}>Your addresses are secure</Text>
                <Text style={styles.securitySub}>
                  We use industry-standard encryption{'\n'}to protect your information.
                </Text>
              </View>
            </View>
            <IconChevronRight size={18} />
          </TouchableOpacity>
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
    fontFamily: FontFamily.bold,       // ← DM Sans Bold
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
    fontFamily: FontFamily.semiBold,   // ← DM Sans SemiBold
    fontSize: 13,
    color: '#111111',
  },

  deliverBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  deliverToLabel: {
    fontFamily: FontFamily.regular,    // ← DM Sans Regular
    fontSize: 12,
    color: '#888888',
    marginBottom: 2,
  },
  deliverToCity: {
    fontFamily: FontFamily.bold,       // ← DM Sans Bold
    fontSize: 15,
    color: '#111111',
    letterSpacing: -0.2,
  },

  sectionHeading: {
    fontFamily: FontFamily.bold,       // ← DM Sans Bold
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
    borderColor: '#16A34A',
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
    marginBottom: 6,
  },
  cardLabel: {
    fontFamily: FontFamily.bold,       // ← DM Sans Bold
    fontSize: 15,
    color: '#111111',
    letterSpacing: -0.2,
  },
  defaultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  defaultBadgeText: {
    fontFamily: FontFamily.medium,     // ← DM Sans Medium
    fontSize: 11,
    color: '#444444',
  },
  cardLine: {
    fontFamily: FontFamily.regular,    // ← DM Sans Regular
    fontSize: 13,
    color: '#555555',
    lineHeight: 20,
  },
  menuBtn: {
    paddingLeft: 4,
    paddingTop: 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
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
  radioSelected: { borderColor: '#16A34A', borderWidth: 2 },
  radioDot: {
    width: 10, height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A',
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
    fontFamily: FontFamily.bold,       // ← DM Sans Bold
    fontSize: 13,
    color: '#111111',
    marginBottom: 3,
  },
  securitySub: {
    fontFamily: FontFamily.regular,    // ← DM Sans Regular
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
    borderColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  useBtnDisabled: { borderColor: '#CCCCCC' },
  useBtnText: {
    fontFamily: FontFamily.bold,       // ← DM Sans Bold
    fontSize: 16,
    color: '#16A34A',
    letterSpacing: -0.2,
  },
});