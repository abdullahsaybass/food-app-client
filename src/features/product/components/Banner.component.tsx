import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Image, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import banner1 from '@/assets/images/banner1.png';
import banner2 from '@/assets/images/banner2.png';
import banner3 from '@/assets/images/banner3.png';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 40;

const BANNERS = [banner1, banner2, banner3];

export const BannerCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (BANNER_WIDTH + 12));
    setActiveIndex(idx);
  };

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        snapToInterval={BANNER_WIDTH + 12}
        decelerationRate="fast"
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
  scrollContent: { paddingHorizontal: 20, gap: 12 },

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