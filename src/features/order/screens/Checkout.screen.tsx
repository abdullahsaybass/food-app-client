/**
 * Checkout.screen.tsx — Flipkart-style address selector + new address form
 *
 * Flow:
 *  1. Shows saved addresses as radio cards (like Flipkart)
 *  2. "+ Add new address" expands an inline form
 *  3. Order summary at bottom with Place Order CTA
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, ActivityIndicator,
  KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Typography, Radius } from '../../../theme';
import { useProductStore } from '../../product/store/product.store';
import { useAuthStore }    from '../../auth/store/auth.store';
import { useOrderStore }   from '../store/order.store';
import { formatOrderPrice } from '../utils/order.utils';
import type { DeliveryAddress } from '../types/order.types';
import type { OrderStackParamList } from '../navigation.types';

type Nav = NativeStackNavigationProp<OrderStackParamList, 'Checkout'>;

const SHIPPING = 30;

// ─── Saved address type (mirrors user.addresses from backend) ─────────────────
interface SavedAddress {
  _id?:       string;
  label?:     'home' | 'work' | 'other';
  fullName?:  string;
  street:     string;
  city:       string;
  state?:     string;
  postalCode?: string;
  country?:   string;
  isDefault?: boolean;
}

// ─── Label chip ───────────────────────────────────────────────────────────────
const LABEL_COLORS: Record<string, { bg: string; text: string }> = {
  home:  { bg: '#E8F5E9', text: '#2E7D32' },
  work:  { bg: '#E3F2FD', text: '#1565C0' },
  other: { bg: '#FFF3E0', text: '#E65100' },
};

const LabelChip: React.FC<{ label?: string }> = ({ label }) => {
  if (!label) return null;
  const colors = LABEL_COLORS[label] ?? LABEL_COLORS.other;
  return (
    <View style={[chipStyles.chip, { backgroundColor: colors.bg }]}>
      <Text style={[chipStyles.text, { color: colors.text }]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
};

const chipStyles = StyleSheet.create({
  chip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  text: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
});

// ─── Address radio card ───────────────────────────────────────────────────────
interface AddressCardProps {
  address:    SavedAddress;
  selected:   boolean;
  onSelect:   () => void;
  userName?:  string;
  userPhone?: string;
}

const AddressCard: React.FC<AddressCardProps> = ({
  address, selected, onSelect, userName, userPhone,
}) => {
  const name  = address.fullName  || userName  || '';
  const phone = userPhone || '';
  const lines = [
    address.street,
    [address.city, address.state].filter(Boolean).join(', '),
    address.postalCode,
  ].filter(Boolean);

  return (
    <TouchableOpacity
      style={[addrStyles.card, selected && addrStyles.cardSelected]}
      onPress={onSelect}
      activeOpacity={0.85}
    >
      {/* Radio dot */}
      <View style={[addrStyles.radio, selected && addrStyles.radioSelected]}>
        {selected ? <View style={addrStyles.radioDot} /> : null}
      </View>

      <View style={addrStyles.body}>
        {/* Name + label row */}
        <View style={addrStyles.nameRow}>
          <Text style={addrStyles.name}>{name}</Text>
          <LabelChip label={address.label} />
          {address.isDefault ? (
            <View style={addrStyles.defaultBadge}>
              <Text style={addrStyles.defaultText}>DEFAULT</Text>
            </View>
          ) : null}
        </View>

        {phone ? <Text style={addrStyles.phone}>{phone}</Text> : null}

        {lines.map((line, i) => (
          <Text key={i} style={addrStyles.line}>{line}</Text>
        ))}

        {selected ? (
          <TouchableOpacity style={addrStyles.deliverBtn} onPress={onSelect} activeOpacity={0.8}>
            <Text style={addrStyles.deliverBtnText}>DELIVER HERE</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const addrStyles = StyleSheet.create({
  card: {
    flexDirection: 'row', padding: 16, gap: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  cardSelected: {
    backgroundColor: '#FAFFFE',
    borderLeftWidth: 3, borderLeftColor: Colors.primary,
  },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
  },
  radioSelected: { borderColor: Colors.primary },
  radioDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  body:    { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name:    { ...Typography.titleMedium, color: Colors.textPrimary, fontWeight: '700' },
  phone:   { ...Typography.bodyMedium, color: Colors.textPrimary },
  line:    { ...Typography.bodyMedium, color: Colors.textSecondary },
  defaultBadge: {
    backgroundColor: '#E8F5E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  defaultText: { fontSize: 10, fontWeight: '800', color: '#2E7D32', letterSpacing: 0.6 },
  deliverBtn: {
    marginTop: 12, alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 4,
  },
  deliverBtnText: { ...Typography.labelLarge, color: Colors.white, fontSize: 13, letterSpacing: 0.5 },
});

// ─── Field ────────────────────────────────────────────────────────────────────
interface FieldProps {
  label:         string;
  value:         string;
  onChange:      (v: string) => void;
  placeholder?:  string;
  keyboardType?: 'default' | 'phone-pad' | 'numeric';
  required?:     boolean;
}

const Field: React.FC<FieldProps> = ({
  label, value, onChange, placeholder, keyboardType = 'default', required,
}) => (
  <View style={fieldStyles.wrap}>
    <Text style={fieldStyles.label}>
      {label}
      {required ? <Text style={fieldStyles.required}> *</Text> : null}
    </Text>
    <TextInput
      style={fieldStyles.input}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder ?? label}
      placeholderTextColor={Colors.textDisabled}
      keyboardType={keyboardType}
      autoCapitalize={keyboardType === 'phone-pad' ? 'none' : 'words'}
    />
  </View>
);

const fieldStyles = StyleSheet.create({
  wrap:     { gap: 6 },
  label:    {
    ...Typography.bodySmall, color: Colors.textSecondary,
    fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6,
  },
  required: { color: Colors.error },
  input:    {
    height: 50, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 14,
    ...Typography.bodyMedium, color: Colors.textPrimary,
    backgroundColor: Colors.white,
  },
});

// ─── Section header (Flipkart step style) ─────────────────────────────────────
const StepHeader: React.FC<{ step: number; title: string; done?: boolean }> = ({
  step, title, done,
}) => (
  <View style={stepStyles.row}>
    <View style={[stepStyles.badge, done && stepStyles.badgeDone]}>
      {done
        ? <Text style={stepStyles.badgeText}>✓</Text>
        : <Text style={stepStyles.badgeText}>{step}</Text>
      }
    </View>
    <Text style={stepStyles.title}>{title}</Text>
    {done ? <Text style={stepStyles.doneText}>CHANGE</Text> : null}
  </View>
);

const stepStyles = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  badge:     { width: 24, height: 24, borderRadius: 12, backgroundColor: '#2874F0', alignItems: 'center', justifyContent: 'center' },
  badgeDone: { backgroundColor: '#388E3C' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  title:     { ...Typography.titleMedium, color: Colors.textPrimary, fontWeight: '700', flex: 1 },
  doneText:  { ...Typography.bodySmall, color: '#2874F0', fontWeight: '700' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const CheckoutScreen: React.FC = () => {
  const navigation  = useNavigation<Nav>();
  const insets      = useSafeAreaInsets();

  const cartItems   = useProductStore(s => s.cartItems);
  const cartTotal   = useProductStore(s => s.cartTotal);
  const clearCart   = useProductStore(s => s.clearCart);

  const isLoggedIn  = useAuthStore(s => !!s.token);
  const profile     = useAuthStore(s => s.user);

  const placeOrder  = useOrderStore(s => s.placeOrder);
  const isPlacing   = useOrderStore(s => s.isPlacing);
  const placeError  = useOrderStore(s => s.placeError);
  const clearErrors = useOrderStore(s => s.clearErrors);

  const total = cartTotal + SHIPPING;

  // ── Saved addresses from profile ───────────────────────────────────────────
  const savedAddresses: SavedAddress[] = (profile?.addresses ?? []) as SavedAddress[];

  // Find default address index
  const defaultIdx = savedAddresses.findIndex(a => a.isDefault) >= 0
    ? savedAddresses.findIndex(a => a.isDefault)
    : savedAddresses.length > 0 ? 0 : -1;

  const [selectedIdx, setSelectedIdx] = useState<number>(defaultIdx);
  const [showNewForm, setShowNewForm]  = useState(savedAddresses.length === 0);

  // New address form state
  const [fullName,   setFullName]   = useState('');
  const [phone,      setPhone]      = useState('');
  const [street,     setStreet]     = useState('');
  const [city,       setCity]       = useState('');
  const [stateName,  setStateName]  = useState('');
  const [postalCode, setPostalCode] = useState('');

  const [validationError, setValidationError] = useState<string | null>(null);

  // Animate the new address form
  const formAnim = useRef(new Animated.Value(showNewForm ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(formAnim, {
      toValue: showNewForm ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [showNewForm]);

  // Prefill new form with profile name/phone as defaults
  useEffect(() => {
    if (!profile) return;
    setFullName(profile.name  ?? '');
    setPhone(profile.phone    ?? '');
  }, [profile]);

  useEffect(() => () => { clearErrors(); }, []);

  // ── Validate ───────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    if (selectedIdx === -1 && !showNewForm) {
      setValidationError('Please select a delivery address.'); return false;
    }
    if (showNewForm && selectedIdx === -1) {
      if (!fullName.trim())  { setValidationError('Full name is required.'); return false; }
      if (!phone.trim())     { setValidationError('Phone number is required.'); return false; }
      if (!street.trim())    { setValidationError('Street address is required.'); return false; }
      if (!city.trim())      { setValidationError('City is required.'); return false; }
    }
    return true;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setValidationError(null);
    if (!validate()) return;

    let deliveryAddress: DeliveryAddress;

    if (selectedIdx >= 0 && !showNewForm) {
      // Use saved address
      const saved = savedAddresses[selectedIdx];
      deliveryAddress = {
        fullName:   saved.fullName  || profile?.name  || '',
        phone:      profile?.phone  || '',
        street:     saved.street,
        city:       saved.city,
        state:      saved.state,
        postalCode: saved.postalCode,
      };
    } else {
      // Use new form values
      deliveryAddress = {
        fullName:   fullName.trim(),
        phone:      phone.trim(),
        street:     street.trim(),
        city:       city.trim(),
        state:      stateName.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
      };
    }

    const order = await placeOrder({
      deliveryAddress,
      items: cartItems.map(({ product, quantity }) => ({
        product:  product.id,
        name:     product.name,
        quantity,
        price:    product.price,
      })),
    });
    if (order) {
      await clearCart();
      navigation.replace('OrderSuccess', { orderId: order.id });
    }
  };

  const displayError = validationError ?? placeError;

  // ── Guest wall ─────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.guestWall}>
          <Text style={styles.guestEmoji}>🔐</Text>
          <Text style={styles.guestTitle}>Sign in to continue</Text>
          <Text style={styles.guestSubtitle}>
            {'Create an account or log in to place your order.\nYour cart is saved.'}
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => (navigation as any).navigate('Login')}>
            <Text style={styles.primaryBtnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineBtn} onPress={() => (navigation as any).navigate('Register')}>
            <Text style={styles.outlineBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Checkout ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Error banner */}
          {displayError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{`⚠️  ${displayError}`}</Text>
            </View>
          ) : null}

          {/* ── STEP 1: LOGIN (done) ── */}
          <View style={styles.stepBlock}>
            <View style={styles.stepDoneRow}>
              <View style={[stepStyles.badge, stepStyles.badgeDone]}>
                <Text style={stepStyles.badgeText}>✓</Text>
              </View>
              <Text style={styles.stepDoneTitle}>LOGIN</Text>
              <View style={styles.stepDoneInfo}>
                <Text style={styles.stepDoneName}>{profile?.name ?? ''}</Text>
                <Text style={styles.stepDonePhone}>{profile?.phone ?? ''}</Text>
              </View>
            </View>
          </View>

          {/* ── STEP 2: DELIVERY ADDRESS ── */}
          <View style={styles.stepBlock}>
            <View style={styles.stepActiveHeader}>
              <View style={[stepStyles.badge, { backgroundColor: '#2874F0' }]}>
                <Text style={stepStyles.badgeText}>2</Text>
              </View>
              <Text style={styles.stepActiveTitle}>DELIVERY ADDRESS</Text>
            </View>

            {/* Saved addresses */}
            {savedAddresses.map((addr, idx) => (
              <AddressCard
                key={addr._id ?? idx}
                address={addr}
                selected={selectedIdx === idx && !showNewForm}
                onSelect={() => { setSelectedIdx(idx); setShowNewForm(false); }}
                userName={profile?.name}
                userPhone={profile?.phone}
              />
            ))}

            {/* Add new address row */}
            <TouchableOpacity
              style={[
                styles.addNewRow,
                showNewForm && selectedIdx === -1 && styles.addNewRowActive,
              ]}
              onPress={() => {
                setShowNewForm(true);
                setSelectedIdx(-1);
              }}
              activeOpacity={0.85}
            >
              <View style={[
                addrStyles.radio,
                (showNewForm && selectedIdx === -1) && addrStyles.radioSelected,
              ]}>
                {showNewForm && selectedIdx === -1
                  ? <View style={addrStyles.radioDot} />
                  : null
                }
              </View>
              <Text style={styles.addNewText}>+ Add a new address</Text>
            </TouchableOpacity>

            {/* Collapsible new address form */}
            {showNewForm && selectedIdx === -1 ? (
              <View style={styles.newFormWrap}>
                <Field label="Full Name"   value={fullName}   onChange={setFullName}   placeholder="John Doe"         required />
                <Field label="Phone"       value={phone}      onChange={setPhone}       placeholder="+91 9999999999"   keyboardType="phone-pad" required />
                <Field label="Street"      value={street}     onChange={setStreet}      placeholder="House No., Street" required />
                <Field label="City"        value={city}       onChange={setCity}        placeholder="Chennai"           required />
                <Field label="State"       value={stateName}  onChange={setStateName}   placeholder="Tamil Nadu" />
                <Field label="Postal Code" value={postalCode} onChange={setPostalCode}  placeholder="600001"            keyboardType="numeric" />
              </View>
            ) : null}
          </View>

          {/* ── STEP 3: ORDER SUMMARY ── */}
          <View style={styles.stepBlock}>
            <View style={styles.stepActiveHeader}>
              <View style={[stepStyles.badge, { backgroundColor: Colors.textDisabled }]}>
                <Text style={stepStyles.badgeText}>3</Text>
              </View>
              <Text style={[styles.stepActiveTitle, { color: Colors.textSecondary }]}>ORDER SUMMARY</Text>
            </View>

            <View style={styles.summaryBlock}>
              {cartItems.map(({ product, quantity }) => (
                <View key={product.id} style={styles.summaryRow}>
                  <Text style={styles.summaryName} numberOfLines={2}>
                    {`${product.name} × ${quantity}`}
                  </Text>
                  <Text style={styles.summaryPrice}>
                    {formatOrderPrice(product.price * quantity)}
                  </Text>
                </View>
              ))}

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatOrderPrice(cartTotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping Fee</Text>
                <Text style={styles.summaryValue}>{formatOrderPrice(SHIPPING)}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>{formatOrderPrice(total)}</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Sticky footer */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity
            style={[styles.placeBtn, isPlacing && { opacity: 0.6 }]}
            onPress={handlePlaceOrder}
            disabled={isPlacing}
            activeOpacity={0.88}
          >
            {isPlacing
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.placeBtnText}>{`Place Order — ${formatOrderPrice(total)}`}</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F1F3F6' },
  scroll: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon:    { fontSize: 30, color: Colors.textPrimary, lineHeight: 34 },
  headerTitle: { ...Typography.headingMedium, color: Colors.textPrimary },

  errorBanner: {
    backgroundColor: '#FFF3CD', paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#FFEEBA',
  },
  errorText: { ...Typography.bodySmall, color: '#856404' },

  // Step blocks
  stepBlock: {
    backgroundColor: Colors.white, marginTop: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  stepDoneRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 0,
  },
  stepDoneTitle: {
    ...Typography.bodySmall, color: Colors.textSecondary,
    fontWeight: '700', letterSpacing: 0.5, marginRight: 4,
  },
  stepDoneInfo:  { flex: 1, flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  stepDoneName:  { ...Typography.bodyMedium, color: Colors.textPrimary, fontWeight: '600' },
  stepDonePhone: { ...Typography.bodyMedium, color: Colors.textSecondary },

  stepActiveHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#2874F0',
  },
  stepActiveTitle: {
    ...Typography.titleMedium, color: Colors.white,
    fontWeight: '800', letterSpacing: 0.5,
  },

  // Add new address
  addNewRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  addNewRowActive: { backgroundColor: '#FAFFFE' },
  addNewText: { ...Typography.titleMedium, color: '#2874F0', fontWeight: '700' },

  // New form
  newFormWrap: {
    padding: 16, gap: 14, backgroundColor: '#FAFFFE',
    borderTopWidth: 1, borderTopColor: Colors.border,
  },

  // Order summary
  summaryBlock: { padding: 16, gap: 12 },
  summaryRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  summaryName:  { ...Typography.bodyMedium, color: Colors.textPrimary, flex: 1 },
  summaryPrice: { ...Typography.bodyMedium, color: Colors.textPrimary, fontWeight: '600' },
  summaryLabel: { ...Typography.bodyMedium, color: Colors.textSecondary },
  summaryValue: { ...Typography.bodyMedium, color: Colors.textPrimary, fontWeight: '600' },
  totalLabel:   { ...Typography.titleLarge, color: Colors.textPrimary, fontWeight: '700' },
  totalValue:   { ...Typography.titleLarge, color: '#2874F0', fontWeight: '800', fontSize: 18 },
  divider:      { height: 1, backgroundColor: Colors.border },

  // Footer
  footer: {
    backgroundColor: Colors.white, paddingHorizontal: 20, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  placeBtn: {
    height: 54, borderRadius: Radius.full, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  placeBtnText: { ...Typography.labelLarge, color: Colors.white, fontSize: 16 },

  // Guest wall
  guestWall: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, gap: 14,
  },
  guestEmoji:    { fontSize: 72 },
  guestTitle:    { ...Typography.headingMedium, color: Colors.textPrimary, textAlign: 'center' },
  guestSubtitle: { ...Typography.bodyMedium, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  primaryBtn: {
    width: '100%', height: 52, borderRadius: Radius.full,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    marginTop: 8,
  },
  primaryBtnText: { ...Typography.labelLarge, color: Colors.white },
  outlineBtn: {
    width: '100%', height: 52, borderRadius: Radius.full,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.primary,
  },
  outlineBtnText: { ...Typography.labelLarge, color: Colors.primary },
});