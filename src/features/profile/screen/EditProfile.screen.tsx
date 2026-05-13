import React, { useReducer, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography, Radius } from '../../../theme';
import { useAuthStore } from '../../auth/store/auth.store';
import type { ProfileStackParamList } from '../../../app/navigation/navigation.types';
import * as ImagePicker from 'expo-image-picker';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

// ─── Tabs ─────────────────────────────────────────────────────────────────────
type Tab = 'profile' | 'address' | 'password';

// ─── State ────────────────────────────────────────────────────────────────────
interface State {
  name: string;
  phone: string;
  currentPwd: string;
  newPwd: string;
  confirmPwd: string;
  loading: boolean;
  picLoading: boolean;
  pwdLoading: boolean;
}

type Action =
  | { type: 'SET'; field: keyof Omit<State, 'loading' | 'picLoading' | 'pwdLoading'>; value: string }
  | { type: 'SET_LOADING'; value: boolean }
  | { type: 'SET_PIC_LOADING'; value: boolean }
  | { type: 'SET_PWD_LOADING'; value: boolean };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'SET':             return { ...s, [a.field]: a.value };
    case 'SET_LOADING':     return { ...s, loading: a.value };
    case 'SET_PIC_LOADING': return { ...s, picLoading: a.value };
    case 'SET_PWD_LOADING': return { ...s, pwdLoading: a.value };
    default:                return s;
  }
}

interface AddressForm {
  street: string; city: string; state: string; postalCode: string; country: string;
}
const emptyAddress: AddressForm = { street: '', city: '', state: '', postalCode: '', country: '' };

// ─── Inline field ─────────────────────────────────────────────────────────────
const InlineField = ({
  label, value, onChangeText, keyboardType, editable = true, placeholder, icon, secureTextEntry,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  keyboardType?: any; editable?: boolean; placeholder?: string;
  icon: string; secureTextEntry?: boolean;
}) => (
  <View style={fieldStyles.wrap}>
    <Text style={fieldStyles.label}>{label}</Text>
    <View style={fieldStyles.row}>
      <TextInput
        style={[fieldStyles.input, !editable && fieldStyles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        editable={editable}
        placeholder={placeholder}
        placeholderTextColor={Colors.textDisabled}
        autoCapitalize="none"
        secureTextEntry={secureTextEntry}
      />
      <Text style={fieldStyles.icon}>{icon}</Text>
    </View>
    <View style={fieldStyles.divider} />
  </View>
);

const fieldStyles = StyleSheet.create({
  wrap:          { marginBottom: 20 },
  label:         { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: 4 },
  row:           { flexDirection: 'row', alignItems: 'center' },
  input:         { flex: 1, ...Typography.bodyLarge, color: Colors.textPrimary, paddingVertical: 6 },
  inputDisabled: { color: Colors.textSecondary },
  icon:          { fontSize: 18, color: Colors.textDisabled, paddingLeft: 8 },
  divider:       { height: 1, backgroundColor: '#EEEEEE', marginTop: 8 },
});

// ─── Screen ───────────────────────────────────────────────────────────────────
export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const user             = useAuthStore(s => s.user);
  const fetchUser        = useAuthStore(s => s.fetchUser);
  const updateProfile    = useAuthStore(s => s.updateProfile);
  const updateProfilePic = useAuthStore(s => s.updateProfilePic);
  const removeProfilePic = useAuthStore(s => s.removeProfilePic);
  const addAddress       = useAuthStore(s => s.addAddress);
  const updateAddress    = useAuthStore(s => s.updateAddress);
  const deleteAddress    = useAuthStore(s => s.deleteAddress);

  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const [state, dispatch] = useReducer(reducer, {
    name: user?.name ?? '', phone: user?.phone ?? '',
    currentPwd: '', newPwd: '', confirmPwd: '',
    loading: false, picLoading: false, pwdLoading: false,
  });

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm]           = useState<AddressForm>(emptyAddress);
  const [addressLoading, setAddressLoading]     = useState(false);

  const set = (field: keyof Omit<State, 'loading' | 'picLoading' | 'pwdLoading'>) =>
    (value: string) => dispatch({ type: 'SET', field, value });

  // ── Save profile ─────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', value: true });
    try {
      await updateProfile({ name: state.name, phone: state.phone });
      await fetchUser();
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update profile');
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }, [state.name, state.phone]);

  // ── Change password ───────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!state.currentPwd || !state.newPwd || !state.confirmPwd) {
      Alert.alert('Error', 'All password fields are required'); return;
    }
    if (state.newPwd !== state.confirmPwd) {
      Alert.alert('Error', 'New passwords do not match'); return;
    }
    if (state.newPwd.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters'); return;
    }
    dispatch({ type: 'SET_PWD_LOADING', value: true });
    try {
      // TODO: await changePasswordApi({ currentPassword: state.currentPwd, newPassword: state.newPwd });
      Alert.alert('Success', 'Password changed successfully');
      dispatch({ type: 'SET', field: 'currentPwd', value: '' });
      dispatch({ type: 'SET', field: 'newPwd',     value: '' });
      dispatch({ type: 'SET', field: 'confirmPwd', value: '' });
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to change password');
    } finally {
      dispatch({ type: 'SET_PWD_LOADING', value: false });
    }
  };

  // ── Profile picture ───────────────────────────────────────────────────────
  const handleChangePic = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) { Alert.alert('Permission Denied', 'Please allow photo access.'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('profilePic', { uri: asset.uri, type: asset.mimeType ?? 'image/jpeg', name: asset.fileName ?? 'profile.jpg' } as any);
      dispatch({ type: 'SET_PIC_LOADING', value: true });
      try { await updateProfilePic(formData); await fetchUser(); }
      catch { Alert.alert('Error', 'Failed to update picture'); }
      finally { dispatch({ type: 'SET_PIC_LOADING', value: false }); }
    } catch { Alert.alert('Error', 'Something went wrong'); }
  };

  // ── Address ───────────────────────────────────────────────────────────────
  const openAddAddress = () => { setEditingAddressId(null); setAddressForm(emptyAddress); setShowAddressModal(true); };
  const openEditAddress = (addr: any) => {
    setEditingAddressId(addr._id);
    setAddressForm({ street: addr.street ?? '', city: addr.city ?? '', state: addr.state ?? '', postalCode: addr.postalCode ?? '', country: addr.country ?? '' });
    setShowAddressModal(true);
  };
  const handleSaveAddress = async () => {
    if (!addressForm.street || !addressForm.city) { Alert.alert('Error', 'Street and city are required'); return; }
    setAddressLoading(true);
    try {
      if (editingAddressId) { await updateAddress(editingAddressId, addressForm); }
      else { await addAddress(addressForm); }
      await fetchUser();
      setShowAddressModal(false);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to save address');
    } finally { setAddressLoading(false); }
  };
  const handleDeleteAddress = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteAddress(id); await fetchUser(); }
        catch { Alert.alert('Error', 'Failed to delete address'); }
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F9F5" />

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.topBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Edit Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* ── Avatar ── */}
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={handleChangePic} activeOpacity={0.85}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarWrap}>
              {state.picLoading ? (
                <View style={styles.avatarFallback}><ActivityIndicator color={Colors.primary} /></View>
              ) : user?.profilePic?.url ? (
                <Image source={{ uri: user.profilePic.url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>{user?.name?.charAt(0).toUpperCase() ?? '?'}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.addPhotoBtn}>
            <Text style={styles.addPhotoBtnText}>＋</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarName}>{user?.name ?? 'User'}</Text>
        <Text style={styles.avatarEmail}>{user?.email ?? ''}</Text>
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabBar}>
        {(['profile', 'address', 'password'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
              {tab === 'profile' ? '👤 Profile' : tab === 'address' ? '📍 Address' : '🔑 Password'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >

        {/* ── Profile tab ── */}
        {activeTab === 'profile' && (
          <View style={styles.card}>
            <InlineField label="Full Name"    value={state.name}  onChangeText={set('name')}  placeholder="Enter your name"  icon="✏️" />
            <InlineField label="Email"        value={user?.email ?? ''} onChangeText={() => {}} keyboardType="email-address" editable={false} placeholder="Email" icon="✉️" />
            <InlineField label="Phone Number" value={state.phone} onChangeText={set('phone')} keyboardType="phone-pad" placeholder="Enter your phone" icon="📞" />
          </View>
        )}

        {/* ── Address tab ── */}
        {activeTab === 'address' && (
          <View style={styles.card}>
            <View style={styles.addressHeader}>
              <Text style={styles.cardSectionTitle}>Saved Addresses</Text>
              <TouchableOpacity style={styles.addBtn} onPress={openAddAddress}>
                <Text style={styles.addBtnText}>＋ Add New</Text>
              </TouchableOpacity>
            </View>

            {!user?.addresses?.length ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyIcon}>📍</Text>
                <Text style={styles.emptyText}>No addresses saved yet</Text>
                <TouchableOpacity style={styles.emptyAddBtn} onPress={openAddAddress}>
                  <Text style={styles.emptyAddBtnText}>Add Your First Address</Text>
                </TouchableOpacity>
              </View>
            ) : (
              user.addresses.map((addr: any, i: number) => (
                <View key={addr._id} style={[styles.addressCard, i === 0 && styles.addressCardDefault]}>
                  {i === 0 && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                  <View style={styles.addressCardTop}>
                    <View style={styles.addressIconWrap}>
                      <Text style={{ fontSize: 20 }}>{i === 0 ? '🏠' : '📍'}</Text>
                    </View>
                    <View style={styles.addressBody}>
                      <Text style={styles.addressStreet}>{addr.street}</Text>
                      <Text style={styles.addressSub}>
                        {[addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean).join(', ')}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.addressCardActions}>
                    <TouchableOpacity style={styles.addrEditBtn} onPress={() => openEditAddress(addr)}>
                      <Text style={styles.addrEditText}>✏️  Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addrDeleteBtn} onPress={() => handleDeleteAddress(addr._id)}>
                      <Text style={styles.addrDeleteText}>🗑️  Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ── Password tab ── */}
        {activeTab === 'password' && (
          <View style={styles.card}>
            <View style={styles.pwdHeader}>
              <Text style={styles.cardSectionTitle}>Change Password</Text>
              <Text style={styles.pwdSubtitle}>Keep your account secure</Text>
            </View>
            <InlineField label="Current Password" value={state.currentPwd} onChangeText={set('currentPwd')} placeholder="Enter current password" icon="🔒" secureTextEntry />
            <InlineField label="New Password"     value={state.newPwd}     onChangeText={set('newPwd')}     placeholder="Enter new password"     icon="🔑" secureTextEntry />
            <InlineField label="Confirm Password" value={state.confirmPwd} onChangeText={set('confirmPwd')} placeholder="Confirm new password"    icon="✅" secureTextEntry />
          </View>
        )}

      </ScrollView>

      {/* ── Bottom buttons ── */}
      <View style={styles.bottomRow}>
        <TouchableOpacity style={styles.discardBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.discardText}>Discard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, (state.loading || state.pwdLoading) && styles.saveBtnDisabled]}
          onPress={activeTab === 'password' ? handleChangePassword : activeTab === 'profile' ? handleSave : undefined}
          disabled={state.loading || state.pwdLoading}
          activeOpacity={0.88}
        >
          {(state.loading || state.pwdLoading)
            ? <ActivityIndicator color={Colors.white} />
            : <Text style={styles.saveBtnText}>
                {activeTab === 'password' ? 'Update Password' : activeTab === 'profile' ? 'Save' : 'Done'}
              </Text>
          }
        </TouchableOpacity>
      </View>

      {/* ── Address modal ── */}
      <Modal visible={showAddressModal} transparent animationType="slide" onRequestClose={() => setShowAddressModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingAddressId ? 'Edit Address' : 'Add New Address'}</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {(['street','city','state','postalCode','country'] as const).map((field) => (
              <InlineField
                key={field}
                label={field === 'postalCode' ? 'Postal Code' : field.charAt(0).toUpperCase() + field.slice(1)}
                value={addressForm[field]}
                onChangeText={(v) => setAddressForm(f => ({ ...f, [field]: v }))}
                keyboardType={field === 'postalCode' ? 'number-pad' : 'default'}
                placeholder={
                  field === 'street'     ? '123 Main Street' :
                  field === 'city'       ? 'Chennai'         :
                  field === 'state'      ? 'Tamil Nadu'      :
                  field === 'postalCode' ? '600001'          : 'India'
                }
                icon={
                  field === 'street'     ? '🏠' :
                  field === 'city'       ? '🏙️' :
                  field === 'state'      ? '📌' :
                  field === 'postalCode' ? '📮' : '🌍'
                }
              />
            ))}

            <View style={styles.bottomRow}>
              <TouchableOpacity style={styles.discardBtn} onPress={() => setShowAddressModal(false)}>
                <Text style={styles.discardText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, addressLoading && styles.saveBtnDisabled]}
                onPress={handleSaveAddress}
                disabled={addressLoading}
              >
                {addressLoading
                  ? <ActivityIndicator color={Colors.white} />
                  : <Text style={styles.saveBtnText}>{editingAddressId ? 'Update' : 'Save'}</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#F5F9F5' },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#F5F9F5',
  },
  topBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  topBtnText: { fontSize: 28, color: Colors.textPrimary },
  topTitle:   { ...Typography.headingMedium, color: Colors.textPrimary },

  // Avatar
  avatarSection: { alignItems: 'center', paddingVertical: 16 },
  avatarRing: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 3, borderColor: Colors.primary,
    padding: 3, marginBottom: 4,
  },
  avatarWrap: { flex: 1, borderRadius: 42, overflow: 'hidden', backgroundColor: Colors.primarySurface },
  avatar:         { width: '100%', height: '100%' },
  avatarFallback: { flex: 1, backgroundColor: Colors.primarySurface, alignItems: 'center', justifyContent: 'center' },
  avatarInitial:  { ...Typography.headingLarge, color: Colors.primary },
  addPhotoBtn: {
    position: 'absolute', bottom: 4, right: 0,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.white,
  },
  addPhotoBtnText: { color: Colors.white, fontSize: 14, fontWeight: '700', lineHeight: 16 },
  avatarName:  { ...Typography.titleMedium, color: Colors.textPrimary, marginTop: 8 },
  avatarEmail: { ...Typography.bodySmall,   color: Colors.textSecondary },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
    gap: 4,
  },
  tabBtn: {
    flex: 1, paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabBtnActive:     { backgroundColor: Colors.primary },
  tabBtnText:       { ...Typography.bodySmall, color: Colors.textSecondary, fontWeight: '600' },
  tabBtnTextActive: { color: Colors.white },

  // Card
  card: {
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
  },

  // Address tab
  addressHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  cardSectionTitle: { ...Typography.titleMedium, color: Colors.textPrimary, fontWeight: '700' },
  addBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: Colors.primarySurface,
    borderRadius: 20,
  },
  addBtnText: { ...Typography.bodySmall, color: Colors.primary, fontWeight: '700' },

  emptyWrap:      { alignItems: 'center', paddingVertical: 32 },
  emptyIcon:      { fontSize: 40, marginBottom: 10, opacity: 0.4 },
  emptyText:      { ...Typography.bodyMedium, color: Colors.textDisabled, marginBottom: 16 },
  emptyAddBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 50,
  },
  emptyAddBtnText: { ...Typography.labelLarge, color: Colors.white },

  addressCard: {
    backgroundColor: '#F8F9FB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  addressCardDefault: {
    backgroundColor: '#EDF7ED',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  defaultBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 20, marginBottom: 8,
  },
  defaultBadgeText: { ...Typography.bodySmall, color: Colors.white, fontWeight: '700' },
  addressCardTop:   { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  addressIconWrap: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  addressBody:   { flex: 1 },
  addressStreet: { ...Typography.titleMedium, color: Colors.textPrimary },
  addressSub:    { ...Typography.bodySmall,   color: Colors.textSecondary, marginTop: 2 },
  addressCardActions: { flexDirection: 'row', gap: 8 },
  addrEditBtn: {
    flex: 1, height: 36, borderRadius: 8,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#EEEEEE',
  },
  addrEditText:   { ...Typography.bodySmall, color: Colors.textPrimary, fontWeight: '600' },
  addrDeleteBtn: {
    flex: 1, height: 36, borderRadius: 8,
    backgroundColor: '#FFF0F0',
    alignItems: 'center', justifyContent: 'center',
  },
  addrDeleteText: { ...Typography.bodySmall, color: '#E53935', fontWeight: '600' },

  // Password tab
  pwdHeader:    { marginBottom: 20 },
  pwdSubtitle:  { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 4 },

  // Bottom
  bottomRow: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#F5F9F5',
  },
  discardBtn: {
    flex: 1, height: 52, borderRadius: 50,
    borderWidth: 1.5, borderColor: '#DDDDDD',
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  discardText:     { ...Typography.labelLarge, color: Colors.textPrimary },
  saveBtn: {
    flex: 2, height: 52, borderRadius: 50,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.65 },
  saveBtnText:     { ...Typography.labelLarge, color: Colors.white },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  modalTitle: { ...Typography.headingMedium, color: Colors.textPrimary },
  modalClose: { fontSize: 18, color: Colors.textSecondary, padding: 4 },
});