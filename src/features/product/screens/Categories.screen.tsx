import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Image, ActivityIndicator, Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { Colors, FontFamily } from '../../../theme';
import { productService } from '../services/product.service';
import { useProductStore } from '../store/product.store';
import type { Category } from '../types/product.types';
import type { RootStackParamList } from '../../../app/navigation/navigation.types';
import { API } from '@/src/app/lib/api';

const { width } = Dimensions.get('window');
const GRID_GAP = 10;
const CARD_WIDTH = Math.floor((width - 16 * 2 - GRID_GAP * 2) / 3);

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconSearch = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx={11} cy={11} r={8} stroke="#9CA3AF" strokeWidth={2} />
    <Path d="M21 21L16.65 16.65" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const IconBarcode = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Rect x={2}    y={4} width={3}   height={16} rx={0.5} fill="#555" />
    <Rect x={7}    y={4} width={1.5} height={16} rx={0.5} fill="#555" />
    <Rect x={10}   y={4} width={2.5} height={16} rx={0.5} fill="#555" />
    <Rect x={14.5} y={4} width={1.5} height={16} rx={0.5} fill="#555" />
    <Rect x={17.5} y={4} width={1}   height={16} rx={0.5} fill="#555" />
    <Rect x={19.5} y={4} width={2.5} height={16} rx={0.5} fill="#555" />
  </Svg>
);

const IconCart = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
      stroke="#1a1a1a" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 6h18" stroke="#1a1a1a" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 10a4 4 0 01-8 0" stroke="#1a1a1a" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconChevronRight = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke="#1a1a1a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconGrid = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Rect x={3}  y={3}  width={7} height={7} rx={1} stroke="#1a1a1a" strokeWidth={1.8} />
    <Rect x={14} y={3}  width={7} height={7} rx={1} stroke="#1a1a1a" strokeWidth={1.8} />
    <Rect x={3}  y={14} width={7} height={7} rx={1} stroke="#1a1a1a" strokeWidth={1.8} />
    <Rect x={14} y={14} width={7} height={7} rx={1} stroke="#1a1a1a" strokeWidth={1.8} />
  </Svg>
);

const IconPin = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
      stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={10} r={3} stroke={Colors.primary} strokeWidth={2} />
  </Svg>
);

const IconChevronDown = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M6 9l6 6 6-6" stroke="#1a1a1a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconClose = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
  </Svg>
);

const IconGlobe = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke="#fff" strokeWidth={1.8} />
    <Path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
      stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconTruck = () => (
  <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
    <Path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"
      stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={5.5}  cy={18.5} r={2.5} stroke={Colors.primary} strokeWidth={2} />
    <Circle cx={18.5} cy={18.5} r={2.5} stroke={Colors.primary} strokeWidth={2} />
  </Svg>
);

// ─── Outside Maldives Banner ──────────────────────────────────────────────────

const OutsideMaldivesBanner: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
  const slideAnim   = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim,   { toValue: 1, useNativeDriver: true, tension: 65, friction: 10 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim,   { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onDismiss());
  };

  return (
    <Animated.View style={[
      styles.notifBanner,
      {
        opacity:   opacityAnim,
        transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
      },
    ]}>
      <View style={styles.notifStripe} />
      <View style={styles.notifIconWrap}><IconGlobe /></View>
      <View style={styles.notifTextWrap}>
        <Text style={styles.notifTitle}>Delivery within Maldives only</Text>
        <Text style={styles.notifSub}>
          We currently deliver to Male' and select atolls. Orders outside the Maldives are not accepted.
        </Text>
      </View>
      <TouchableOpacity
        style={styles.notifClose}
        onPress={handleDismiss}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <IconClose />
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

export const CategoriesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [search,     setSearch]     = useState('');
  const [showBanner, setShowBanner] = useState(true);

  const cartItems = useProductStore(s => s.cartItems);
  const cartQty   = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  console.log('CATEGORIES SCREEN LOADED — productService:', productService);
  console.log('API instance:', API);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    productService.getCategories()
      .then(data => { if (!cancelled) setCategories(data); })
      .catch(err  => { if (!cancelled) setError(err.message ?? 'Failed to load categories'); })
      .finally(()  => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const displayCategories = categories
    .filter(c => c.id !== 'all')
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleCategoryPress = (cat: Category) => {
    navigation.navigate('CategoryProducts', {
      categoryId:   cat.id,
      categoryName: cat.name,
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Cart' })}
        >
          <IconCart />
          {cartQty > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartQty > 99 ? '99+' : cartQty}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Delivery row ── */}
      <View style={styles.deliveryRow}>
        <IconPin />
        <View style={styles.deliveryTextWrap}>
          <Text style={styles.deliverTo}>Deliver to</Text>
          <View style={styles.deliveryLocation}>
            <Text style={styles.locationText}>Male', Maldives</Text>
            <IconChevronDown />
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Outside Maldives Notification ── */}
        {showBanner && (
          <View style={styles.bannerWrap}>
            <OutsideMaldivesBanner onDismiss={() => setShowBanner(false)} />
          </View>
        )}

        {/* ── Search ── */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <IconSearch />
            <TextInput
              placeholder="Search for products..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
            <TouchableOpacity>
              <IconBarcode />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Hero Banner ── */}
        {!search.trim() && (
          <View style={styles.heroBanner}>
            {/* ✅ FIX 2: text block aligned to top with alignSelf + justifyContent: flex-start */}
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroTitle}>Shop by{'\n'}Category</Text>
              <Text style={styles.heroSub}>Find everything you need,{'\n'}all in one place.</Text>
            </View>
            <Image
              source={require('@/assets/images/catergory.png')}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>
        )}

        {/* ── Grid ── */}
        <View style={styles.section}>
          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
          ) : error ? (
            <View style={styles.centerMsg}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <>
              <View style={styles.grid}>
                {displayCategories.map((cat) => (
                  <TouchableOpacity
                    key={`cat-${cat.id}`}
                    style={styles.card}
                    activeOpacity={0.8}
                    onPress={() => handleCategoryPress(cat)}
                  >
                    {/* ✅ FIX 1: no background color on imageBox, image fills full box */}
                    <View style={styles.imageBox}>
                      {cat.image ? (
                        <Image
                          source={{ uri: cat.image as string }}
                          style={styles.catImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <Text style={styles.fallbackEmoji}>🛒</Text>
                      )}
                    </View>

                    <Text style={styles.catName} numberOfLines={2}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {displayCategories.length === 0 && (
                <View style={styles.centerMsg}>
                  <Text style={styles.errorText}>No categories found</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* ── Explore All ── */}
        {!search.trim() && !loading && (
          <TouchableOpacity style={styles.exploreRow} activeOpacity={0.8}>
            <IconGrid />
            <Text style={styles.exploreText}>Explore All Categories</Text>
            <IconChevronRight />
          </TouchableOpacity>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  // Header
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingVertical:   12,
    backgroundColor:   '#fff',
  },
  headerTitle: { fontFamily: FontFamily.bold, fontSize: 20, color: '#1a1a1a' },
  cartBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: 2, right: 2,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontFamily: FontFamily.bold, fontSize: 9, color: '#fff' },

  // Delivery row
  deliveryRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 10, gap: 8,
  },
  deliveryTextWrap: { flexDirection: 'column' },
  deliverTo:        { fontFamily: FontFamily.regular, fontSize: 11, color: '#9CA3AF' },
  deliveryLocation: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText:     { fontFamily: FontFamily.bold, fontSize: 14, color: '#1a1a1a' },

  scrollContent: { paddingTop: 4 },

  // Notification banner
  bannerWrap: { paddingHorizontal: 16, marginBottom: 12 },
  notifBanner: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#1A3C5E',
    borderRadius: 14, overflow: 'hidden',
    paddingVertical: 14, paddingRight: 12, paddingLeft: 0, gap: 10,
    shadowColor: '#1A3C5E', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 8, elevation: 4,
  },
  notifStripe: {
    width: 4, alignSelf: 'stretch',
    backgroundColor: Colors.primary, borderRadius: 2,
    marginLeft: 0, marginRight: 6,
  },
  notifIconWrap: { marginTop: 1 },
  notifTextWrap: { flex: 1 },
  notifTitle:    { fontFamily: FontFamily.bold, fontSize: 13, color: '#fff', marginBottom: 3 },
  notifSub:      { fontFamily: FontFamily.regular, fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 17 },
  notifClose:    { marginTop: 2, padding: 2 },

  // Search
  searchRow: { paddingHorizontal: 16, marginBottom: 16 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F5F5F5', borderRadius: 12,
    paddingHorizontal: 16, height: 48,
  },
  searchInput: { flex: 1, fontFamily: FontFamily.regular, fontSize: 14, color: '#1a1a1a' },

  // ✅ FIX 2: hero banner — alignItems: 'flex-start' so text sits at top
  heroBanner: {
    marginHorizontal: 16, marginBottom: 14,
    borderRadius: 16, backgroundColor: '#EFF7EF',
    flexDirection: 'row',
    alignItems: 'flex-start',   // ← was 'flex-end', text now pins to top
    overflow: 'hidden', minHeight: 160,
    paddingLeft: 20, paddingTop: 20, paddingBottom: 0,
  },
  heroTextBlock: {
    flex: 1,
    justifyContent: 'flex-start',   // ← text starts from top of its container
    paddingTop: 0,
  },
  heroTitle: {
    fontFamily: FontFamily.extraBold, fontSize: 22,
    color: '#1a1a1a', lineHeight: 28, marginBottom: 6,
  },
  heroSub: { fontFamily: FontFamily.regular, fontSize: 12, color: '#555', lineHeight: 18 },
  heroImage: { width: 160, height: 160, alignSelf: 'flex-end' },

  // Grid
  section: { paddingHorizontal: 16 },
  grid:    { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP },

  card: {
    width: CARD_WIDTH, borderRadius: 12,
    borderWidth: 1, borderColor: '#EFEFEF',
    padding: 10, alignItems: 'center',   // ✅ centers image + text horizontally
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },

  // ✅ FIX 1: removed backgroundColor — image renders without any colored backing
  imageBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
    // no backgroundColor here
  },

  // ✅ FIX 1: image now fills full imageBox (was 85%) for larger appearance
  catImage: { width: '100%', height: '100%' },

  fallbackEmoji: { fontSize: 32 },
  catName: {
    fontFamily: FontFamily.bold, fontSize: 12,
    color: '#1a1a1a', lineHeight: 16, marginBottom: 4, textAlign: 'center',
  },

  // Free Delivery badge styles kept in case needed elsewhere
  freeDeliveryBadge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               3,
    backgroundColor:   Colors.primary + '15',
    borderRadius:      6,
    paddingHorizontal: 6,
    paddingVertical:   3,
  },
  freeDeliveryText: {
    fontFamily: FontFamily.bold,
    fontSize:   9,
    color:      Colors.primary,
  },

  centerMsg: { flex: 1, alignItems: 'center', paddingVertical: 40 },
  errorText: { fontFamily: FontFamily.regular, color: '#9CA3AF', fontSize: 14 },

  // Explore all row
  exploreRow: {
    marginHorizontal: 16, marginTop: 20,
    borderRadius: 12, borderWidth: 1, borderColor: '#EFEFEF',
    paddingHorizontal: 16, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff',
  },
  exploreText: { flex: 1, fontFamily: FontFamily.semiBold, fontSize: 14, color: '#1a1a1a' },

  // Full-width free delivery banner styles (kept for reference)
  freeDeliveryBanner: {
    marginHorizontal:  16,
    marginBottom:      16,
    borderRadius:      14,
    backgroundColor:   Colors.primary,
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingVertical:   14,
    shadowColor:       Colors.primary,
    shadowOffset:      { width: 0, height: 4 },
    shadowOpacity:     0.25,
    shadowRadius:      8,
    elevation:         4,
  },
  freeDeliveryBannerLeft: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  freeDeliveryBannerTitle: {
    fontFamily: FontFamily.bold, fontSize: 15, color: '#fff',
  },
  freeDeliveryBannerSub: {
    fontFamily: FontFamily.regular, fontSize: 11,
    color: 'rgba(255,255,255,0.8)', marginTop: 2,
  },
  freeDeliveryPill: {
    backgroundColor:   'rgba(255,255,255,0.2)',
    borderRadius:      20,
    paddingHorizontal: 12,
    paddingVertical:   5,
  },
  freeDeliveryPillText: {
    fontFamily: FontFamily.bold, fontSize: 11, color: '#fff',
  },
});