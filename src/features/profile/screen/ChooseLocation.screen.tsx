/**
 * ChooseLocation.screen.tsx
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ActivityIndicator, StatusBar, Platform, Keyboard,
  FlatList, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, FontFamily } from '../../../theme';
import { useLocationPickerStore } from '../store/locationPicker.store';
import type { RootStackParamList } from '../../../app/navigation/navigation.types';

type Nav   = NativeStackNavigationProp<RootStackParamList, 'ChooseLocation'>;
type Route = RouteProp<RootStackParamList, 'ChooseLocation'>;

// ─── Maldives bounds ──────────────────────────────────────────────────────────
const MV_BOUNDS = { minLat: -0.92, maxLat: 7.42, minLng: 72.33, maxLng: 73.78 };
const MV_CENTER = { lat: 4.1755, lng: 73.5093 };
const isInMaldives = (lat: number, lng: number) =>
  lat >= MV_BOUNDS.minLat && lat <= MV_BOUNDS.maxLat &&
  lng >= MV_BOUNDS.minLng && lng <= MV_BOUNDS.maxLng;

const ATOLLS = [
  'Malé City', 'Addu City (Seenu)', 'North Malé (Kaafu)', 'South Malé (Kaafu)',
  'Ari (Alif Alif)', 'South Ari (Alif Dhaal)', 'Faafu', 'Dhaalu', 'Meemu',
  'Thaa', 'Laamu', 'Gaaf Alif', 'Gaaf Dhaal', 'Gnaviyani (Fuvahmulah)',
  'Haa Alif', 'Haa Dhaal', 'Shaviyani', 'Noonu', 'Raa', 'Baa', 'Lhaviyani',
];

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconBack = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#1A1F2E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconSearch = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx={11} cy={11} r={8} stroke="#9CA3AF" strokeWidth={2} />
    <Path d="M21 21L16.65 16.65" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);
const IconCrosshair = ({ color = '#fff', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={2} />
    <Line x1={12} y1={2} x2={12} y2={5} stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1={12} y1={19} x2={12} y2={22} stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1={2} y1={12} x2={5} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1={19} y1={12} x2={22} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);
const IconMapPinFilled = ({ size = 40 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      fill={Colors.primary} stroke="#1A1F2E" strokeWidth={1} />
    <Circle cx={12} cy={9} r={2.8} fill="#fff" />
  </Svg>
);

// ─── Leaflet HTML ─────────────────────────────────────────────────────────────
const buildMapHtml = (lat: number, lng: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .leaflet-control-attribution { font-size: 9px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const bounds = L.latLngBounds(
      L.latLng(${MV_BOUNDS.minLat}, ${MV_BOUNDS.minLng}),
      L.latLng(${MV_BOUNDS.maxLat}, ${MV_BOUNDS.maxLng})
    );
    const map = L.map('map', {
      center: [${lat}, ${lng}],
      zoom: 14,
      zoomControl: false,
      attributionControl: true,
      maxBounds: bounds.pad(0.15),
      maxBoundsViscosity: 0.8,
      minZoom: 8,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);
    function send(type, payload) {
      const msg = JSON.stringify({ type, ...payload });
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(msg);
    }
    function sendCenter() {
      const c = map.getCenter();
      send('center', { lat: c.lat, lng: c.lng });
    }
    map.on('moveend', sendCenter);
    map.on('load', sendCenter);
    setTimeout(sendCenter, 300);
    document.addEventListener('message', onMessage);
    window.addEventListener('message', onMessage);
    function onMessage(e) {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'recenter') map.setView([data.lat, data.lng], data.zoom || 16);
      } catch (err) {}
    }
  </script>
</body>
</html>
`;

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

// Parsed fields we extract from Nominatim and reuse on Confirm
interface ParsedAddress {
  street: string;
  city: string;
  atoll: string;
  zip: string;
}

// Nominatim's usage policy requires a custom User-Agent identifying the app —
// requests using a default/library User-Agent are frequently throttled or
// silently rejected (returned without `display_name`), which is why the
// address text was falling back to raw coordinates.
const NOMINATIM_HEADERS = {
  'Accept-Language': 'en',
  'User-Agent': 'VFresh-MaldivesGroceryApp/1.0 (contact@vfresh.app)',
};

const parseNominatimAddress = (addr: Record<string, string>): ParsedAddress => {
  const streetParts = [addr.house_number, addr.road || addr.pedestrian || addr.path || addr.footway].filter(Boolean);
  const street = streetParts.join(' ');

  const city = addr.island || addr.village || addr.town || addr.city || addr.suburb || addr.neighbourhood || '';

  const rawAtoll = addr.county || addr.state_district || addr.state || '';
  const matched  = ATOLLS.find(a =>
    a.toLowerCase().includes(rawAtoll.toLowerCase()) ||
    rawAtoll.toLowerCase().includes(a.split(' ')[0].toLowerCase())
  );
  const atoll = matched || rawAtoll;

  const zip = addr.postcode || '';

  return { street, city, atoll, zip };
};

export const ChooseLocationScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<Route>();

  const initialLat = route.params?.initialLatitude  ?? MV_CENTER.lat;
  const initialLng = route.params?.initialLongitude ?? MV_CENTER.lng;

  const webviewRef = useRef<WebView>(null);
  const setPickedLocation = useLocationPickerStore(s => s.setPickedLocation);

  const [center, setCenter]             = useState({ lat: initialLat, lng: initialLng });
  const [addressLabel, setAddressLabel] = useState('Move the map to set your delivery location');
  const [parsedAddr, setParsedAddr]     = useState<ParsedAddress>({ street: '', city: '', atoll: '', zip: '' });
  const [resolving, setResolving]       = useState(false);
  const [locating, setLocating]         = useState(false);
  const [confirming, setConfirming]     = useState(false);

  const [searchQuery, setSearchQuery]     = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching]         = useState(false);

  const outOfBounds = !isInMaldives(center.lat, center.lng);

  // ── Reverse geocode — runs on every map move, stores parsed fields ──────────
  const fetchReverse = useCallback(async (lat: number, lng: number, zoom: number) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=${zoom}&addressdetails=1`;
    const res = await fetch(url, { headers: NOMINATIM_HEADERS });
    if (!res.ok) throw new Error(`Nominatim reverse geocode failed (${res.status})`);
    return res.json();
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setResolving(true);
    try {
      let data = await fetchReverse(lat, lng, 18);

      // Small islands often have no building-level data at zoom 18 and come
      // back with `{ error: "Unable to geocode" }` — retry at a coarser
      // zoom so we still get an island/atoll-level name instead of coords.
      if (!data?.display_name) {
        data = await fetchReverse(lat, lng, 14);
      }

      if (data?.display_name) {
        setAddressLabel(data.display_name);
      } else {
        setAddressLabel(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }

      // Store structured fields so Confirm can use them without a second call
      if (data?.address) {
        setParsedAddr(parseNominatimAddress(data.address));
      }
    } catch (err) {
      console.warn('[ChooseLocation] reverseGeocode failed:', err);
      setAddressLabel(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setResolving(false);
    }
  }, [fetchReverse]);

  // ── Handle messages from Leaflet WebView ─────────────────────────────────────
  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'center') {
        const lat = data.lat, lng = data.lng;
        setCenter({ lat, lng });
        if (isInMaldives(lat, lng)) reverseGeocode(lat, lng);
        else setAddressLabel('Outside Maldives — please choose a location within the Maldives');
      }
    } catch {}
  }, [reverseGeocode]);

  // ── Recenter map ─────────────────────────────────────────────────────────────
  const recenterMap = useCallback((lat: number, lng: number, zoom = 16) => {
    setCenter({ lat, lng });
    webviewRef.current?.postMessage(JSON.stringify({ type: 'recenter', lat, lng, zoom }));
  }, []);

  // ── Use current GPS location ─────────────────────────────────────────────────
  const handleUseCurrentLocation = useCallback(async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = pos.coords;
      recenterMap(latitude, longitude);
      if (isInMaldives(latitude, longitude)) reverseGeocode(latitude, longitude);
    } catch {} finally {
      setLocating(false);
    }
  }, [recenterMap, reverseGeocode]);

  // ── Search via Nominatim ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      setSearching(true);
      try {
        const viewbox = `${MV_BOUNDS.minLng},${MV_BOUNDS.maxLat},${MV_BOUNDS.maxLng},${MV_BOUNDS.minLat}`;
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(searchQuery)}&viewbox=${viewbox}&bounded=1&limit=8`;
        const res  = await fetch(url, { headers: NOMINATIM_HEADERS });
        if (!res.ok) throw new Error(`Nominatim search failed (${res.status})`);
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('[ChooseLocation] search failed:', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  const handleSelectSearchResult = useCallback((item: SearchResult) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    Keyboard.dismiss();
    setSearchQuery('');
    setSearchResults([]);
    recenterMap(lat, lng);
    setAddressLabel(item.display_name);
    // reverseGeocode will fire via moveend → handleWebViewMessage
  }, [recenterMap]);

  // ── Confirm — no second network call, reuse parsedAddr from last reverseGeocode
  const handleConfirm = useCallback(async () => {
    if (outOfBounds) return;
    setConfirming(true);
    try {
      setPickedLocation({
        latitude:  center.lat,
        longitude: center.lng,
        label:     addressLabel,
        street:    parsedAddr.street,
        city:      parsedAddr.city,
        atoll:     parsedAddr.atoll,
        zip:       parsedAddr.zip,
      });
      navigation.goBack();
    } finally {
      setConfirming(false);
    }
  }, [center, addressLabel, parsedAddr, outOfBounds, setPickedLocation, navigation]);

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Map ── */}
      <WebView
        ref={webviewRef}
        source={{ html: buildMapHtml(initialLat, initialLng) }}
        style={styles.flex}
        onMessage={handleWebViewMessage}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.mapLoading}>
            <ActivityIndicator color={Colors.primary} size="large" />
          </View>
        )}
      />

      {/* ── Fixed center pin ── */}
      <View style={styles.pinWrap} pointerEvents="none">
        <IconMapPinFilled size={40} />
        <View style={styles.pinShadow} />
      </View>

      {/* ── Header ── */}
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.roundBtn} onPress={() => navigation.goBack()}>
            <IconBack />
          </TouchableOpacity>
          <View style={styles.searchBar}>
            <IconSearch />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for area, street, island..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searching && <ActivityIndicator size="small" color={Colors.primary} />}
          </View>
        </View>

        {searchResults.length > 0 && (
          <View style={styles.resultsCard}>
            <FlatList
              data={searchResults}
              keyExtractor={(item, i) => `${item.lat}-${item.lon}-${i}`}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.resultRow} onPress={() => handleSelectSearchResult(item)}>
                  <Text style={styles.resultText} numberOfLines={2}>{item.display_name}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.resultSeparator} />}
              style={{ maxHeight: 240 }}
            />
          </View>
        )}
      </SafeAreaView>

      {/* ── Current location button ── */}
      <TouchableOpacity
        style={styles.locateBtn}
        onPress={handleUseCurrentLocation}
        activeOpacity={0.85}
        disabled={locating}
      >
        {locating
          ? <ActivityIndicator size="small" color="#fff" />
          : <IconCrosshair color="#fff" size={20} />
        }
      </TouchableOpacity>

      {/* ── Bottom sheet ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.bottomSheet}
      >
        {outOfBounds && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              We currently deliver within the Maldives only. Move the pin inside the Maldives.
            </Text>
          </View>
        )}

        <View style={styles.addressRow}>
          <View style={styles.addressIconWrap}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                stroke={Colors.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
              <Circle cx={12} cy={9} r={2.5} stroke={Colors.primary} strokeWidth={1.8} />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.addressLabel} numberOfLines={2}>
              {resolving ? 'Resolving address…' : addressLabel}
            </Text>
            <Text style={styles.coordsText}>
              {center.lat.toFixed(5)}, {center.lng.toFixed(5)}
            </Text>
            {/* Show parsed fields preview when available */}
            {(parsedAddr.city || parsedAddr.atoll || parsedAddr.zip) ? (
              <Text style={styles.parsedPreview}>
                {[parsedAddr.city, parsedAddr.atoll, parsedAddr.zip].filter(Boolean).join(' · ')}
              </Text>
            ) : null}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.confirmBtn, outOfBounds && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          activeOpacity={0.88}
          disabled={outOfBounds || confirming || resolving}
        >
          {confirming
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.confirmBtnText}>Confirm Location</Text>
          }
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },

  mapLoading: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },

  pinWrap: {
    position: 'absolute',
    top: '50%', left: '50%',
    marginLeft: -20, marginTop: -40,
    alignItems: 'center',
  },
  pinShadow: {
    width: 8, height: 4, borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.25)', marginTop: -2,
  },

  headerSafe: { position: 'absolute', top: 0, left: 0, right: 0 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingTop: 8,
  },
  roundBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 14, height: 44,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  searchInput: { flex: 1, fontFamily: FontFamily.regular, fontSize: 14, color: '#1A1F2E' },

  resultsCard: {
    marginTop: 8, marginHorizontal: 16,
    backgroundColor: '#fff', borderRadius: 12,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 4, overflow: 'hidden',
  },
  resultRow:       { paddingHorizontal: 14, paddingVertical: 12 },
  resultText:      { fontFamily: FontFamily.regular, fontSize: 13, color: '#1A1F2E' },
  resultSeparator: { height: 1, backgroundColor: '#F0F0F0' },

  locateBtn: {
    position: 'absolute', right: 16, bottom: 180,
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#1A1F2E', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  bottomSheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 28,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  warningBanner: {
    backgroundColor: '#FEF2F2', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12,
  },
  warningText: { fontFamily: FontFamily.medium, fontSize: 12.5, color: Colors.error, lineHeight: 18 },

  addressRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 16,
  },
  addressIconWrap: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  addressLabel:  { fontFamily: FontFamily.semiBold, fontSize: 14, color: '#1A1F2E', lineHeight: 20 },
  coordsText:    { fontFamily: FontFamily.regular, fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  parsedPreview: { fontFamily: FontFamily.medium, fontSize: 12, color: '#16A34A', marginTop: 4 },

  confirmBtn: {
    height: 54, borderRadius: 14,
    backgroundColor: '#1A1F2E',
    alignItems: 'center', justifyContent: 'center',
  },
  confirmBtnDisabled: { backgroundColor: '#C8C8C8' },
  confirmBtnText: { fontFamily: FontFamily.bold, fontSize: 15, color: '#fff', letterSpacing: 0.2 },
});