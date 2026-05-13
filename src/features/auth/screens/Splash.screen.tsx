import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing } from '../../../theme';
import type { AuthStackParamList } from '../../../app/navigation/navigation.types';

const { width, height } = Dimensions.get('window');
type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const logoScale   = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ringScale   = useRef(new Animated.Value(0.3)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY       = useRef(new Animated.Value(16)).current;
  const tagOpacity  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content');

    // Sequence: ring expands → logo pops → text slides up → tagline fades
    Animated.sequence([
      // Ring expand
      Animated.parallel([
        Animated.spring(ringScale, { toValue: 1, tension: 40, friction: 8, useNativeDriver: true }),
        Animated.timing(ringOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      // Logo pop
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 70, friction: 6, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
      // Text rise
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(textY, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
      ]),
      // Tagline
      Animated.timing(tagOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2800);

    return () => {
      clearTimeout(timer);
      StatusBar.setBarStyle('dark-content');
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.navy} translucent />

      {/* Decorative rings */}
      <Animated.View style={[styles.ringOuter, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]} />
      <Animated.View style={[styles.ringInner, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]} />

      {/* Center content */}
      <View style={styles.centerContent}>
        {/* Logo circle — matches the FAB style in the UI */}
        <Animated.View style={[styles.logoCircle, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          {/* Replace inner content with <Image source={require('...')} style={styles.logoImage} /> */}
          <Text style={styles.logoEmoji}>🛒</Text>
        </Animated.View>

        {/* App name */}
        <Animated.View style={{ opacity: textOpacity, transform: [{ translateY: textY }] }}>
          <Text style={styles.appName}>FreshMart</Text>
          <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
            Fresh Groceries, Delivered Fast
          </Animated.Text>
        </Animated.View>
      </View>

      {/* Bottom wave decoration */}
      <View style={styles.bottomDecor}>
        <View style={styles.decorDot} />
        <View style={[styles.decorDot, styles.decorDotMid]} />
        <View style={styles.decorDot} />
      </View>
    </SafeAreaView>
  );
};

const RING = width * 0.75;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    position: 'absolute',
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.15)',
  },
  ringInner: {
    position: 'absolute',
    width: RING * 0.65,
    height: RING * 0.65,
    borderRadius: (RING * 0.65) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.25)',
  },
  centerContent: {
    alignItems: 'center',
    gap: 24,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  logoEmoji: { fontSize: 44 },
  logoImage: { width: 60, height: 60, resizeMode: 'contain' },
  appName: {
    ...Typography.displayMedium,
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  tagline: {
    ...Typography.bodyMedium,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 0.3,
  },
  bottomDecor: {
    position: 'absolute',
    bottom: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  decorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  decorDotMid: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
});