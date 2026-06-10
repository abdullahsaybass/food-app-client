import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { Colors, Typography } from '../../../theme';
import type { RootStackParamList } from '../../../app/navigation/navigation.types';
import vfresh from '../../../../assets/images/vfresh.png';
import { useProductStore } from '../../product/store/product.store';

const { width } = Dimensions.get('window');

export const SplashScreen: React.FC = () => {
  const navigation        = useNavigation<NavigationProp<RootStackParamList>>();
  const hydrateGuestCart  = useProductStore(s => s.hydrateGuestCart);

  const logoScale   = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ringScale   = useRef(new Animated.Value(0.3)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY       = useRef(new Animated.Value(16)).current;
  const tagOpacity  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    hydrateGuestCart(); // restore guest cart from AsyncStorage

    // Animation sequence (~2800ms) → always go to MainTabs
    Animated.sequence([
      Animated.parallel([
        Animated.spring(ringScale, { toValue: 1, tension: 40, friction: 8, useNativeDriver: true }),
        Animated.timing(ringOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 70, friction: 6, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(textY, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
      ]),
      Animated.timing(tagOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    });

    return () => { StatusBar.setBarStyle('dark-content'); };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.navy} translucent />

      <Animated.View style={[styles.ringOuter, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]} />
      <Animated.View style={[styles.ringInner, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]} />

      <View style={styles.centerContent}>
        <Animated.View style={[styles.logoCircle, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <Image source={vfresh} style={styles.logoImage} />
        </Animated.View>

        <Animated.View style={{ opacity: textOpacity, transform: [{ translateY: textY }] }}>
          <Text style={styles.appName}>Vfresh</Text>
          <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
            Fresh Groceries, Delivered Fast
          </Animated.Text>
        </Animated.View>
      </View>

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
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
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