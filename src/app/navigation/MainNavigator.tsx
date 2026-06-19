/**
 * MainNavigator.tsx
 */

import React, { useRef, useState, useCallback, type ComponentType } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type NavigationProp, type RouteProp } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';

import { Colors, Typography }   from '../../theme';
import { HomeScreen }           from '../../features/product/screens/Home.screen';
import { CategoriesScreen }     from '../../features/product/screens/Categories.screen';
import { CartScreen }           from '../../features/product/screens/Cart.screen';
import { ProfileScreen }        from '../../features/profile/screen/Profile.screen';
import { useProductStore }      from '../../features/product/store/product.store';
import { useAuthStore }         from '../../features/auth/store/auth.store';
import type { RootStackParamList } from './navigation.types';

// ─── Global tab switcher ──────────────────────────────────────────────────────
let _switchTab: ((name: string) => void) | null = null;
export const switchMainTab = (name: string) => _switchTab?.(name);

const { width: SCREEN_W } = Dimensions.get('window');
const TAB_H = Platform.OS === 'ios' ? 80 : 64;

// ─── Tab icons ────────────────────────────────────────────────────────────────

const IconHome = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9 21 9 15 12 15C15 15 15 21 15 21M9 21H15"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconCategories = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M4 5C4 4.44772 4.44772 4 5 4H9C9.55228 4 10 4.44772 10 5V9C10 9.55228 9.55228 10 9 10H5C4.44772 10 4 9.55228 4 9V5Z"   stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 5C14 4.44772 14.4477 4 15 4H19C19.5523 4 20 4.44772 20 5V9C20 9.55228 19.5523 10 19 10H15C14.4477 10 14 9.55228 14 9V5Z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M4 15C4 14.4477 4.44772 14 5 14H9C9.55228 14 10 14.4477 10 15V19C10 19.5523 9.55228 20 9 20H5C4.44772 20 4 19.5523 4 19V15Z"  stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 15C14 14.4477 14.4477 14 15 14H19C19.5523 14 20 14.4477 20 15V19C20 19.5523 19.5523 20 19 20H15C14.4477 20 14 19.5523 14 19V15Z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconCart = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6L18 2H6Z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 6H21" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 10C16 12.2091 14.2091 14 12 14C9.79086 14 8 12.2091 8 10" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconUser = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21V19C20 17.8954 19.5523 16.8954 18.8284 16.1716C18.1046 15.4477 17.1046 15 16 15H8C6.89543 15 5.89543 15.4477 5.17157 16.1716C4.44772 16.8954 4 17.8954 4 19V21" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={7} r={4} stroke={color} strokeWidth={1.8} />
  </Svg>
);

const TABS = [
  { name: 'Home'      as const, label: 'Home',       Icon: IconHome       },
  { name: 'Favourite' as const, label: 'Categories', Icon: IconCategories },
  { name: 'Cart'      as const, label: 'Cart',       Icon: IconCart       },
  { name: 'Account'   as const, label: 'Profile',    Icon: IconUser       },
];

// ─── Animated Tab Item ────────────────────────────────────────────────────────

const TabItem: React.FC<{
  tab: typeof TABS[number];
  focused: boolean;
  cartCount: number;
  onPress: () => void;
}> = ({ tab, focused, cartCount, onPress }) => {
  const scaleAnim   = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(focused ? 1 : 0.6)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.12 : 1,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }),
      Animated.timing(opacityAnim, {
        toValue: focused ? 1 : 0.6,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  const color  = focused ? Colors.primary : '#9CA3AF';
  const isCart = tab.name === 'Cart';

  return (
    <TouchableOpacity style={tabStyles.tab} onPress={onPress} activeOpacity={0.7}>
      <View style={[tabStyles.indicator, focused && tabStyles.indicatorActive]} />
      <Animated.View style={[tabStyles.iconWrap, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
        <tab.Icon color={color} />
        {isCart && cartCount > 0 && (
          <View style={tabStyles.badge}>
            <Text style={tabStyles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
          </View>
        )}
      </Animated.View>
      <Animated.Text style={[tabStyles.label, focused && tabStyles.labelActive, { opacity: opacityAnim }]}>
        {tab.label}
      </Animated.Text>
    </TouchableOpacity>
  );
};

// ─── Sliding Tab Container ────────────────────────────────────────────────────

const SlidingTabContainer: React.FC<{
  activeIndex: number;
  screens: React.ReactNode[];
}> = ({ activeIndex, screens }) => {
  const translateX = useRef(new Animated.Value(-activeIndex * SCREEN_W)).current;
  const prevIndex  = useRef(activeIndex);

  React.useEffect(() => {
    if (prevIndex.current === activeIndex) return;
    prevIndex.current = activeIndex;

    Animated.spring(translateX, {
      toValue:         -activeIndex * SCREEN_W,
      useNativeDriver: true,
      tension:         80,
      friction:        14,
      overshootClamping: true,
    }).start();
  }, [activeIndex]);

  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
      <Animated.View
        style={{
          flex:      1,
          flexDirection: 'row',
          width:     SCREEN_W * screens.length,
          transform: [{ translateX }],
        }}
      >
        {screens.map((screen, i) => (
          <View key={i} style={{ width: SCREEN_W, flex: 1 }}>
            {screen}
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

// ─── Main Navigator ───────────────────────────────────────────────────────────

const MainNavigator: React.FC = () => {
  const cartItems = useProductStore(s => s.cartItems);
  const cartCount = cartItems.length;
  const insets    = useSafeAreaInsets();

  const [activeIndex, setActiveIndex] = useState(0);

  // ── Register global tab switcher ─────────────────────────────────────────
  React.useEffect(() => {
    _switchTab = (name: string) => {
      const idx = TABS.findIndex(t => t.name === name);
      if (idx !== -1) setActiveIndex(idx);
    };
    return () => { _switchTab = null; };
  }, []);

  // ── Listen for navigate('MainTabs', { screen: 'Cart' }) calls ────────────
  const route = useRoute<RouteProp<RootStackParamList, 'MainTabs'>>();
  React.useEffect(() => {
    const targetScreen = (route.params as any)?.screen as string | undefined;
    if (!targetScreen) return;
    const idx = TABS.findIndex(t => t.name === targetScreen);
    if (idx !== -1) setActiveIndex(idx);
  }, [route.params]);

  const screens = [
    <HomeScreen       {...({} as any)} />,
    <CategoriesScreen {...({} as any)} />,
    <CartScreen       {...({} as any)} />,
    <ProfileScreen    {...({} as any)} />,
  ];

  return (
    <View style={{ flex: 1 }}>
      <SlidingTabContainer activeIndex={activeIndex} screens={screens} />

      {/* Tab Bar */}
      <View style={[tabStyles.bar, { paddingBottom: insets.bottom + 8 }]}>
        {TABS.map((tab, index) => (
          <TabItem
            key={tab.name}
            tab={tab}
            focused={activeIndex === index}
            cartCount={cartCount}
            onPress={() => setActiveIndex(index)}
          />
        ))}
      </View>
    </View>
  );
};

export default MainNavigator;

// ─── Styles ───────────────────────────────────────────────────────────────────

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection:   'row',
    alignItems:      'flex-start',
    backgroundColor: '#FFFFFF',
    borderTopWidth:  1,
    borderTopColor:  '#E8E8E8',
    height:          TAB_H,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: -2 },
    shadowOpacity:   0.05,
    shadowRadius:    6,
    elevation:       10,
  },
  tab: {
    flex:          1,
    alignItems:    'center',
    paddingTop:    0,
    paddingBottom: 10,
    gap:           4,
  },
  indicator: {
    width:                   '55%',
    height:                  3,
    borderBottomLeftRadius:  3,
    borderBottomRightRadius: 3,
    backgroundColor:         'transparent',
    marginBottom:            4,
  },
  indicatorActive: {
    backgroundColor: Colors.primary,
  },
  iconWrap: {
    position: 'relative',
  },
  label: {
    fontSize:   10,
    fontWeight: '500',
    color:      '#9CA3AF',
    marginTop:  2,
  },
  labelActive: {
    color:      Colors.primary,
    fontWeight: '700',
  },
  badge: {
    position:          'absolute',
    top:               -5,
    right:             -8,
    minWidth:          16,
    height:            16,
    borderRadius:      8,
    backgroundColor:   Colors.primary,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize:   9,
    color:      '#FFFFFF',
    fontWeight: '800',
  },
});