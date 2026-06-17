import React, { useReducer, useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Image, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, FontFamily } from '../../../theme';
import { useAuthStore } from '../../auth/store/auth.store';
import type { RootStackParamList } from '../../../app/navigation/navigation.types';
import * as ImagePicker from 'expo-image-picker';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

const NAVY = '#0F1729';

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconArrowLeft = ({ size = 22, color = '#111111' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconUser = ({ color = '#AAAAAA', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={7} r={4} stroke={color} strokeWidth={1.8} />
  </Svg>
);
const IconPhone = ({ color = '#AAAAAA', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.5 2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconMail = ({ color = '#AAAAAA', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={2} y={4} width={20} height={16} rx={2} stroke={color} strokeWidth={1.8} />
    <Path d="M22 7l-10 7L2 7" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconMapPin = ({ color = '#AAAAAA', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={9} r={2.5} stroke={color} strokeWidth={1.8} />
  </Svg>
);
const IconLock = ({ color = '#555555', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={11} width={18} height={11} rx={2} ry={2} stroke={color} strokeWidth={1.8} />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconBell = ({ color = '#555555', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconShield = ({ color = '#555555', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconShieldCheck = ({ color = Colors.primary, size = 14 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconChevronRight = ({ color = '#CCCCCC', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconCheck = ({ color = '#FFFFFF', size = 14 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconEdit = ({ color = Colors.primary, size = 14 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconCamera = ({ size = 12 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={13} r={4} stroke="#fff" strokeWidth={1.8} />
  </Svg>
);
const IconLogout = ({ color = '#E53935', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="16 17 21 12 16 7" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={21} y1={12} x2={9} y2={12} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── State ────────────────────────────────────────────────────────────────────
interface FormState {
  name:       string;
  phone:      string;
  loading:    boolean;
  picLoading: boolean;
}
type Action =
  | { type: 'SET'; field: 'name' | 'phone'; value: string }
  | { type: 'SET_LOADING'; value: boolean }
  | { type: 'SET_PIC_LOADING'; value: boolean };

function reducer(s: FormState, a: Action): FormState {
  switch (a.type) {
    case 'SET':             return { ...s, [a.field]: a.value };
    case 'SET_LOADING':     return { ...s, loading: a.value };
    case 'SET_PIC_LOADING': return { ...s, picLoading: a.value };
    default:                return s;
  }
}

// ─── Editable info row (inside Personal Information card) ─────────────────────
const InfoRow = ({
  icon, label, value, editing, onChangeText, onPress, last = false, editable = true,
  keyboardType,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  editing: boolean;
  onChangeText?: (v: string) => void;
  onPress?: () => void;
  last?: boolean;
  editable?: boolean;
  keyboardType?: any;
}) => {
  const content = (
    <View style={[rS.row, !last && rS.rowBorder]}>
      <View style={rS.iconWrap}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={rS.label}>{label}</Text>
        {editing && editable ? (
          <TextInput
            style={rS.input}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            placeholderTextColor="#C8C8C8"
          />
        ) : (
          <Text style={rS.value}>{value || '—'}</Text>
        )}
      </View>
      {!editing && <IconChevronRight color="#CCCCCC" size={16} />}
    </View>
  );

  if (editing || !onPress) return content;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {content}
    </TouchableOpacity>
  );
};
const rS = StyleSheet.create({
  row: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingVertical:   14,
    paddingHorizontal: 16,
    gap:               14,
    backgroundColor:   '#FFFFFF',
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  iconWrap:  { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center' },
  label: {
    fontFamily: FontFamily.regular,
    fontSize:   12,
    color:      '#999999',
    marginBottom: 3,
  },
  value: {
    fontFamily: FontFamily.semiBold,
    fontSize:   15,
    color:      '#111111',
  },
  input: {
    fontFamily: FontFamily.semiBold,
    fontSize:   15,
    color:      '#111111',
    padding:    0,
    margin:     0,
  },
});

// ─── Nav row (Account Settings) ────────────────────────────────────────────────
const NavRow = ({ icon, label, sub, onPress, last = false }: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  onPress?: () => void;
  last?: boolean;
}) => (
  <TouchableOpacity
    style={[rS.row, !last && rS.rowBorder]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={rS.iconWrap}>{icon}</View>
    <View style={{ flex: 1 }}>
      <Text style={nS.label}>{label}</Text>
      {sub ? <Text style={nS.sub}>{sub}</Text> : null}
    </View>
    <IconChevronRight color="#CCCCCC" size={18} />
  </TouchableOpacity>
);
const nS = StyleSheet.create({
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize:   14,
    color:      '#111111',
  },
  sub: {
    fontFamily: FontFamily.regular,
    fontSize:   12,
    color:      '#999999',
    marginTop:  2,
  },
});

// ─── Section card ───────────────────────────────────────────────────────────────
const SectionCard = ({
  title, onEdit, editing, onCancel, saving, children,
}: {
  title: string;
  onEdit?: () => void;
  editing?: boolean;
  onCancel?: () => void;
  saving?: boolean;
  children: React.ReactNode;
}) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onEdit && (
        editing ? (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelPill} onPress={onCancel} activeOpacity={0.7}>
              <Text style={styles.cancelPillText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.savePill} onPress={onEdit} activeOpacity={0.85} disabled={saving}>
              {saving
                ? <ActivityIndicator color="#fff" size="small" />
                : (
                  <>
                    <IconCheck color="#fff" size={13} />
                    <Text style={styles.savePillText}>Save</Text>
                  </>
                )
              }
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.editPill} onPress={onEdit} activeOpacity={0.7}>
            <IconEdit size={13} color={Colors.primary} />
            <Text style={styles.editLinkText}>Edit</Text>
          </TouchableOpacity>
        )
      )}
    </View>
    <View style={styles.cardBody}>{children}</View>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────
export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const user             = useAuthStore(s => s.user);
  const fetchUser        = useAuthStore(s => s.fetchUser);
  const updateProfile    = useAuthStore(s => s.updateProfile);
  const updateProfilePic = useAuthStore(s => s.updateProfilePic);
  const logout           = useAuthStore(s => s.logout);

  const [state, dispatch] = useReducer(reducer, {
    name:       user?.name  ?? '',
    phone:      user?.phone ?? '',
    loading:    false,
    picLoading: false,
  });

  const [editingPersonal, setEditingPersonal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const set = (field: 'name' | 'phone') =>
    (value: string) => dispatch({ type: 'SET', field, value });

  const handleSave = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', value: true });
    try {
      await updateProfile({ name: state.name, phone: state.phone });
      await fetchUser();
      setEditingPersonal(false);
      showToast('Profile updated successfully');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update profile');
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }, [state.name, state.phone]);

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
      try   { await updateProfilePic(formData); await fetchUser(); }
      catch { Alert.alert('Error', 'Failed to update picture'); }
      finally { dispatch({ type: 'SET_PIC_LOADING', value: false }); }
    } catch { Alert.alert('Error', 'Something went wrong'); }
  };

  const addresses     = (user as any)?.addresses ?? [];
  const defaultAddr   = addresses.find((a: any) => a.isDefault) ?? addresses[0] ?? null;

  const addrLine1 = defaultAddr
    ? [defaultAddr.street, defaultAddr.city, 'Maldives'].filter(Boolean).join(', ')
    : 'No address added yet';
  const addrPhone = defaultAddr?.recipientPhone || defaultAddr?.phone || user?.phone || '';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.topBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconArrowLeft size={20} />
          </TouchableOpacity>
          <View>
            <Text style={styles.topTitle}>Edit Profile</Text>
            <Text style={styles.topSub}>Manage your personal information</Text>
          </View>
        </View>

        {/* ── Success toast ── */}
        {toast && (
          <View style={styles.toast}>
            <IconShieldCheck color="#FFFFFF" size={16} />
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        )}

        {/* ── Hero card ── */}
        <View style={styles.heroCard}>
          <TouchableOpacity onPress={handleChangePic} activeOpacity={0.85} style={styles.avatarWrap}>
            {state.picLoading ? (
              <View style={styles.avatarCircle}>
                <ActivityIndicator color="#fff" />
              </View>
            ) : user?.profilePic?.url ? (
              <Image source={{ uri: user.profilePic.url }} style={styles.avatarCircle} />
            ) : (
              <View style={[styles.avatarCircle, styles.avatarFallback]}>
                <IconUser color="#9CA3AF" size={32} />
              </View>
            )}
            <View style={styles.cameraBadge}>
              <IconCamera size={12} />
            </View>
          </TouchableOpacity>

          <View style={styles.heroMeta}>
            <Text style={styles.heroName}>{user?.name || 'User'}</Text>
            <Text style={styles.heroPhone}>{user?.phone || '—'}</Text>
            <View style={styles.verifiedRow}>
              <IconShieldCheck size={13} />
              <Text style={styles.verifiedText}>Verified Account</Text>
            </View>
          </View>

          <IconChevronRight color="rgba(255,255,255,0.5)" size={20} />
        </View>

        {/* ── Personal Information ── */}
        <SectionCard
          title="Personal Information"
          editing={editingPersonal}
          saving={state.loading}
          onEdit={() => (editingPersonal ? handleSave() : setEditingPersonal(true))}
          onCancel={() => {
            dispatch({ type: 'SET', field: 'name',  value: user?.name  ?? '' });
            dispatch({ type: 'SET', field: 'phone', value: user?.phone ?? '' });
            setEditingPersonal(false);
          }}
        >
          <InfoRow
            icon={<IconUser color={Colors.primary} size={18} />}
            label="Name"
            value={state.name}
            editing={editingPersonal}
            onChangeText={set('name')}
          />
          <InfoRow
            icon={<IconPhone color={Colors.primary} size={18} />}
            label="Phone Number"
            value={state.phone}
            editing={editingPersonal}
            onChangeText={set('phone')}
            keyboardType="phone-pad"
          />
          <InfoRow
            icon={<IconMail color={Colors.primary} size={18} />}
            label="Email Address"
            value={user?.email ?? ''}
            editing={editingPersonal}
            editable={false}
            last
          />
        </SectionCard>

        {/* ── Default Address ── */}
        <SectionCard
          title="Default Address"
          onEdit={() => navigation.navigate('AddAddress', { address: defaultAddr ?? undefined })}
        >
          <TouchableOpacity
            style={styles.addrRow}
            onPress={() => navigation.navigate('AddAddress', { address: defaultAddr ?? undefined })}
            activeOpacity={0.7}
          >
            <View style={styles.addrIconWrap}>
              <IconMapPin color={Colors.primary} size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.addrTopRow}>
                <Text style={styles.addrName}>{user?.name || 'User'}</Text>
                {defaultAddr?.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>
              <Text style={styles.addrLine}>{addrLine1}</Text>
              {addrPhone ? <Text style={styles.addrLine}>{addrPhone}</Text> : null}
            </View>
            <IconChevronRight color="#CCCCCC" size={18} />
          </TouchableOpacity>
        </SectionCard>

        {/* ── Account Settings ── */}
        <SectionCard title="Account Settings">
          <NavRow
            icon={<IconLock color="#555555" size={18} />}
            label="Change Password"
            sub="Update your account password"
            onPress={() => navigation.navigate('ChangePassword')}
          />
          <NavRow
            icon={<IconBell color="#555555" size={18} />}
            label="Notifications"
            sub="Manage your notification preferences"
            onPress={() => navigation.navigate('Settings')}
          />
          <NavRow
            icon={<IconShield color="#555555" size={18} />}
            label="Privacy & Security"
            sub="Manage your privacy and security settings"
            onPress={() => navigation.navigate('StaticContent', { type: 'privacy' })}
            last
          />
        </SectionCard>

        {/* ── Save Changes ── */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={state.loading}
        >
          {state.loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.saveBtnText}>Save Changes</Text>
          }
        </TouchableOpacity>

        {/* ── Logout ── */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setShowLogoutModal(true)}
          activeOpacity={0.8}
        >
          <IconLogout size={18} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── Logout confirm modal ── */}
      <Modal
        visible={showLogoutModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={modal.overlay}>
          <View style={modal.box}>
            <Text style={modal.title}>Logout</Text>
            <Text style={modal.message}>Are you sure you want to logout?</Text>
            <View style={modal.btnRow}>
              <TouchableOpacity
                style={modal.cancelBtn}
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.7}
              >
                <Text style={modal.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={modal.confirmBtn}
                onPress={() => { setShowLogoutModal(false); logout(); }}
                activeOpacity={0.85}
              >
                <Text style={modal.confirmText}>Logout</Text>
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
  safe:          { flex: 1, backgroundColor: '#F7F8FA' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           14,
    marginBottom:  16,
  },
  topBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, borderColor: '#EBEBEB',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  topTitle: { fontFamily: FontFamily.extraBold, fontSize: 20, color: '#111111' },
  topSub:   { fontFamily: FontFamily.regular, fontSize: 13, color: '#999999', marginTop: 2 },

  // Hero card
  heroCard: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: NAVY,
    borderRadius:    16,
    padding:         18,
    gap:             14,
    marginBottom:    16,
  },
  avatarWrap: { position: 'relative' },
  avatarCircle: {
    width: 64, height: 64, borderRadius: 32,
    overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  avatarFallback: { backgroundColor: '#FFFFFF' },
  cameraBadge: {
    position:        'absolute',
    bottom:          -2,
    right:           -2,
    width:           26,
    height:          26,
    borderRadius:    13,
    backgroundColor: NAVY,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     2,
    borderColor:     '#FFFFFF',
  },
  heroMeta: { flex: 1 },
  heroName: {
    fontFamily:   FontFamily.extraBold,
    fontSize:     18,
    color:        '#FFFFFF',
    marginBottom: 4,
  },
  heroPhone: {
    fontFamily:   FontFamily.regular,
    fontSize:     14,
    color:        'rgba(255,255,255,0.7)',
    marginBottom: 6,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           5,
  },
  verifiedText: {
    fontFamily: FontFamily.semiBold,
    fontSize:   12,
    color:      Colors.primary,
  },

  // Section card
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius:    14,
    borderWidth:     1,
    borderColor:     '#EFEFEF',
    marginBottom:    16,
    overflow:        'hidden',
  },
  sectionHeader: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingTop:        16,
    paddingBottom:     10,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize:   15,
    color:      '#111111',
  },
  editPill: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               5,
    backgroundColor:   '#F0FDF4',
    borderRadius:      20,
    paddingHorizontal: 12,
    paddingVertical:   6,
  },
  editLinkText: {
    fontFamily: FontFamily.semiBold,
    fontSize:   13,
    color:      Colors.primary,
  },
  editActions: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  cancelPill: {
    borderRadius:      20,
    paddingHorizontal: 12,
    paddingVertical:   6,
    borderWidth:       1,
    borderColor:       '#E0E0E0',
  },
  cancelPillText: {
    fontFamily: FontFamily.semiBold,
    fontSize:   13,
    color:      '#888888',
  },
  savePill: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               5,
    backgroundColor:   Colors.primary,
    borderRadius:      20,
    paddingHorizontal: 14,
    paddingVertical:   6,
    minWidth:          64,
    justifyContent:    'center',
  },
  savePillText: {
    fontFamily: FontFamily.semiBold,
    fontSize:   13,
    color:      '#FFFFFF',
  },
  cardBody: {},

  // Toast
  toast: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               8,
    backgroundColor:   Colors.primary,
    borderRadius:      12,
    paddingHorizontal: 14,
    paddingVertical:   12,
    marginBottom:      14,
  },
  toastText: {
    fontFamily: FontFamily.semiBold,
    fontSize:   13,
    color:      '#FFFFFF',
  },

  // Default address row
  addrRow: {
    flexDirection:     'row',
    alignItems:        'flex-start',
    gap:               14,
    paddingHorizontal: 16,
    paddingBottom:     16,
  },
  addrIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F0FDF4',
    alignItems: 'center', justifyContent: 'center',
  },
  addrTopRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
    marginBottom:  4,
  },
  addrName: {
    fontFamily: FontFamily.bold,
    fontSize:   14,
    color:      '#111111',
  },
  defaultBadge: {
    backgroundColor:   '#F0FDF4',
    borderRadius:      6,
    paddingHorizontal: 8,
    paddingVertical:   2,
  },
  defaultBadgeText: {
    fontFamily: FontFamily.semiBold,
    fontSize:   11,
    color:      Colors.primary,
  },
  addrLine: {
    fontFamily: FontFamily.regular,
    fontSize:   13,
    color:      '#888888',
    lineHeight: 19,
  },

  // Buttons
  saveBtn: {
    height:          52,
    borderRadius:    14,
    backgroundColor: NAVY,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    10,
  },
  saveBtnText: {
    fontFamily:    FontFamily.bold,
    fontSize:      15,
    color:         '#FFFFFF',
    letterSpacing: 0.1,
  },
  logoutBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             8,
    height:          52,
    borderRadius:    14,
    borderWidth:     1,
    borderColor:     '#FFCDD2',
    backgroundColor: '#FFFFFF',
  },
  logoutText: {
    fontFamily: FontFamily.semiBold,
    fontSize:   15,
    color:      '#E53935',
  },
});

const modal = StyleSheet.create({
  overlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems:      'center',
    justifyContent:  'center',
    padding:         24,
  },
  box: {
    width:           '100%',
    backgroundColor: '#FFFFFF',
    borderRadius:    16,
    padding:         20,
  },
  title: {
    fontFamily:   FontFamily.bold,
    fontSize:     16,
    color:        '#111111',
    marginBottom: 6,
    textAlign:    'center',
  },
  message: {
    fontFamily:   FontFamily.regular,
    fontSize:     13,
    color:        '#888888',
    textAlign:    'center',
    marginBottom: 18,
  },
  btnRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, height: 46, borderRadius: 12,
    borderWidth: 1, borderColor: '#E0E0E0',
    alignItems: 'center', justifyContent: 'center',
  },
  cancelText: { fontFamily: FontFamily.semiBold, fontSize: 14, color: '#555555' },
  confirmBtn: {
    flex: 1, height: 46, borderRadius: 12,
    backgroundColor: '#E53935',
    alignItems: 'center', justifyContent: 'center',
  },
  confirmText: { fontFamily: FontFamily.semiBold, fontSize: 14, color: '#FFFFFF' },
});