import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Image, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import banner1 from '@/assets/images/banner1.png';
import banner2 from '@/assets/images/banner2.png';
import banner3 from '@/assets/images/banner3.png';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 40;
const SLIDE_INTERVAL_MS = 3500; // time between auto-advances

const BANNERS = [banner1, banner2, banner3];

export const BannerCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const indexRef = useRef(0); // mirrors activeIndex for use inside the interval closure
  const isUserScrolling = useRef(false);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (BANNER_WIDTH + 12));
    indexRef.current = idx;
    setActiveIndex(idx);
  };

  const scrollToIndex = useCallback((idx: number) => {
    scrollRef.current?.scrollTo({ x: idx * (BANNER_WIDTH + 12), animated: true });
    indexRef.current = idx;
    setActiveIndex(idx);
  }, []);

  // ── Auto-advance every SLIDE_INTERVAL_MS, looping back to the start ──
  useEffect(() => {
    const timer = setInterval(() => {
      if (isUserScrolling.current) return; // don't fight a manual swipe in progress
      const next = (indexRef.current + 1) % BANNERS.length;
      scrollToIndex(next);
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [scrollToIndex]);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={() => { isUserScrolling.current = true; }}
        onMomentumScrollEnd={(e) => { isUserScrolling.current = false; handleScroll(e); }}
        snapToInterval={BANNER_WIDTH + 12}
        decelerationRate="fast"
        style={{ width: '100%' }}
        contentContainerStyle={styles.scrollContent}
      >
        {BANNERS.map((src, i) => (
          <TouchableOpacity key={i} activeOpacity={0.95}>
            <Image
              source={src}
              style={[styles.bannerImage, { width: BANNER_WIDTH }]}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {BANNERS.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper:       { paddingHorizontal: 20, width: '100%', overflow: 'hidden' },
  scrollContent: { gap: 12 },

  bannerImage: {
    height: 185,
    borderRadius: 16,
  },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot:       { width: 6,  height: 6,  borderRadius: 3, backgroundColor: '#D1D5DB' },
  dotActive: { width: 20, height: 6,  borderRadius: 3, backgroundColor: '#2E7D32' },
});