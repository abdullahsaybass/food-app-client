import React, { useReducer, useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Image, Alert, ActivityIndicator,
  Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, FontFamily } from '../../../theme';
import { useAuthStore } from '../../auth/store/auth.store';
import type { RootStackParamList } from '../../../app/navigation/navigation.types';
import * as ImagePicker from 'expo-image-picker';
import { MALDIVES_ATOLLS } from './Addaddressscreen';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconArrowLeft = ({ size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#111111" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
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
const IconTag = ({ color = '#AAAAAA', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={7} y1={7} x2={7.01} y2={7} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);
const IconGlobe = ({ color = '#AAAAAA', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={1.8} />
    <Line x1={2} y1={12} x2={22} y2={12} stroke={color} strokeWidth={1.8} />
    <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke={color} strokeWidth={1.8} />
  </Svg>
);
const IconMapPin = ({ color = '#AAAAAA', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={9} r={2.5} stroke={color} strokeWidth={1.8} />
  </Svg>
);
const IconHome = ({ color = '#AAAAAA', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="9 22 9 12 15 12 15 22" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconCity = ({ color = '#AAAAAA', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={1} y={3} width={15} height={18} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 8h4l3 3v9h-7V8z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={5} y1={7} x2={5} y2={7.01} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    <Line x1={9} y1={7} x2={9} y2={7.01} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    <Line x1={5} y1={11} x2={5} y2={11.01} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    <Line x1={9} y1={11} x2={9} y2={11.01} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    <Line x1={5} y1={15} x2={5} y2={15.01} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    <Line x1={9} y1={15} x2={9} y2={15.01} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);
const IconInbox = ({ color = '#AAAAAA', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="22 12 16 12 14 15 10 15 8 12 2 12" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconBuilding = ({ color = '#AAAAAA', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={2} y={7} width={20} height={14} rx={2} ry={2} stroke={color} strokeWidth={1.8} />
    <Path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconLock = ({ color = '#AAAAAA', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={11} width={18} height={11} rx={2} ry={2} stroke={color} strokeWidth={1.8} />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconTrash = ({ color = '#E53935', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="3 6 5 6 21 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M19 6l-1 14H6L5 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M10 11v6M14 11v6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconChevronDown = ({ color = '#AAAAAA', size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconChevronRight = ({ color = '#CCCCCC', size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconCheck = ({ color = '#FFFFFF', size = 14 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconEdit = ({ size = 14 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={Colors.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={Colors.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconCamera = ({ size = 14 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={13} r={4} stroke="#fff" strokeWidth={1.8} />
  </Svg>
);

// ─── State ────────────────────────────────────────────────────────────────────
interface FormState {
  name:           string;
  phone:          string;
  addrLabel:      string;
  addrType:       'home' | 'work' | 'other';
  recipientName:  string;
  recipientPhone: string;
  street:         string;
  city:           string;
  atoll:          string;
  zip:            string;
  isDefault:      boolean;
  loading:        boolean;
  picLoading:     boolean;
}
type Action =
  | { type: 'SET'; field: keyof Omit<FormState, 'loading' | 'picLoading'>; value: any }
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

// ─── LabeledInput ─────────────────────────────────────────────────────────────
const LabeledInput = ({
  icon, label, value, onChangeText, editable = true,
  keyboardType, placeholder, multiline = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  editable?: boolean;
  keyboardType?: any;
  placeholder?: string;
  multiline?: boolean;
}) => (
  <View style={[iS.wrap, multiline && iS.wrapMulti, !editable && iS.wrapDisabled]}>
    <View style={[iS.iconWrap, multiline && { paddingTop: 2 }]}>{icon}</View>
    <View style={iS.textBlock}>
      <Text style={iS.fieldLabel}>{label}</Text>
      <TextInput
        style={[iS.input, !editable && iS.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? ''}
        placeholderTextColor="#C8C8C8"
        editable={editable}
        keyboardType={keyboardType}
        autoCapitalize="none"
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  </View>
);

const LabeledSelect = ({
  icon, label, value, placeholder, onPress, disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  placeholder?: string;
  onPress: () => void;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    style={[iS.wrap, disabled && iS.wrapDisabled]}
    onPress={onPress}
    activeOpacity={disabled ? 1 : 0.8}
  >
    <View style={iS.iconWrap}>{icon}</View>
    <View style={iS.textBlock}>
      <Text style={iS.fieldLabel}>{label}</Text>
      <Text style={[iS.input, !value && { color: '#C8C8C8' }]}>
        {value || placeholder || ''}
      </Text>
    </View>
    {!disabled && <IconChevronDown color="#AAAAAA" size={16} />}
  </TouchableOpacity>
);

const iS = StyleSheet.create({
  wrap: {
    flexDirection:     'row',
    alignItems:        'center',
    borderWidth:       1,
    borderColor:       '#EBEBEB',
    borderRadius:      12,
    paddingHorizontal: 14,
    paddingVertical:   13,
    backgroundColor:   '#FFFFFF',
    marginBottom:      10,
    gap:               12,
  },
  wrapMulti:    { alignItems: 'flex-start', paddingTop: 14 },
  wrapDisabled: { backgroundColor: '#F7F7F7', borderColor: '#F0F0F0' },
  iconWrap:     { width: 20, alignItems: 'center', justifyContent: 'center' },
  textBlock:    { flex: 1 },
  fieldLabel: {
    fontFamily:   FontFamily.medium,
    fontSize:     11,
    color:        '#AAAAAA',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  input: {
    fontFamily: FontFamily.semiBold,
    fontSize:   14,
    color:      '#111111',
    padding:    0,
    margin:     0,
  },
  inputDisabled: { color: '#AAAAAA' },
});

// ─── NavRow ───────────────────────────────────────────────────────────────────
const NavRow = ({ icon, label, sub, onPress, last = false }: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  onPress?: () => void;
  last?: boolean;
}) => (
  <TouchableOpacity
    style={[nS.row, !last && nS.rowBorder]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={nS.iconWrap}>{icon}</View>
    <View style={{ flex: 1 }}>
      <Text style={nS.label}>{label}</Text>
      {sub ? <Text style={nS.sub}>{sub}</Text> : null}
    </View>
    <IconChevronRight color="#CCCCCC" size={16} />
  </TouchableOpacity>
);
const nS = StyleSheet.create({
  row: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingVertical:   14,
    paddingHorizontal: 16,
    gap:               14,
    backgroundColor:   '#FFFFFF',
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  iconWrap:  { width: 22, alignItems: 'center' },
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

// ─── Type Option ──────────────────────────────────────────────────────────────
const TypeOption = ({
  label, icon, selected, onPress,
}: { label: string; icon: React.ReactNode; selected: boolean; onPress: () => void }) => (
  <TouchableOpacity
    style={[tS.option, selected && tS.optionSelected]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    {icon}
    <Text style={[tS.label, selected && tS.labelSelected]}>{label}</Text>
    <View style={[tS.radio, selected && tS.radioSelected]}>
      {selected && <View style={tS.radioDot} />}
    </View>
  </TouchableOpacity>
);
const tS = StyleSheet.create({
  option: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    gap: 6, paddingHorizontal: 10, paddingVertical: 12,
    borderWidth: 1.5, borderColor: '#E5E5E5', borderRadius: 12,
    backgroundColor: '#FAFAFA',
  },
  optionSelected: { borderColor: Colors.primary, backgroundColor: '#F0FDF4' },
  label:          { flex: 1, fontFamily: FontFamily.semiBold, fontSize: 13, color: '#999999' },
  labelSelected:  { color: Colors.primary },
  radio: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: '#DDDDDD',
    alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: Colors.primary },
  radioDot:      { width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.primary },
});

// ─── Section Title ────────────────────────────────────────────────────────────
const SectionTitle = ({ title }: { title: string }) => (
  <Text style={secStyle}>{title}</Text>
);
const secStyle: any = {
  fontFamily:   FontFamily.bold,
  fontSize:     15,
  color:        '#111111',
  marginBottom: 12,
  marginTop:    4,
};

// ─── Screen ───────────────────────────────────────────────────────────────────
export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const user             = useAuthStore(s => s.user);
  const fetchUser        = useAuthStore(s => s.fetchUser);
  const updateProfile    = useAuthStore(s => s.updateProfile);
  const updateProfilePic = useAuthStore(s => s.updateProfilePic);
  const deleteAccount    = useAuthStore(s => (s as any).deleteAccount);

  const [state, dispatch] = useReducer(reducer, {
    name:           user?.name  ?? '',
    phone:          user?.phone ?? '',
    addrLabel:      '',
    addrType:       'home',
    recipientName:  '',
    recipientPhone: '',
    street:         '',
    city:           '',
    atoll:          '',
    zip:            '',
    isDefault:      false,
    loading:        false,
    picLoading:     false,
  });

  const [showAtollPicker, setShowAtollPicker] = useState(false);
  const [atollSearch,     setAtollSearch]     = useState('');

  const set = (field: keyof Omit<FormState, 'loading' | 'picLoading'>) =>
    (value: any) => dispatch({ type: 'SET', field, value });

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

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'This action is permanent and cannot be undone. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteAccount?.(); }
        catch { Alert.alert('Error', 'Failed to delete account'); }
      }},
    ]);
  };

  const displayName = user?.name
    ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
    : 'User';

  const filteredAtolls = MALDIVES_ATOLLS.filter(a =>
    a.toLowerCase().includes(atollSearch.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.topBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconArrowLeft size={22} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Edit Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >

        {/* ── Profile card — matches Profile screen style ── */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <TouchableOpacity onPress={handleChangePic} activeOpacity={0.85} style={styles.avatarWrap}>
            {state.picLoading ? (
              <View style={styles.avatarCircle}>
                <ActivityIndicator color={Colors.primary} />
              </View>
            ) : user?.profilePic?.url ? (
              <Image source={{ uri: user.profilePic.url }} style={styles.avatarCircle} />
            ) : (
              <View style={[styles.avatarCircle, styles.avatarFallback]}>
                <Text style={styles.avatarInitial}>{user?.name?.charAt(0).toUpperCase() ?? '?'}</Text>
              </View>
            )}
            {/* Camera badge */}
            <View style={styles.cameraBadge}>
              <IconCamera size={12} />
            </View>
          </TouchableOpacity>

          {/* Meta */}
          <View style={styles.profileMeta}>
            <Text style={styles.profileName}>{displayName}</Text>
            {user?.phone ? (
              <View style={styles.metaRow}>
                <IconPhone color="#888888" size={13} />
                <Text style={styles.profileDetail}>{user.phone}</Text>
              </View>
            ) : null}
            {user?.email ? (
              <View style={styles.metaRow}>
                <IconMail color="#888888" size={13} />
                <Text style={styles.profileDetail}>{user.email}</Text>
              </View>
            ) : null}
          </View>

          {/* Edit label */}
          <TouchableOpacity style={styles.editBadge} onPress={handleChangePic} activeOpacity={0.7}>
            <IconEdit size={13} />
            <Text style={styles.editBadgeText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* ══ Personal Information ══ */}
        <View style={styles.section}>
          <SectionTitle title="Personal Information" />
          <View style={styles.card}>
            <LabeledInput
              icon={<IconUser color="#AAAAAA" size={18} />}
              label="Full Name"
              value={state.name}
              onChangeText={set('name')}
              placeholder="Enter full name"
            />
            <LabeledInput
              icon={<IconPhone color="#AAAAAA" size={18} />}
              label="Phone Number"
              value={state.phone}
              onChangeText={set('phone')}
              keyboardType="phone-pad"
              placeholder="+960 000 0000"
            />
            <LabeledInput
              icon={<IconMail color="#AAAAAA" size={18} />}
              label="Email Address"
              value={user?.email ?? ''}
              onChangeText={() => {}}
              editable={false}
            />
          </View>
        </View>

        {/* ══ Address Information ══ */}
        <View style={styles.section}>
          <SectionTitle title="Address Information" />
          <View style={styles.card}>
            <LabeledInput
              icon={<IconTag color="#AAAAAA" size={18} />}
              label="Address Label"
              value={state.addrLabel}
              onChangeText={set('addrLabel')}
              placeholder='e.g. "My Home", "Office"'
            />
            <LabeledInput
              icon={<IconUser color="#AAAAAA" size={18} />}
              label="Recipient Name"
              value={state.recipientName}
              onChangeText={set('recipientName')}
              placeholder="Full name of recipient"
            />
            <LabeledInput
              icon={<IconPhone color="#AAAAAA" size={18} />}
              label="Recipient Phone"
              value={state.recipientPhone}
              onChangeText={set('recipientPhone')}
              keyboardType="phone-pad"
              placeholder="+960 XXXXXXX"
            />
            <LabeledSelect
              icon={<IconGlobe color="#AAAAAA" size={18} />}
              label="Country"
              value="Maldives"
              onPress={() => {}}
              disabled
            />
            <LabeledSelect
              icon={<IconMapPin color="#AAAAAA" size={18} />}
              label="Atoll"
              value={state.atoll}
              placeholder="Select atoll"
              onPress={() => setShowAtollPicker(true)}
            />
            <LabeledInput
              icon={<IconHome color="#AAAAAA" size={18} />}
              label="Address"
              value={state.street}
              onChangeText={set('street')}
              placeholder="House no., Building, Street, Area"
              multiline
            />
            <View style={styles.rowPair}>
              <View style={{ flex: 1 }}>
                <LabeledInput
                  icon={<IconCity color="#AAAAAA" size={18} />}
                  label="Island / City"
                  value={state.city}
                  onChangeText={set('city')}
                  placeholder="Enter island"
                />
              </View>
              <View style={{ flex: 1 }}>
                <LabeledInput
                  icon={<IconInbox color="#AAAAAA" size={18} />}
                  label="Postal Code"
                  value={state.zip}
                  onChangeText={set('zip')}
                  keyboardType="numeric"
                  placeholder="e.g. 20026"
                />
              </View>
            </View>
          </View>

          {/* Address Type */}
          <Text style={styles.subSectionTitle}>Address Type</Text>
          <View style={styles.typeRow}>
            <TypeOption
              label="Home"
              icon={<IconHome color={state.addrType === 'home' ? Colors.primary : '#AAAAAA'} size={16} />}
              selected={state.addrType === 'home'}
              onPress={() => set('addrType')('home')}
            />
            <TypeOption
              label="Work"
              icon={<IconBuilding color={state.addrType === 'work' ? Colors.primary : '#AAAAAA'} size={16} />}
              selected={state.addrType === 'work'}
              onPress={() => set('addrType')('work')}
            />
            <TypeOption
              label="Other"
              icon={<IconMapPin color={state.addrType === 'other' ? Colors.primary : '#AAAAAA'} size={16} />}
              selected={state.addrType === 'other'}
              onPress={() => set('addrType')('other')}
            />
          </View>

          {/* Set as Default */}
          <TouchableOpacity
            style={styles.defaultRow}
            onPress={() => set('isDefault')(!state.isDefault)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, state.isDefault && styles.checkboxChecked]}>
              {state.isDefault && <IconCheck color="#FFFFFF" size={12} />}
            </View>
            <Text style={styles.defaultLabel}>Set as default address</Text>
          </TouchableOpacity>
        </View>

        {/* ══ Account ══ */}
        <View style={styles.section}>
          <SectionTitle title="Account" />
          <View style={styles.listCard}>
            <NavRow
              icon={<IconLock color="#AAAAAA" size={18} />}
              label="Change Password"
              sub="Update your account password"
              onPress={() => navigation.navigate('ChangePassword')}
              last
            />
          </View>
        </View>

        {/* ── Save ── */}
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

        {/* ── Cancel ── */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        {/* ── Delete Account ── */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDeleteAccount}
          activeOpacity={0.8}
        >
          <IconTrash color="#E53935" size={16} />
          <Text style={styles.deleteBtnText}>Delete Account</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── Atoll Picker Modal ── */}
      <Modal
        visible={showAtollPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAtollPicker(false)}
      >
        <View style={modal.overlay}>
          <View style={modal.sheet}>
            <View style={modal.handle} />
            <Text style={modal.title}>Select Atoll</Text>
            <View style={modal.searchWrap}>
              <TextInput
                style={modal.searchInput}
                placeholder="Search atoll…"
                placeholderTextColor="#BBBBBB"
                value={atollSearch}
                onChangeText={setAtollSearch}
                autoFocus
              />
            </View>
            <FlatList
              data={filteredAtolls}
              keyExtractor={item => item}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={modal.row}
                  onPress={() => { set('atoll')(item); setAtollSearch(''); setShowAtollPicker(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={modal.rowText}>{item}</Text>
                  {state.atoll === item && <IconCheck color={Colors.primary} size={14} />}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#F5F5F5' }} />}
            />
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
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingVertical:   14,
    backgroundColor:   '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  topBtn:   { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontFamily: FontFamily.bold, fontSize: 18, color: '#111111' },

  // Profile card — matches Profile screen green card
  profileCard: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: '#F0FDF4',
    borderRadius:    16,
    padding:         16,
    marginBottom:    20,
    gap:             14,
    borderWidth:     1,
    borderColor:     '#D1FAE5',
  },
  avatarWrap:    { position: 'relative' },
  avatarCircle: {
    width: 68, height: 68, borderRadius: 34,
    overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#D1FAE5',
  },
  avatarFallback: { backgroundColor: '#D1FAE5' },
  avatarInitial:  { fontFamily: FontFamily.bold, fontSize: 26, color: Colors.primary },
  cameraBadge: {
    position:        'absolute',
    bottom:          0,
    right:           0,
    width:           24,
    height:          24,
    borderRadius:    12,
    backgroundColor: Colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     2,
    borderColor:     '#F0FDF4',
  },
  profileMeta:   { flex: 1 },
  profileName: {
    fontFamily:   FontFamily.extraBold,
    fontSize:     16,
    color:        '#111111',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
    marginBottom:  3,
  },
  profileDetail: {
    fontFamily: FontFamily.regular,
    fontSize:   13,
    color:      '#555555',
  },
  editBadge: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             4,
    alignSelf:       'flex-start',
  },
  editBadgeText: {
    fontFamily: FontFamily.semiBold,
    fontSize:   13,
    color:      Colors.primary,
  },

  // Sections
  section:       { marginBottom: 20 },
  card:          { backgroundColor: 'transparent' },

  rowPair:       { flexDirection: 'row', gap: 10 },
  typeRow:       { flexDirection: 'row', gap: 8, marginBottom: 12 },

  subSectionTitle: {
    fontFamily:   FontFamily.semiBold,
    fontSize:     13,
    color:        '#555555',
    marginBottom: 10,
    marginTop:    2,
  },

  defaultRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
    marginBottom:  4,
    marginTop:     4,
    paddingVertical: 4,
  },
  checkbox: {
    width:           22,
    height:          22,
    borderRadius:    6,
    borderWidth:     1.5,
    borderColor:     '#DDDDDD',
    backgroundColor: '#FFFFFF',
    alignItems:      'center',
    justifyContent:  'center',
  },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  defaultLabel: {
    fontFamily: FontFamily.medium,
    fontSize:   13,
    color:      '#333333',
  },

  // Account nav card
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius:    14,
    borderWidth:     1,
    borderColor:     '#EBEBEB',
    overflow:        'hidden',
  },

  // Buttons
  saveBtn: {
    height:          52,
    borderRadius:    14,
    backgroundColor: Colors.primary,
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
  cancelBtn: {
    height:          52,
    borderRadius:    14,
    borderWidth:     1.5,
    borderColor:     '#E0E0E0',
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    16,
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize:   15,
    color:      '#555555',
  },
  deleteBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             8,
    height:          48,
    borderRadius:    14,
    borderWidth:     1.5,
    borderColor:     '#FFCDD2',
    backgroundColor: '#FFF5F5',
  },
  deleteBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize:   14,
    color:      '#E53935',
  },
});

const modal = StyleSheet.create({
  overlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent:  'flex-end',
  },
  sheet: {
    backgroundColor:     '#FFFFFF',
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
    maxHeight:            '75%',
    paddingBottom:        32,
  },
  handle: {
    width:           40,
    height:          4,
    borderRadius:    2,
    backgroundColor: '#E0E0E0',
    alignSelf:       'center',
    marginTop:       12,
    marginBottom:    8,
  },
  title: {
    fontFamily:        FontFamily.bold,
    fontSize:          16,
    color:             '#111111',
    textAlign:         'center',
    paddingVertical:   12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  searchWrap: {
    marginHorizontal:  16,
    marginVertical:    10,
    backgroundColor:   '#F7F8FA',
    borderRadius:      10,
    paddingHorizontal: 14,
    height:            42,
    justifyContent:    'center',
    borderWidth:       1,
    borderColor:       '#EFEFEF',
  },
  searchInput: {
    fontFamily: FontFamily.regular,
    fontSize:   14,
    color:      '#111111',
  },
  row: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 20,
    paddingVertical:   14,
  },
  rowText: {
    flex:       1,
    fontFamily: FontFamily.medium,
    fontSize:   14,
    color:      '#111111',
  },
});