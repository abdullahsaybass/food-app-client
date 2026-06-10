import React, { useReducer, useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Alert, ActivityIndicator,
  Modal, FlatList,
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors,FontFamily } from '../../../theme';
import { addAddressApi, updateAddressApi } from '../api/user.api';
import type { Address } from '../../../types/user.types';
import { useAuthStore } from '../../auth/store/auth.store';


type Props = NativeStackScreenProps<any, 'AddAddress'>;

const MV_LAT_MIN = -1.0, MV_LAT_MAX = 7.5;
const MV_LNG_MIN = 72.5, MV_LNG_MAX = 73.7;
const isInMaldives = (lat: number, lng: number) =>
  lat >= MV_LAT_MIN && lat <= MV_LAT_MAX && lng >= MV_LNG_MIN && lng <= MV_LNG_MAX;

export const MALDIVES_ATOLLS = [
  'Malé City', 'Addu City (Seenu)', 'North Malé (Kaafu)', 'South Malé (Kaafu)',
  'Ari (Alif Alif)', 'South Ari (Alif Dhaal)', 'Faafu', 'Dhaalu', 'Meemu',
  'Thaa', 'Laamu', 'Gaaf Alif', 'Gaaf Dhaal', 'Gnaviyani (Fuvahmulah)',
  'Haa Alif', 'Haa Dhaal', 'Shaviyani', 'Noonu', 'Raa', 'Baa', 'Lhaviyani',
].sort();

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconArrowLeft = ({ color = '#333', size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconUser = ({ color = '#999', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={7} r={4} stroke={color} strokeWidth={1.8} />
  </Svg>
);
const IconPhone = ({ color = '#999', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.5 2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconMapPin = ({ color = '#999', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={9} r={2.5} stroke={color} strokeWidth={1.8} />
  </Svg>
);
const IconHome2 = ({ color = '#999', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="9 22 9 12 15 12 15 22" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconBriefcase = ({ color = '#999', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={2} y={7} width={20} height={14} rx={2} stroke={color} strokeWidth={1.8} />
    <Path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconCity = ({ color = '#999', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={1} y={3} width={15} height={18} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 8h4l3 3v9h-7V8z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={5} y1={7} x2={5} y2={7.01} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    <Line x1={9} y1={7} x2={9} y2={7.01} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    <Line x1={5} y1={11} x2={5} y2={11.01} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    <Line x1={9} y1={11} x2={9} y2={11.01} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);
const IconMail = ({ color = '#999', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={2} y={4} width={20} height={16} rx={2} stroke={color} strokeWidth={1.8} />
    <Path d="M22 7l-10 7L2 7" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconGlobe = ({ color = '#999', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={1.8} />
    <Line x1={2} y1={12} x2={22} y2={12} stroke={color} strokeWidth={1.8} />
    <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke={color} strokeWidth={1.8} />
  </Svg>
);
const IconTag = ({ color = '#999', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={7} y1={7} x2={7.01} y2={7} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);
const IconChevronDown = ({ color = '#999', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconCheck = ({ color = '#111', size = 14 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconNavigation = ({ color = '#111', size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 11l19-9-9 19-2-8-8-2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── State ────────────────────────────────────────────────────────────────────
type AddressType = 'home' | 'work' | 'other';

interface FormState {
  type:           AddressType;
  useMyDetails:   boolean;
  recipientName:  string;
  recipientPhone: string;
  street:         string;
  floor:          string;
  landmark:       string;
  city:           string;
  atoll:          string;
  zip:            string;
  label:          string;
  instructions:   string;
  isDefault:      boolean;
  loading:        boolean;
  locating:       boolean;
}

type Action =
  | { type: 'SET_FIELD'; field: keyof Omit<FormState, 'loading' | 'locating'>; value: any }
  | { type: 'SET_LOADING'; value: boolean }
  | { type: 'SET_LOCATING'; value: boolean };

const initialState: FormState = {
  type: 'home', useMyDetails: false,
  recipientName: '', recipientPhone: '',
  street: '', floor: '', landmark: '', city: '', atoll: '', zip: '',
  label: '', instructions: '',
  isDefault: false, loading: false, locating: false,
};

function reducer(s: FormState, a: Action): FormState {
  switch (a.type) {
    case 'SET_FIELD':    return { ...s, [a.field]: a.value };
    case 'SET_LOADING':  return { ...s, loading: a.value };
    case 'SET_LOCATING': return { ...s, locating: a.value };
    default:             return s;
  }
}

// ─── Field components ─────────────────────────────────────────────────────────
const Field = ({
  label, icon, value, onChangeText, placeholder, editable = true,
  keyboardType, multiline, required,
}: {
  label?: string; icon?: React.ReactNode; value: string;
  onChangeText: (v: string) => void; placeholder?: string;
  editable?: boolean; keyboardType?: any; multiline?: boolean; required?: boolean;
}) => (
  <View style={fs.wrap}>
    {label && (
      <Text style={fs.label}>
        {label}{required && <Text style={fs.required}> *</Text>}
      </Text>
    )}
    <View style={[fs.row, multiline && fs.rowMulti, !editable && fs.rowDisabled]}>
      {icon && <View style={fs.icon}>{icon}</View>}
      <TextInput
        style={[fs.input, multiline && fs.inputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#C0C0C0"
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

const DropdownField = ({
  label, icon, value, placeholder, onPress, required,
}: {
  label?: string; icon?: React.ReactNode; value: string;
  placeholder?: string; onPress: () => void; required?: boolean;
}) => (
  <View style={fs.wrap}>
    {label && (
      <Text style={fs.label}>
        {label}{required && <Text style={fs.required}> *</Text>}
      </Text>
    )}
    <TouchableOpacity style={fs.row} onPress={onPress} activeOpacity={0.7}>
      {icon && <View style={fs.icon}>{icon}</View>}
      <Text style={[fs.input, !value && fs.placeholder, { paddingVertical: 0 }]}>
        {value || placeholder || ''}
      </Text>
      <IconChevronDown color="#C0C0C0" size={18} />
    </TouchableOpacity>
  </View>
);

const fs = StyleSheet.create({
  wrap:        { marginBottom: 12 },
  label:       { fontSize: 13, fontWeight: '500', color: '#888', marginBottom: 6 },
  required:    { color: '#EF4444' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E5E5E5',
    borderRadius: 10, paddingHorizontal: 14,
    height: 50, backgroundColor: '#FFF',
  },
  rowMulti:    { height: 80, alignItems: 'flex-start', paddingTop: 14 },
  rowDisabled: { backgroundColor: '#F7F7F7' },
  icon:        { marginRight: 10 },
  input:       { flex: 1, fontSize: 14, color: '#111', paddingVertical: 0 },
  inputMulti:  { paddingTop: 0 },
  placeholder: { color: '#C0C0C0' },
});

// ─── Type Selector ────────────────────────────────────────────────────────────
const TYPE_OPTIONS: { key: AddressType; label: string; Icon: any }[] = [
  { key: 'home',  label: 'House',  Icon: IconHome2 },
  { key: 'work',  label: 'Office', Icon: IconBriefcase },
  { key: 'other', label: 'Other',  Icon: IconNavigation },
];

const TypeSelector = ({ value, onChange }: { value: AddressType; onChange: (v: AddressType) => void }) => (
  <View style={ts.row}>
    {TYPE_OPTIONS.map(opt => {
      const active = value === opt.key;
      return (
        <TouchableOpacity
          key={opt.key}
          style={[ts.btn, active && ts.btnActive]}
          onPress={() => onChange(opt.key)}
          activeOpacity={0.8}
        >
          <opt.Icon color={active ? '#fff' : '#555'} size={15} />
          <Text style={[ts.label, active && ts.labelActive]}>{opt.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const ts = StyleSheet.create({
  row:        { flexDirection: 'row', gap: 8, marginBottom: 16 },
  btn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#FFF',
  },
  btnActive:  { backgroundColor: Colors.primary, borderColor: Colors.primary },
  label:      { fontSize: 13, fontWeight: '600', color: '#555' },
  labelActive:{ color: '#FFF' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────
export const AddAddressScreen: React.FC<Props> = ({ navigation, route }) => {
  const existing = (route.params as any)?.address as Address | undefined;
  const isEdit   = !!existing;
  const user     = useAuthStore(s => s.user);

  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    type:           (existing?.type ?? existing?.label ?? 'home') as AddressType,
    recipientName:  existing?.recipientName  ?? '',
    recipientPhone: existing?.recipientPhone ?? '',
    street:         existing?.street         ?? '',
    city:           existing?.city           ?? '',
    atoll:          existing?.state          ?? '',
    zip:            existing?.postalCode ?? existing?.zip ?? '',
    isDefault:      existing?.isDefault      ?? false,
  });

  const [showAtollPicker, setShowAtollPicker] = useState(false);
  const [atollSearch, setAtollSearch]         = useState('');

  const setField = useCallback(
    (field: keyof Omit<FormState, 'loading' | 'locating'>) => (value: any) =>
      dispatch({ type: 'SET_FIELD', field, value }),
    [],
  );

  // ── Use my account details ─────────────────────────────────────────────
  const handleUseMyDetails = (checked: boolean) => {
    setField('useMyDetails')(checked);
    if (checked && user) {
      setField('recipientName')(user.name ?? '');
      setField('recipientPhone')(user.phone ?? '');
    }
  };

  // ── GPS ────────────────────────────────────────────────────────────────
  const handleUseLocation = useCallback(async () => {
    dispatch({ type: 'SET_LOCATING', value: true });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access in your device settings.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = pos.coords;
      if (!isInMaldives(latitude, longitude)) {
        Alert.alert('Outside Maldives', 'Delivery is only available within the Maldives.');
        return;
      }
      const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (!geo) { Alert.alert('Error', 'Could not resolve your location.'); return; }
      const streetParts = [geo.streetNumber, geo.street, geo.district].filter(Boolean);
      if (streetParts.length) setField('street')(streetParts.join(', '));
      if (geo.city || geo.subregion) setField('city')(geo.city || geo.subregion || '');
      if (geo.postalCode) setField('zip')(geo.postalCode);
      const regionRaw = (geo.region || geo.subregion || '').toLowerCase();
      const matched   = MALDIVES_ATOLLS.find(a =>
        a.toLowerCase().includes(regionRaw) || regionRaw.includes(a.split(' ')[0].toLowerCase())
      );
      if (matched) setField('atoll')(matched);
    } catch {
      Alert.alert('Error', 'Failed to get location. Please try again.');
    } finally {
      dispatch({ type: 'SET_LOCATING', value: false });
    }
  }, []);

  // ── Save ───────────────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!state.recipientName.trim())  return 'Receiver name is required';
    if (!state.recipientPhone.trim()) return 'Phone number is required';
    if (!state.street.trim())         return 'Address is required';
    if (!state.city.trim())           return 'Island / City is required';
    if (!state.atoll.trim())          return 'Atoll is required';
    if (!state.zip.trim())            return 'Postal code is required';
    return null;
  };

  const handleSave = useCallback(async () => {
    const err = validate();
    if (err) { Alert.alert('Required', err); return; }
    dispatch({ type: 'SET_LOADING', value: true });
    const payload = {
      type:           state.type,
      label:          state.label || state.type,
      recipientName:  state.recipientName,
      recipientPhone: state.recipientPhone,
      street:         [state.street, state.floor].filter(Boolean).join(', '),
      landmark:       state.landmark,
      city:           state.city,
      state:          state.atoll,
      zip:            state.zip,
      isDefault:      state.isDefault,
    };
    try {
      if (isEdit && existing?._id) {
        await updateAddressApi(existing._id, payload);
      } else {
        await addAddressApi(payload as any);
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to save address');
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }, [state, isEdit, existing]);

  const filteredAtolls = MALDIVES_ATOLLS.filter(a =>
    a.toLowerCase().includes(atollSearch.toLowerCase())
  );

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      {/* ── Top bar ── */}
      <View style={s.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.topBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconArrowLeft color="#111" size={22} />
        </TouchableOpacity>
        <Text style={s.topTitle}>{isEdit ? 'Edit Address' : 'Add New Address'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.scroll}
      >
        {/* ── GPS Button ── */}
        <TouchableOpacity
          style={s.gpsBtn}
          onPress={handleUseLocation}
          activeOpacity={0.8}
          disabled={state.locating}
        >
          <View style={s.gpsIcon}>
            {state.locating
              ? <ActivityIndicator color="#111" size="small" />
              : <IconNavigation color="#111" size={16} />
            }
          </View>
          <Text style={s.gpsBtnText}>
            {state.locating ? 'Detecting location…' : 'Use my current location'}
          </Text>
        </TouchableOpacity>

        {/* ── Receiver Details ── */}
        <Text style={s.sectionTitle}>Receiver Details</Text>
        <View style={s.card}>
          {/* Use my account details checkbox */}
          <TouchableOpacity
            style={s.checkRow}
            onPress={() => handleUseMyDetails(!state.useMyDetails)}
            activeOpacity={0.7}
          >
            <View style={[s.checkbox, state.useMyDetails && s.checkboxOn]}>
              {state.useMyDetails && <IconCheck color="#fff" size={12} />}
            </View>
            <Text style={s.checkLabel}>Use my account details</Text>
          </TouchableOpacity>

          <View style={s.divider} />

          <Field
            placeholder="Receiver name *"
            icon={<IconUser color="#C0C0C0" size={17} />}
            value={state.recipientName}
            onChangeText={setField('recipientName')}
          />
          <Field
            placeholder="Receiver's number *"
            icon={<IconPhone color="#C0C0C0" size={17} />}
            value={state.recipientPhone}
            onChangeText={setField('recipientPhone')}
            keyboardType="phone-pad"
          />
        </View>

        {/* ── Location Details ── */}
        <Text style={s.sectionTitle}>Location Details</Text>
        <View style={s.card}>
          <TypeSelector
            value={state.type}
            onChange={setField('type') as any}
          />
          <Field
            placeholder={state.type === 'work' ? 'Office name / Floor *' : state.type === 'home' ? 'House no., Street, Area *' : 'Location name *'}
            icon={<IconHome2 color="#C0C0C0" size={17} />}
            value={state.street}
            onChangeText={setField('street')}
            multiline
          />
          <Field
            placeholder="Building / Street (Recommended)"
            icon={<IconCity color="#C0C0C0" size={17} />}
            value={state.floor}
            onChangeText={setField('floor')}
          />
          <View style={s.areaRow}>
            <View style={{ flex: 1 }}>
              <Field
                placeholder="Island / City *"
                icon={<IconMapPin color="#C0C0C0" size={17} />}
                value={state.city}
                onChangeText={setField('city')}
              />
            </View>
            <TouchableOpacity style={s.changeBtn} onPress={handleUseLocation}>
              <IconMapPin color={Colors.primary} size={16} />
              <Text style={s.changeBtnText}>Change</Text>
            </TouchableOpacity>
          </View>
          <DropdownField
            placeholder="Select Atoll *"
            icon={<IconGlobe color="#C0C0C0" size={17} />}
            value={state.atoll}
            onPress={() => setShowAtollPicker(true)}
          />
          <Field
            placeholder="Postal Code *"
            icon={<IconMail color="#C0C0C0" size={17} />}
            value={state.zip}
            onChangeText={setField('zip')}
            keyboardType="numeric"
          />
          <Field
            placeholder="Save address as *"
            icon={<IconTag color="#C0C0C0" size={17} />}
            value={state.label}
            onChangeText={setField('label')}
          />
        </View>

        {/* ── Delivery Instructions ── */}
        <Text style={s.sectionTitle}>Delivery Instructions <Text style={s.optional}>(optional)</Text></Text>
        <View style={s.card}>
          <Field
            placeholder="Instructions to help locate your address…"
            value={state.instructions}
            onChangeText={setField('instructions')}
            multiline
          />
        </View>

        {/* ── Default toggle ── */}
        <TouchableOpacity
          style={s.defaultRow}
          onPress={() => setField('isDefault')(!state.isDefault)}
          activeOpacity={0.7}
        >
          <View style={{ flex: 1 }}>
            <Text style={s.defaultLabel}>Set as default address</Text>
            <Text style={s.defaultSub}>Use this for all future orders</Text>
          </View>
          <View style={[s.toggle, state.isDefault && s.toggleOn]}>
            <View style={[s.thumb, state.isDefault && s.thumbOn]} />
          </View>
        </TouchableOpacity>

        {/* ── Save Button (inline, not fixed) ── */}
        <TouchableOpacity
          style={s.saveBtn}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={state.loading}
        >
          {state.loading
            ? <ActivityIndicator color="#FFF" size="small" />
            : <Text style={s.saveBtnText}>{isEdit ? 'Update Address' : 'Save Address'}</Text>
          }
        </TouchableOpacity>

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* ── Atoll Picker Modal ── */}
      <Modal
        visible={showAtollPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAtollPicker(false)}
      >
        <View style={m.overlay}>
          <View style={m.sheet}>
            <View style={m.handle} />
            <Text style={m.title}>Select Atoll</Text>
            <View style={m.searchWrap}>
              <TextInput
                style={m.searchInput}
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
                  style={m.row}
                  onPress={() => {
                    setField('atoll')(item);
                    setAtollSearch('');
                    setShowAtollPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={m.rowText}>{item}</Text>
                  {state.atoll === item && <IconCheck color="#111" size={14} />}
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
const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#F5F5F5' },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#F5F5F5',
  },
  topBtn:   { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 17, fontWeight: '700', color: '#111' },

  scroll: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 },

  // GPS
  gpsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFF',
    borderRadius: 12, padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: '#E5E5E5',
  },
  gpsIcon: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#F0F0F0',
    alignItems: 'center', justifyContent: 'center',
  },
  gpsBtnText: { fontSize: 14, fontWeight: '600', color: '#111' },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 10 },
  optional:     { fontSize: 13, fontWeight: '400', color: '#999' },

  card: {
    backgroundColor: '#FFF', borderRadius: 14,
    paddingHorizontal: 14, paddingTop: 14, paddingBottom: 4,
    borderWidth: 1, borderColor: '#EBEBEB',
    marginBottom: 20,
  },

  // Use my details
  checkRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  checkbox: {
    width: 20, height: 20, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#CCCCCC',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: '#111', borderColor: '#111' },
  checkLabel: { fontSize: 14, fontWeight: '500', color: '#111' },
  divider:    { height: 1, backgroundColor: '#F0F0F0', marginBottom: 14 },

  // Area row with Change button
  areaRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  changeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, height: 50, borderRadius: 10,
    borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#FFF',
    marginBottom: 12,
  },
  changeBtnText: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  // Default toggle
  defaultRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: '#EBEBEB',
    marginBottom: 16,
  },
  defaultLabel: { fontSize: 14, fontWeight: '600', color: '#111' },
  defaultSub:   { fontSize: 12, color: '#999', marginTop: 2 },
  toggle: {
    width: 46, height: 26, borderRadius: 13,
    backgroundColor: '#E0E0E0', justifyContent: 'center', paddingHorizontal: 3,
  },
  toggleOn:  { backgroundColor: '#111' },
  thumb: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFF',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15, shadowRadius: 2,
  },
  thumbOn: { alignSelf: 'flex-end' },

  // Save button — inline in scroll, not fixed
  saveBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  saveBtnText: { fontFamily: FontFamily.bold,       // ← DM Sans Bold
      fontSize: 16,
      color: '#16A34A',
      letterSpacing: -0.2, },
});

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '80%', paddingBottom: 32,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0',
    alignSelf: 'center', marginTop: 12, marginBottom: 8,
  },
  title: {
    fontSize: 16, fontWeight: '700', color: '#111',
    textAlign: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  searchWrap: {
    marginHorizontal: 16, marginVertical: 10,
    backgroundColor: '#F7F8FA', borderRadius: 10,
    paddingHorizontal: 14, height: 42, justifyContent: 'center',
    borderWidth: 1, borderColor: '#EFEFEF',
  },
  searchInput: { fontSize: 14, color: '#111' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  rowText: { flex: 1, fontSize: 14, color: '#111' },
});