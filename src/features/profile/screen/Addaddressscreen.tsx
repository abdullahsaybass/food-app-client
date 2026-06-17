import React, { useReducer, useCallback, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Alert, ActivityIndicator,
  Modal, FlatList,
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Polyline, Rect, G } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Colors, FontFamily } from '../../../theme';
import { addAddressApi, updateAddressApi } from '../api/user.api';
import { useLocationPickerStore } from '../store/locationPicker.store';
import type { Address } from '../../../types/user.types';

type Props = NativeStackScreenProps<any, 'AddAddress'>;

const PRIMARY   = '#16A34A';
const NAVY      = '#1A1F2E';
const PAGE_BG   = '#FFFFFF';
const BORDER    = '#E8E8E8';
const INPUT_BG  = '#FAFAFA';
const TEXT1     = '#1A1F2E';
const TEXT2     = '#7A7A7A';
const GREEN_BG  = '#F0FDF4';

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
const IcoArrowLeft = ({ color = TEXT1, size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcoMapPin = ({ color = PRIMARY, size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={9} r={2.5} stroke={color} strokeWidth={1.8} />
  </Svg>
);
const IcoCrosshair = ({ color = TEXT1, size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={1.8} />
    <Line x1={22} y1={12} x2={18} y2={12} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Line x1={6}  y1={12} x2={2}  y2={12} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Line x1={12} y1={6}  x2={12} y2={2}  stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Line x1={12} y1={22} x2={12} y2={18} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.8} />
  </Svg>
);
const IcoUser = ({ color = '#C0C0C0', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={7} r={4} stroke={color} strokeWidth={1.8} />
  </Svg>
);
const IcoPhone = ({ color = '#C0C0C0', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.5 2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcoHome2 = ({ color = '#888', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="9 22 9 12 15 12 15 22" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcoBriefcase = ({ color = '#888', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={2} y={7} width={20} height={14} rx={2} stroke={color} strokeWidth={1.8} />
    <Path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={8} y1={14} x2={16} y2={14} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);
const IcoOther = ({ color = '#888', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={1} fill={color} />
    <Circle cx={19} cy={12} r={1} fill={color} />
    <Circle cx={5}  cy={12} r={1} fill={color} />
  </Svg>
);
const IcoStreet = ({ color = '#C0C0C0', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcoIsland = ({ color = '#C0C0C0', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 17s1-1 4-1 5 2 8 2 4-1 4-1" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={9} r={4} stroke={color} strokeWidth={1.8} />
  </Svg>
);
const IcoCity = ({ color = '#C0C0C0', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={1} y={3} width={15} height={18} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 8h4l3 3v9h-7V8z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcoMail = ({ color = '#C0C0C0', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={2} y={4} width={20} height={16} rx={2} stroke={color} strokeWidth={1.8} />
    <Path d="M22 7l-10 7L2 7" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcoTag = ({ color = '#C0C0C0', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={7} cy={7} r={1.5} stroke={color} strokeWidth={1.8} />
  </Svg>
);
const IcoSave = ({ color = '#fff', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="17 21 17 13 7 13 7 21" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="7 3 7 8 15 8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcoPencil = ({ color = PRIMARY, size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcoCheck = ({ color = '#fff', size = 14 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcoChevronDown = ({ color = '#999', size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcoShield = ({ color = PRIMARY, size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcoLocationOff = ({ color = PRIMARY, size = 56 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={9} r={2.5} stroke={color} strokeWidth={1.5} />
    <Line x1={4} y1={20} x2={20} y2={4} stroke="#EF4444" strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

// ─── State ─────────────────────────────────────────────────────────────────────
type AddressType = 'home' | 'work' | 'other';

interface FieldErrors {
  recipientName?:  string;
  recipientPhone?: string;
  street?:         string;
  atoll?:          string;
  island?:         string;
  zip?:            string;
  api?:            string;
}

interface FormState {
  type:           AddressType;
  recipientName:  string;
  recipientPhone: string;
  street:         string;
  atoll:          string;
  island:         string;
  zip:            string;
  label:          string;
  isDefault:      boolean;
  loading:        boolean;
  locating:       boolean;
}

type Action =
  | { type: 'SET_FIELD'; field: keyof Omit<FormState, 'loading' | 'locating'>; value: any }
  | { type: 'SET_LOADING'; value: boolean }
  | { type: 'SET_LOCATING'; value: boolean };

const initialState: FormState = {
  type: 'home',
  recipientName: '', recipientPhone: '',
  street: '', atoll: '', island: '', zip: '', label: '',
  isDefault: true, loading: false, locating: false,
};

function reducer(s: FormState, a: Action): FormState {
  switch (a.type) {
    case 'SET_FIELD':    return { ...s, [a.field]: a.value };
    case 'SET_LOADING':  return { ...s, loading: a.value };
    case 'SET_LOCATING': return { ...s, locating: a.value };
    default:             return s;
  }
}

const TYPE_OPTIONS: { key: AddressType; label: string; Icon: any }[] = [
  { key: 'home',  label: 'Home',  Icon: IcoHome2    },
  { key: 'work',  label: 'Work',  Icon: IcoBriefcase },
  { key: 'other', label: 'Other', Icon: IcoOther    },
];

// ─── Screen ───────────────────────────────────────────────────────────────────
export const AddAddressScreen: React.FC<Props> = ({ navigation, route }) => {
  const existing = (route.params as any)?.address as Address | undefined;
  const isEdit   = !!existing;

  const pickedLocation = useLocationPickerStore(s => s.pickedLocation);
  const clearPicked    = useLocationPickerStore(s => s.clearPickedLocation);

  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    type:           (existing?.type ?? 'home') as AddressType,
    recipientName:  existing?.recipientName  ?? '',
    recipientPhone: existing?.recipientPhone ?? '',
    street:         existing?.street         ?? '',
    atoll:          existing?.atoll          ?? '',
    island:         existing?.island         ?? '',
    zip:            existing?.zip            ?? '',
    label:          existing?.label          ?? '',
    isDefault:      existing?.isDefault      ?? true,
  });

  const [showCountryPicker,   setShowCountryPicker]   = useState(false);
  const [showOutsideMaldives, setShowOutsideMaldives] = useState(false);
  const [showAtollPicker,     setShowAtollPicker]     = useState(false);
  const [atollSearch,         setAtollSearch]         = useState('');

  const setField = useCallback(
    (field: keyof Omit<FormState, 'loading' | 'locating'>) => (value: any) =>
      dispatch({ type: 'SET_FIELD', field, value }),
    [],
  );

  // Apply location picked from map
  useEffect(() => {
    if (!pickedLocation) return;
    if (pickedLocation.street) setField('street')(pickedLocation.street);
    if (pickedLocation.city)   setField('island')(pickedLocation.city);
    if (pickedLocation.atoll)  setField('atoll')(pickedLocation.atoll);
    clearPicked();
  }, [pickedLocation]);

  // ── GPS ──────────────────────────────────────────────────────────────────
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
        setShowOutsideMaldives(true);
        return;
      }
      const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (!geo) { Alert.alert('Error', 'Could not resolve your location.'); return; }
      const streetParts = [geo.streetNumber, geo.street, geo.district].filter(Boolean);
      if (streetParts.length) setField('street')(streetParts.join(', '));
      if (geo.city || geo.subregion) setField('island')(geo.city || geo.subregion || '');
      if (geo.postalCode) setField('zip')(geo.postalCode);
      const regionRaw = (geo.region || geo.subregion || '').toLowerCase();
      const matched = MALDIVES_ATOLLS.find(a =>
        a.toLowerCase().includes(regionRaw) || regionRaw.includes(a.split(' ')[0].toLowerCase())
      );
      if (matched) setField('atoll')(matched);
    } catch {
      Alert.alert('Error', 'Failed to get location. Please try again.');
    } finally {
      dispatch({ type: 'SET_LOCATING', value: false });
    }
  }, []);

  const handleChooseOnMap = useCallback(() => {
    navigation.navigate('ChooseLocation', { returnTo: 'AddAddress' });
  }, [navigation]);

  // ── Inline field errors ───────────────────────────────────────────────────
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  const clearError = (field: keyof FieldErrors) =>
    setFieldErrors(prev => ({ ...prev, [field]: undefined }));

  // Strip all non-digit chars the user may have typed (dashes, spaces, etc.)
  const cleanPhone = (raw: string) => raw.replace(/\D/g, '');

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    const digits = cleanPhone(state.recipientPhone);

    const errs: FieldErrors = {};
    if (!state.recipientName.trim())  errs.recipientName  = 'Name is required';
    if (!digits)                      errs.recipientPhone = 'Phone number is required';
    if (!state.street.trim())         errs.street         = 'Street address is required';
    if (!state.atoll.trim())          errs.atoll          = 'Select an atoll';
    if (!state.island.trim())         errs.island         = 'Island name is required';
    if (!state.zip.trim())            errs.zip            = 'Postal code is required';

    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    dispatch({ type: 'SET_LOADING', value: true });
    const payload = {
      type:           state.type,
      label:          state.label || state.type,
      recipientName:  state.recipientName.trim(),
      // Backend regex: +960[3-9]\d{6} — no spaces or dashes
      recipientPhone: `+960${digits}`,
      street:         state.street.trim(),
      atoll:          state.atoll,
      island:         state.island.trim(),
      zip:            state.zip.trim(),
      isDefault:      state.isDefault,
      ...(pickedLocation ? {
        location: {
          latitude:  pickedLocation.latitude,
          longitude: pickedLocation.longitude,
        },
        locationLabel: pickedLocation.label,
      } : {}),
    };
    try {
      if (isEdit && existing?._id) {
        await updateAddressApi(existing._id, payload);
      } else {
        await addAddressApi(payload as any);
      }
      navigation.goBack();
    } catch (e: any) {
      const apiErrors: string[] | undefined = e?.response?.data?.errors;
      const msg = apiErrors?.length
        ? apiErrors.join(' · ')
        : (e?.response?.data?.message ?? 'Failed to save address. Please try again.');
      setFieldErrors({ api: msg });
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }, [state, isEdit, existing, pickedLocation]);

  const filteredAtolls = MALDIVES_ATOLLS.filter(a =>
    a.toLowerCase().includes(atollSearch.toLowerCase())
  );

  // Location display from picker store
  const hasPickedLocation = !!pickedLocation;
  const locationLabel     = pickedLocation?.label ?? '';
  const locationLat       = pickedLocation?.latitude?.toFixed(4) ?? '';
  const locationLng       = pickedLocation?.longitude?.toFixed(4) ?? '';

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backCircle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IcoArrowLeft color={TEXT1} size={20} />
        </TouchableOpacity>
        <View style={s.headerText}>
          <Text style={s.headerTitle}>{isEdit ? 'Edit Address' : 'Add Address'}</Text>
          <Text style={s.headerSub}>Add a new delivery address</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.scroll}
      >
        {/* ── Select Location ── */}
        <Text style={s.sectionTitle}>Select Location</Text>

        {/* Location buttons row */}
        <View style={s.locBtnRow}>
          <TouchableOpacity style={s.locBtn} onPress={handleChooseOnMap} activeOpacity={0.85}>
            <View style={s.locBtnIcon}>
              <IcoMapPin color={PRIMARY} size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.locBtnTitle}>Choose on Map</Text>
              <Text style={s.locBtnSub}>Manually pick your location</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.locBtn, s.locBtnRight]}
            onPress={handleUseLocation}
            disabled={state.locating}
            activeOpacity={0.85}
          >
            <View style={[s.locBtnIcon, s.locBtnIconGray]}>
              {state.locating
                ? <ActivityIndicator color={TEXT1} size="small" />
                : <IcoCrosshair color={TEXT1} size={20} />
              }
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.locBtnTitle, { color: TEXT1 }]}>Use Current Location</Text>
              <Text style={s.locBtnSub}>Detect your current location</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Map preview placeholder */}
        <TouchableOpacity style={s.mapPreview} onPress={handleChooseOnMap} activeOpacity={0.9}>
          <View style={s.mapBg}>
            <View style={s.mapGrid}>
              {[...Array(6)].map((_, i) => (
                <View key={`h${i}`} style={[s.mapLine, s.mapLineH, { top: `${(i + 1) * 14}%` }]} />
              ))}
              {[...Array(6)].map((_, i) => (
                <View key={`v${i}`} style={[s.mapLine, s.mapLineV, { left: `${(i + 1) * 16}%` }]} />
              ))}
            </View>
            <View style={s.mapPinWrap}>
              <View style={s.mapPinOuter}>
                <IcoMapPin color={PRIMARY} size={28} />
              </View>
              <View style={s.mapPinDot} />
            </View>
            <View style={s.mapRecenter}>
              <IcoCrosshair color={TEXT1} size={18} />
            </View>
            <View style={s.mapMovePinBtn}>
              <IcoMapPin color={PRIMARY} size={14} />
              <Text style={s.mapMovePinText}>Move Pin</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Selected location card */}
        {hasPickedLocation ? (
          <View style={s.selectedLocCard}>
            <View style={s.selectedLocIconWrap}>
              <IcoMapPin color={PRIMARY} size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.selectedLocTitle}>Selected Location</Text>
              <Text style={s.selectedLocAddr} numberOfLines={1}>{locationLabel}</Text>
              {locationLat ? (
                <Text style={s.selectedLocCoords}>Lat: {locationLat}, Lng: {locationLng}</Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={handleChooseOnMap} style={s.editLocBtn} activeOpacity={0.7}>
              <IcoPencil color={PRIMARY} size={14} />
              <Text style={s.editLocText}>Edit Location</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={s.selectedLocCard} onPress={handleChooseOnMap} activeOpacity={0.85}>
            <View style={s.selectedLocIconWrap}>
              <IcoMapPin color={PRIMARY} size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.selectedLocTitle}>Selected Location</Text>
              <Text style={s.selectedLocAddr}>Tap to pick on map</Text>
            </View>
            <TouchableOpacity onPress={handleChooseOnMap} style={s.editLocBtn} activeOpacity={0.7}>
              <IcoPencil color={PRIMARY} size={14} />
              <Text style={s.editLocText}>Edit Location</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        {/* ── Personal Details ── */}
        <Text style={s.sectionTitle}>Personal Details</Text>

        {/* Recipient Name */}
        <View style={[s.inputWrap, !!fieldErrors.recipientName && s.inputWrapError]}>
          <View style={s.inputIconWrap}>
            <IcoUser color={fieldErrors.recipientName ? '#EF4444' : '#C0C0C0'} size={18} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.inputLabel}>Recipient Name</Text>
            <TextInput
              style={s.textInput}
              value={state.recipientName}
              onChangeText={v => { setField('recipientName')(v); clearError('recipientName'); }}
              placeholder="Enter recipient name"
              placeholderTextColor="#C8C8C8"
            />
            {!!fieldErrors.recipientName && (
              <Text style={s.fieldError}>{fieldErrors.recipientName}</Text>
            )}
          </View>
        </View>

        {/* Recipient Phone — Maldives only (+960) */}
        <View style={[s.inputWrap, !!fieldErrors.recipientPhone && s.inputWrapError]}>
          <View style={s.inputIconWrap}>
            <IcoPhone color={fieldErrors.recipientPhone ? '#EF4444' : '#C0C0C0'} size={18} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.inputLabel}>Recipient Phone</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[s.dialInline, { backgroundColor: '#F0FDF4', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }]}>
                <Text style={[s.dialText, { color: PRIMARY }]}>🇲🇻 +960</Text>
              </View>
              <TextInput
                style={[s.textInput, { flex: 1, marginLeft: 8 }]}
                value={state.recipientPhone}
                onChangeText={v => { setField('recipientPhone')(v); clearError('recipientPhone'); }}
                placeholder="9751234"
                placeholderTextColor="#C8C8C8"
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            {!!fieldErrors.recipientPhone && (
              <Text style={s.fieldError}>{fieldErrors.recipientPhone}</Text>
            )}
          </View>
        </View>

        {/* ── Address Type ── */}
        <Text style={s.sectionTitle}>Address Type</Text>
        <View style={s.typeRow}>
          {TYPE_OPTIONS.map(opt => {
            const active = state.type === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[s.typeCard, active && s.typeCardActive]}
                onPress={() => setField('type')(opt.key)}
                activeOpacity={0.8}
              >
                <opt.Icon color={active ? PRIMARY : '#888'} size={18} />
                <Text style={[s.typeLabel, active && s.typeLabelActive]}>{opt.label}</Text>
                <View style={[s.radioOuter, active && s.radioOuterActive]}>
                  {active && <View style={s.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Street Address ── */}
        <View style={[s.inputWrap, !!fieldErrors.street && s.inputWrapError]}>
          <View style={s.inputIconWrap}>
            <IcoStreet color={fieldErrors.street ? '#EF4444' : '#C0C0C0'} size={18} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.inputLabel}>Street Address</Text>
            <TextInput
              style={s.textInput}
              value={state.street}
              onChangeText={v => { setField('street')(v); clearError('street'); }}
              placeholder="House / building / road"
              placeholderTextColor="#C8C8C8"
            />
            {!!fieldErrors.street && (
              <Text style={s.fieldError}>{fieldErrors.street}</Text>
            )}
          </View>
        </View>

        {/* ── Island ── */}
        <View style={[s.inputWrap, !!fieldErrors.island && s.inputWrapError]}>
          <View style={s.inputIconWrap}>
            <IcoIsland color={fieldErrors.island ? '#EF4444' : '#C0C0C0'} size={18} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.inputLabel}>Island</Text>
            <TextInput
              style={s.textInput}
              value={state.island}
              onChangeText={v => { setField('island')(v); clearError('island'); }}
              placeholder="e.g. Malé, Hulhumalé"
              placeholderTextColor="#C8C8C8"
            />
            {!!fieldErrors.island && (
              <Text style={s.fieldError}>{fieldErrors.island}</Text>
            )}
          </View>
        </View>

        {/* ── Atoll & Postal ── */}
        <View style={s.twoCol}>
          {/* Atoll picker */}
          <TouchableOpacity
            style={[s.inputWrap, { flex: 1 }, !!fieldErrors.atoll && s.inputWrapError]}
            onPress={() => { setShowAtollPicker(true); clearError('atoll'); }}
            activeOpacity={0.8}
          >
            <View style={s.inputIconWrap}>
              <IcoCity color={fieldErrors.atoll ? '#EF4444' : '#C0C0C0'} size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.inputLabel}>Atoll</Text>
              <Text style={[s.textInput, !state.atoll && { color: '#C8C8C8' }]}>
                {state.atoll || 'Select atoll'}
              </Text>
              {!!fieldErrors.atoll && (
                <Text style={s.fieldError}>{fieldErrors.atoll}</Text>
              )}
            </View>
            <IcoChevronDown color="#999" size={16} />
          </TouchableOpacity>

          {/* Postal code */}
          <View style={[s.inputWrap, { flex: 1 }, !!fieldErrors.zip && s.inputWrapError]}>
            <View style={s.inputIconWrap}>
              <IcoMail color={fieldErrors.zip ? '#EF4444' : '#C0C0C0'} size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.inputLabel}>Postal Code</Text>
              <TextInput
                style={s.textInput}
                value={state.zip}
                onChangeText={v => { setField('zip')(v); clearError('zip'); }}
                placeholder="e.g. 20095"
                placeholderTextColor="#C8C8C8"
                keyboardType="numeric"
              />
              {!!fieldErrors.zip && (
                <Text style={s.fieldError}>{fieldErrors.zip}</Text>
              )}
            </View>
          </View>
        </View>

        {/* ── Label ── */}
        <View style={s.inputWrap}>
          <View style={s.inputIconWrap}>
            <IcoTag color="#C0C0C0" size={18} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.inputLabel}>Label / Name <Text style={s.optional}>(Optional)</Text></Text>
            <TextInput
              style={s.textInput}
              value={state.label}
              onChangeText={setField('label')}
              placeholder="e.g. My Home, Office, Parents House"
              placeholderTextColor="#C8C8C8"
            />
          </View>
        </View>

        {/* ── Set as Default ── */}
        <TouchableOpacity
          style={s.defaultRow}
          onPress={() => setField('isDefault')(!state.isDefault)}
          activeOpacity={0.85}
        >
          <View style={[s.checkbox, state.isDefault && s.checkboxChecked]}>
            {state.isDefault && <IcoCheck color="#fff" size={13} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.defaultTitle}>Set as Default Address</Text>
            <Text style={s.defaultSub}>This address will be used for future orders</Text>
          </View>
          <View style={s.recommendedBadge}>
            <Text style={s.recommendedText}>Recommended</Text>
          </View>
        </TouchableOpacity>

        {/* ── API error banner ── */}
        {!!fieldErrors.api && (
          <View style={s.apiBanner}>
            <Text style={s.apiBannerText}>⚠️  {fieldErrors.api}</Text>
          </View>
        )}

        {/* ── Save Button ── */}
        <TouchableOpacity
          style={[s.saveBtn, state.loading && { opacity: 0.7 }]}
          onPress={handleSave}
          activeOpacity={0.88}
          disabled={state.loading}
        >
          {state.loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <IcoSave color="#fff" size={20} />
              <Text style={s.saveBtnText}>{isEdit ? 'Update Address' : 'Save Address'}</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Bottom trust note */}
        <View style={s.trustNote}>
          <IcoShield color={PRIMARY} size={14} />
          <Text style={s.trustNoteText}>Your address is secure and will only be used for delivery.</Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── Atoll Picker Modal ── */}
      <Modal visible={showAtollPicker} animationType="slide" transparent onRequestClose={() => setShowAtollPicker(false)}>
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
                  onPress={() => { setField('atoll')(item); setAtollSearch(''); setShowAtollPicker(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={m.rowText}>{item}</Text>
                  {state.atoll === item && <IcoCheck color={PRIMARY} size={16} />}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#F5F5F5' }} />}
            />
          </View>
        </View>
      </Modal>

      {/* ── Outside Maldives Modal ── */}
      <Modal visible={showOutsideMaldives} animationType="fade" transparent onRequestClose={() => setShowOutsideMaldives(false)}>
        <View style={om.overlay}>
          <View style={om.card}>
            <View style={om.iconCircle}>
              <IcoLocationOff />
            </View>
            <Text style={om.title}>Outside Delivery Area</Text>
            <Text style={om.message}>
              We currently deliver only within the Maldives. Your detected location
              is outside our service area — please enter your address manually.
            </Text>
            <TouchableOpacity style={om.btn} onPress={() => setShowOutsideMaldives(false)} activeOpacity={0.85}>
              <Text style={om.btnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: PAGE_BG },
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: PAGE_BG,
  },
  backCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F2F4F7',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14,
  },
  headerText:  { flex: 1 },
  headerTitle: { fontFamily: FontFamily.extraBold, fontSize: 22, color: TEXT1, letterSpacing: -0.3 },
  headerSub:   { fontSize: 13, color: TEXT2, marginTop: 2, fontFamily: FontFamily.regular },

  sectionTitle: {
    fontFamily: FontFamily.bold, fontSize: 15,
    color: TEXT1, marginBottom: 12, marginTop: 20,
  },

  locBtnRow: { flexDirection: 'row', gap: 10 },
  locBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderColor: PRIMARY, borderRadius: 12,
    padding: 14, backgroundColor: GREEN_BG,
  },
  locBtnRight: { borderColor: BORDER, backgroundColor: '#FAFAFA' },
  locBtnIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#DCF5E0',
    alignItems: 'center', justifyContent: 'center',
  },
  locBtnIconGray: { backgroundColor: '#EEEEEE' },
  locBtnTitle: { fontFamily: FontFamily.bold, fontSize: 13, color: PRIMARY },
  locBtnSub:   { fontFamily: FontFamily.regular, fontSize: 11, color: TEXT2, marginTop: 2 },

  mapPreview: {
    marginTop: 12, borderRadius: 14, overflow: 'hidden',
    height: 180, borderWidth: 1, borderColor: BORDER,
  },
  mapBg: { flex: 1, backgroundColor: '#D4E8F0', position: 'relative' },
  mapGrid: { ...StyleSheet.absoluteFillObject },
  mapLine: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.5)' },
  mapLineH: { left: 0, right: 0, height: 1 },
  mapLineV: { top: 0, bottom: 0, width: 1 },
  mapPinWrap: {
    position: 'absolute', top: '35%', left: '50%',
    transform: [{ translateX: -14 }, { translateY: -28 }],
    alignItems: 'center',
  },
  mapPinOuter: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: GREEN_BG, borderWidth: 2, borderColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
  },
  mapPinDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: PRIMARY, marginTop: 2 },
  mapRecenter: {
    position: 'absolute', top: 10, right: 10,
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  mapMovePinBtn: {
    position: 'absolute', bottom: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 14,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  mapMovePinText: { fontFamily: FontFamily.semiBold, fontSize: 13, color: PRIMARY },

  selectedLocCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginTop: 10, borderRadius: 12,
    borderWidth: 1, borderColor: BORDER,
    padding: 14, backgroundColor: '#FAFAFA',
  },
  selectedLocIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: GREEN_BG,
    alignItems: 'center', justifyContent: 'center',
  },
  selectedLocTitle:  { fontFamily: FontFamily.bold, fontSize: 13, color: PRIMARY, marginBottom: 2 },
  selectedLocAddr:   { fontFamily: FontFamily.medium, fontSize: 13, color: TEXT1 },
  selectedLocCoords: { fontFamily: FontFamily.regular, fontSize: 11, color: TEXT2, marginTop: 2 },
  editLocBtn:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editLocText: { fontFamily: FontFamily.semiBold, fontSize: 12, color: PRIMARY },

  twoCol:   { flexDirection: 'row', gap: 10 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'flex-start',
    borderWidth: 1.5, borderColor: BORDER,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
    backgroundColor: INPUT_BG, marginBottom: 12, gap: 10,
  },
  inputIconWrap: { marginTop: 2 },
  inputLabel: { fontFamily: FontFamily.regular, fontSize: 11, color: TEXT2, marginBottom: 4 },
  inputHint:  { fontFamily: FontFamily.regular, fontSize: 11, color: TEXT2, marginTop: 4 },
  textInput:  { fontFamily: FontFamily.medium, fontSize: 14, color: TEXT1, paddingVertical: 0 },
  optional:   { fontFamily: FontFamily.regular, fontSize: 11, color: '#BBBBBB' },

  dialInline: { flexDirection: 'row', alignItems: 'center', gap: 2, marginRight: 6 },
  dialText:   { fontFamily: FontFamily.semiBold, fontSize: 12, color: TEXT2 },

  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  typeCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    gap: 8, paddingVertical: 14, paddingHorizontal: 12,
    borderRadius: 12, borderWidth: 1.5, borderColor: BORDER,
    backgroundColor: '#FAFAFA',
  },
  typeCardActive:  { borderColor: PRIMARY, backgroundColor: GREEN_BG },
  typeLabel:       { flex: 1, fontFamily: FontFamily.medium, fontSize: 13, color: '#888' },
  typeLabelActive: { color: TEXT1, fontFamily: FontFamily.semiBold },
  radioOuter: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: '#C8C8C8',
    alignItems: 'center', justifyContent: 'center',
  },
  radioOuterActive: { borderColor: PRIMARY },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: PRIMARY },

  defaultRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F0FDF4', borderRadius: 12, padding: 16,
    marginTop: 8, marginBottom: 20,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  checkbox: {
    width: 24, height: 24, borderRadius: 6,
    borderWidth: 2, borderColor: BORDER,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  defaultTitle: { fontFamily: FontFamily.bold, fontSize: 14, color: TEXT1 },
  defaultSub:   { fontFamily: FontFamily.regular, fontSize: 12, color: TEXT2, marginTop: 2 },
  recommendedBadge: {
    backgroundColor: '#DCFCE7', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  recommendedText: { fontFamily: FontFamily.bold, fontSize: 11, color: PRIMARY },

  saveBtn: {
    height: 56, borderRadius: 14,
    backgroundColor: NAVY,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  saveBtnText: { fontFamily: FontFamily.bold, fontSize: 16, color: '#FFFFFF', letterSpacing: 0.2 },

  trustNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    justifyContent: 'center', marginTop: 14,
  },
  trustNoteText: { fontFamily: FontFamily.regular, fontSize: 12, color: TEXT2 },

  // Inline field error
  fieldError: {
    fontFamily: FontFamily.medium, fontSize: 11,
    color: '#EF4444', marginTop: 4,
  },
  inputWrapError: {
    borderColor: '#EF4444', backgroundColor: '#FFF9F9',
  },

  // API error banner
  apiBanner: {
    backgroundColor: '#FEF2F2', borderRadius: 10,
    borderWidth: 1, borderColor: '#FECACA',
    padding: 12, marginBottom: 12,
  },
  apiBannerText: {
    fontFamily: FontFamily.medium, fontSize: 13,
    color: '#DC2626', lineHeight: 18,
  },
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
    fontFamily: FontFamily.bold, fontSize: 16, color: '#111',
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
  row:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  rowText: { flex: 1, fontSize: 14, color: '#111' },
});

const om = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28,
  },
  card: {
    width: '100%', backgroundColor: '#FFF', borderRadius: 20,
    padding: 24, alignItems: 'center',
  },
  iconCircle: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: '#F0FBF3',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  title:   { fontFamily: FontFamily.bold, fontSize: 17, color: '#111', marginBottom: 8, textAlign: 'center' },
  message: { fontFamily: FontFamily.regular, fontSize: 13, color: '#777', textAlign: 'center', lineHeight: 19, marginBottom: 20 },
  btn: {
    width: '100%', height: 48, borderRadius: 12,
    backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center',
  },
  btnText: { fontFamily: FontFamily.bold, fontSize: 15, color: '#FFF' },
});