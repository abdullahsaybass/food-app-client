/**
 * MainNavigator.tsx
 */

import React, { type ComponentType } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, type NavigationProp }      from '@react-navigation/native';
import { createBottomTabNavigator }                from '@react-navigation/bottom-tabs';
import Svg, { Path, Circle }                       from 'react-native-svg';

import { Colors, Typography }         from '../../theme';
import { HomeScreen }                 from '../../features/product/screens/Home.screen';
import { CategoriesScreen }          from '../../features/product/screens/Categories.screen';
import { CartScreen }                 from '../../features/product/screens/Cart.screen';
import { OrderHistoryScreen }         from '../../features/order/screens/OrderHistory.screen';
import { ProfileScreen }              from '../../features/profile/screen/Profile.screen';
import { useProductStore }            from '../../features/product/store/product.store';
import { useAuthStore }               from '../../features/auth/store/auth.store';
import type { MainTabParamList, RootStackParamList } from './navigation.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const TAB_H  = Platform.OS === 'ios' ? 80 : 64;
const PB_IOS = Platform.OS === 'ios' ? 24 : 8;

// ─── Login Prompt ─────────────────────────────────────────────────────────────

const LoginPromptScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={promptStyles.container}>
      <Text style={promptStyles.emoji}>🔒</Text>
      <Text style={promptStyles.title}>Sign in to continue</Text>
      <Text style={promptStyles.subtitle}>
        Log in or create an account to access this feature.
      </Text>
      <TouchableOpacity
        style={promptStyles.primary}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={promptStyles.primaryText}>Log In</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={promptStyles.secondary}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={promptStyles.secondaryText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── Placeholder ──────────────────────────────────────────────────────────────

const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
    <Text style={{ ...Typography.headingMedium, color: Colors.textPrimary }}>{title}</Text>
    <Text style={{ ...Typography.bodyMedium,   color: Colors.textSecondary, marginTop: 6 }}>Coming soon</Text>
  </View>
);

// ─── Tab icons ────────────────────────────────────────────────────────────────

const IconHome = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9 21 9 15 12 15C15 15 15 21 15 21M9 21H15"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    />
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

const IconOrder = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 3C10.8954 3 10 3.89543 10 5C10 6.10457 10.8954 7 12 7C13.1046 7 14 6.10457 14 5C14 3.89543 13.1046 3 12 3Z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 12H15M9 16H13" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

const IconCart = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6L18 2H6Z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 6H21" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 10C16 12.2091 14.2091 14 12 14C9.79086 14 8 12.2091 8 10"  stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconUser = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21V19C20 17.8954 19.5523 16.8954 18.8284 16.1716C18.1046 15.4477 17.1046 15 16 15H8C6.89543 15 5.89543 15.4477 5.17157 16.1716C4.44772 16.8954 4 17.8954 4 19V21" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={7} r={4} stroke={color} strokeWidth={1.8} />
  </Svg>
);

const TABS = [
  { name: 'Home'      as const, label: 'Home',       Icon: IconHome },
  { name: 'Favourite' as const, label: 'Categories', Icon: IconCategories },
  { name: 'Cart'      as const, label: 'Cart',       Icon: IconCart },
  { name: 'Account'   as const, label: 'Profile',    Icon: IconUser },
];

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────

const CustomTabBar = ({ state, navigation }: any) => {
  const cartCount = useProductStore(s => s.cartCount);
  const insets    = useSafeAreaInsets();

  const handlePress = (tabName: string) => {
    setTimeout(() => navigation.navigate(tabName));
  };

  return (
    <View style={[tabStyles.bar, { paddingBottom: insets.bottom + 8 }]}>
      {TABS.map((tab, index) => {
        const focused = state.index === index;
        const color   = focused ? Colors.primary : '#9CA3AF';
        const isCart  = tab.name === 'Cart';

        return (
          <TouchableOpacity
            key={tab.name}
            style={tabStyles.tab}
            onPress={() => handlePress(tab.name)}
            activeOpacity={0.7}
          >
            <View style={[tabStyles.indicator, focused && tabStyles.indicatorActive]} />

            <View style={tabStyles.iconWrap}>
              <tab.Icon color={color} />
              {isCart && cartCount > 0 && (
                <View style={tabStyles.badge}>
                  <Text style={tabStyles.badgeText}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              )}
            </View>

            <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── Tab Navigator ────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  const isLoggedIn = useAuthStore(s => !!s.token);

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home"      component={HomeScreen as ComponentType<any>} />
      <Tab.Screen name="Favourite" component={CategoriesScreen as ComponentType<any>} />
      <Tab.Screen name="Cart"    component={CartScreen as ComponentType<any>} />
      <Tab.Screen name="Account" component={(isLoggedIn ? ProfileScreen      : LoginPromptScreen) as ComponentType<any>} />
    </Tab.Navigator>
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
    flex:        1,
    alignItems:  'center',
    paddingTop:  0,
    paddingBottom: 10,
    gap:         4,
  },
  indicator: {
    width:                '55%',
    height:               3,
    borderBottomLeftRadius:  3,
    borderBottomRightRadius: 3,
    backgroundColor:      'transparent',
    marginBottom:         4,
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
    position:        'absolute',
    top:             -5,
    right:           -8,
    minWidth:        16,
    height:          16,
    borderRadius:    8,
    backgroundColor: Colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize:   9,
    color:      '#FFFFFF',
    fontWeight: '800',
  },
});

const promptStyles = StyleSheet.create({
  container: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize:     40,
    marginBottom: 16,
  },
  title: {
    ...Typography.headingMedium,
    color:        Colors.textPrimary,
    textAlign:    'center',
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color:        Colors.textSecondary,
    textAlign:    'center',
    marginBottom: 32,
  },
  primary: {
    width:           '100%',
    paddingVertical: 14,
    borderRadius:    12,
    backgroundColor: Colors.primary,
    alignItems:      'center',
    marginBottom:    12,
  },
  primaryText: {
    color:      '#FFFFFF',
    fontWeight: '700',
    fontSize:   15,
  },
  secondary: {
    width:           '100%',
    paddingVertical: 14,
    borderRadius:    12,
    borderWidth:     1.5,
    borderColor:     Colors.primary,
    alignItems:      'center',
  },
  secondaryText: {
    color:      Colors.primary,
    fontWeight: '600',
    fontSize:   15,
  },
});