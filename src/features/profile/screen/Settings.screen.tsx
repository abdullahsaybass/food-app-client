import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography, Radius } from '../../../theme';
import type { ProfileStackParamList } from '../../../app/navigation/navigation.types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconMoon = ({ color = '#555', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconMapPin = ({ color = '#555', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={9} r={2.5} stroke={color} strokeWidth={1.8} />
  </Svg>
);

const IconHelpCircle = ({ color = '#555', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={1.8} />
    <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={12} y1={17} x2={12.01} y2={17} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

const IconShield = ({ color = '#555', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconFileText = ({ color = '#555', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="14 2 14 8 20 8"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={16} y1={13} x2={8} y2={13} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Line x1={16} y1={17} x2={8} y2={17} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

const IconInfo = ({ color = '#555', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={1.8} />
    <Line x1={12} y1={16} x2={12} y2={12} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Line x1={12} y1={8} x2={12.01} y2={8} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

const IconChevronRight = ({ color = '#CBD5E1', size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconArrowLeft = ({ color = '#1a1a1a', size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Settings config ──────────────────────────────────────────────────────────
const SETTINGS_ITEMS = [
  { id: 'dark',     label: 'Dark mode',          bg: '#F5F0FF', iconColor: '#6A1B9A', hasToggle: true,  Icon: IconMoon },
  { id: 'location', label: 'Location',            bg: '#FFF8E7', iconColor: '#F57F17', hasToggle: false, Icon: IconMapPin },
  { id: 'help',     label: 'Help & Support',      bg: '#EDF3FF', iconColor: '#1565C0', hasToggle: false, Icon: IconHelpCircle },
  { id: 'password', label: 'Password & Security', bg: '#EDF7ED', iconColor: '#2E7D32', hasToggle: false, Icon: IconShield },
  { id: 'privacy',  label: 'Privacy Policy',      bg: '#F0F7FF', iconColor: '#0277BD', hasToggle: false, Icon: IconFileText },
  { id: 'about',    label: 'About',               bg: '#FFF3EE', iconColor: '#E65100', hasToggle: false, Icon: IconInfo },
];

// ─── Screen ───────────────────────────────────────────────────────────────────
export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.profileBg} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconArrowLeft color={Colors.textPrimary} size={22} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 }}
      >
        <View style={styles.menuCard}>
          {SETTINGS_ITEMS.map((item, index) => (
            <React.Fragment key={item.id}>
              <TouchableOpacity
                style={styles.menuRow}
                activeOpacity={item.hasToggle ? 1 : 0.7}
              >
                {/* Colored icon bubble */}
                <View style={[styles.menuIconWrap, { backgroundColor: item.bg }]}>
                  <item.Icon color={item.iconColor} size={20} />
                </View>

                <Text style={styles.menuLabel}>{item.label}</Text>

                {item.hasToggle ? (
                  <Switch
                    value={darkMode}
                    onValueChange={setDarkMode}
                    trackColor={{ false: Colors.border, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                ) : (
                  <View style={styles.chevronWrap}>
                    <IconChevronRight color="#CBD5E1" size={16} />
                  </View>
                )}
              </TouchableOpacity>

              {index < SETTINGS_ITEMS.length - 1 && (
                <View style={styles.menuDivider} />
              )}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.profileBg },

  topBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  topBtn:   { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  topTitle: { ...Typography.headingMedium, color: Colors.textPrimary },

  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },

  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },

  menuIconWrap: {
    width: 42, height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuLabel: { ...Typography.titleMedium, color: Colors.textPrimary, flex: 1 },

  chevronWrap: {
    width: 28, height: 28,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuDivider: { height: 1, backgroundColor: Colors.grey100, marginHorizontal: 16 },
});