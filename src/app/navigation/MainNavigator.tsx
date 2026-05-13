import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors, Typography } from '../../theme';
import { HomeScreen }          from '../../features/product/screens/Home.screen';
import { ProductDetailScreen } from '../../features/product/screens/ProductDetail.screen';
import { useProductStore }     from '../../features/product/store/product.store';
import { CartScreen }          from '../../features/product/screens/Cart.screen';
import { ProfileNavigator }    from '../navigation/ProfileNavigator';
import type { MainTabParamList, ProductStackParamList } from './navigation.types';
import { OrderNavigator } from '../navigation/OrderNavigator';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Constants ────────────────────────────────────────────────────────────────
const FAB_SIZE   = 56;
const FAB_RADIUS = FAB_SIZE / 2;

const ARCH_RISE  = 38;
const ARCH_HALF  = 50;
const ARCH_CTRL  = 30;

const TAB_BG     = '#F8FAFC';
const TAB_BORDER = '#E2E8F0';

// Screens where the tab bar should be hidden
const HIDDEN_ON_ROUTES = new Set([
  'Cart',
  'Checkout',
  'OrderSuccess',
  'OrderDetail',
]);

// ─── Stacks ───────────────────────────────────────────────────────────────────
const ProductStack = createNativeStackNavigator<ProductStackParamList>();
const Tab          = createBottomTabNavigator<MainTabParamList>();

const ProductNavigator = () => (
  <ProductStack.Navigator screenOptions={{ headerShown: false }}>
    <ProductStack.Screen name="HomeScreen"    component={HomeScreen} />
    <ProductStack.Screen name="ProductDetail" component={ProductDetailScreen} />
  </ProductStack.Navigator>
);

const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
    <Text style={{ fontSize: 48, marginBottom: 12 }}>🚧</Text>
    <Text style={{ ...Typography.headingMedium, color: Colors.textPrimary }}>{title}</Text>
    <Text style={{ ...Typography.bodyMedium, color: Colors.textSecondary, marginTop: 6 }}>Coming soon</Text>
  </View>
);

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconHome = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9 21 9 15 12 15C15 15 15 21 15 21M9 21H15"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconHeart = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4.31802 6.31802C2.56066 8.07538 2.56066 10.9246 4.31802 12.682L12.0001 20.364L19.682 12.682C21.4393 10.9246 21.4393 8.07538 19.682 6.31802C17.9246 4.56066 15.0754 4.56066 13.318 6.31802L12.0001 7.63609L10.682 6.31802C8.92462 4.56066 6.07538 4.56066 4.31802 6.31802Z"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconCart = ({ color, size = 26 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6L18 2H6Z"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 6H21" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 10C16 12.2091 14.2091 14 12 14C9.79086 14 8 12.2091 8 10"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconOrder = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 3C10.8954 3 10 3.89543 10 5C10 6.10457 10.8954 7 12 7C13.1046 7 14 6.10457 14 5C14 3.89543 13.1046 3 12 3Z"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 12H15M9 16H13" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

const IconUser = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21V19C20 17.8954 19.5523 16.8954 18.8284 16.1716C18.1046 15.4477 17.1046 15 16 15H8C6.89543 15 5.89543 15.4477 5.17157 16.1716C4.44772 16.8954 4 17.8954 4 19V21"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={7} r={4} stroke={color} strokeWidth={1.8} />
  </Svg>
);

const TABS = [
  { name: 'Home'      as const, label: 'Home',      Icon: IconHome },
  { name: 'Favourite' as const, label: 'Favourite',  Icon: IconHeart },
  { name: 'Cart'      as const, label: '',            Icon: IconCart },
  { name: 'Orders'    as const, label: 'Order',      Icon: IconOrder },
  { name: 'Account'   as const, label: 'Account',    Icon: IconUser },
];

// ─── Arch SVG Background ──────────────────────────────────────────────────────
const ArchTabBackground: React.FC<{ tabH: number }> = ({ tabH }) => {
  const w  = SCREEN_W;
  const cx = w / 2;
  const ar = ARCH_RISE;
  const aw = ARCH_HALF;
  const c  = ARCH_CTRL;

  const d = [
    `M0,0`,
    `H${cx - aw - c}`,
    `C${cx - aw},0 ${cx - aw * 0.9},${-ar} ${cx},${-ar}`,
    `C${cx + aw * 0.9},${-ar} ${cx + aw},0 ${cx + aw + c},0`,
    `H${w}`,
    `V${tabH}`,
    `H0Z`,
  ].join(' ');

  return (
    <Svg
      width={w}
      height={tabH + ar}
      viewBox={`0 ${-ar} ${w} ${tabH + ar}`}
      style={{ position: 'absolute', bottom: 0, left: 0 }}
    >
      <Path d={d} fill={TAB_BORDER} />
      <Path d={d} fill={TAB_BG} />
    </Svg>
  );
};

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
const CustomTabBar = ({ state, navigation, route }: any) => {
  const cartCount = useProductStore(s => s.cartCount);

  // ✅ Get the currently focused route name (works across nested navigators)
  const focusedTab = state.routes[state.index];
  const focusedRouteName = getFocusedRouteNameFromRoute(focusedTab) ?? focusedTab.name;

  // ✅ Hide tab bar on Cart, Checkout, OrderSuccess, OrderDetail
  if (HIDDEN_ON_ROUTES.has(focusedRouteName)) {
    return null;
  }

  const isCartActive = focusedTab.name === 'Cart';

  const tabH  = Platform.OS === 'ios' ? 84 : 68;
  const pbIos = Platform.OS === 'ios' ? 20 : 0;
  const fabBottom = tabH + 22 - FAB_SIZE;

  return (
    <View style={[tabStyles.wrapper, { height: tabH + ARCH_RISE }]}>

      <View style={[tabStyles.solidFloor, { height: tabH }]} />

      <View style={tabStyles.bgShadow}>
        <ArchTabBackground tabH={tabH} />
      </View>

      <View style={[tabStyles.bar, { height: tabH, paddingBottom: pbIos }]}>
        {TABS.map((tab, index) => {
          const focused = state.index === index;
          if (tab.name === 'Cart') return <View key="cart-gap" style={{ flex: 1 }} />;
          const iconColor = focused ? Colors.primary : '#94A3B8';
          return (
            <TouchableOpacity
              key={tab.name}
              style={tabStyles.tab}
              onPress={() => navigation.navigate(tab.name)}
              activeOpacity={0.7}
            >
              <tab.Icon color={iconColor} size={22} />
              <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
                {tab.label}
              </Text>
              {focused ? <View style={tabStyles.activeDot} /> : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Cart FAB */}
      <TouchableOpacity
        style={[tabStyles.fabAbs, { bottom: fabBottom, left: SCREEN_W / 2 - FAB_RADIUS }]}
        onPress={() => navigation.navigate('Cart')}
        activeOpacity={0.85}
      >
        <View style={[tabStyles.fab, isCartActive && tabStyles.fabActive]}>
          <IconCart color="#fff" size={24} />
          {cartCount > 0 ? (
            <View style={tabStyles.badge}>
              <Text style={tabStyles.badgeText}>{cartCount}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>

    </View>
  );
};

// ─── Navigator ────────────────────────────────────────────────────────────────
const MainNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false }}
    tabBar={(props) => <CustomTabBar {...props} />}
  >
    <Tab.Screen name="Home"      component={ProductNavigator} />
    <Tab.Screen name="Favourite" component={() => <PlaceholderScreen title="Favourites" />} />
    <Tab.Screen name="Cart"      component={CartScreen} />
    <Tab.Screen name="Orders"    component={OrderNavigator} />
    <Tab.Screen name="Account"   component={ProfileNavigator} />
  </Tab.Navigator>
);

export default MainNavigator;

// ─── Styles ───────────────────────────────────────────────────────────────────
const tabStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: 'transparent',
    zIndex: 9999, elevation: 9999,
  },
  solidFloor: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: TAB_BG,
    borderTopWidth: 1, borderTopColor: TAB_BORDER,
    zIndex: 0,
  },
  bgShadow: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    top: -ARCH_RISE,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35, shadowRadius: 12,
    elevation: 25,
  },
  bar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    position: 'absolute', bottom: 0, left: 0, right: 0,
  },
  tab: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8, gap: 3,
  },
  label:       { ...Typography.bodySmall, color: '#94A3B8', fontWeight: '600', fontSize: 10 },
  labelActive: { color: Colors.primary },
  activeDot: {
    position: 'absolute', bottom: 2,
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  fabAbs: { position: 'absolute', width: FAB_SIZE, height: FAB_SIZE, zIndex: 20 },
  fab: {
    width: FAB_SIZE, height: FAB_SIZE, borderRadius: FAB_RADIUS,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 10, elevation: 12,
  },
  fabActive: { transform: [{ scale: 1.07 }] },
  badge: {
    position: 'absolute', top: -2, right: -2,
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.navy,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5, borderColor: Colors.white,
  },
  badgeText: { fontSize: 10, color: Colors.white, fontWeight: '800' },
});