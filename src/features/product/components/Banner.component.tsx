import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Image, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { Colors, Typography, Radius } from '../../../theme';
import type { Banner } from '../types/product.types';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 40;

interface Props { banners: Banner[] }

export const BannerCarousel: React.FC<Props> = ({ banners }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (BANNER_WIDTH + 12));
    setActiveIndex(idx);
  };

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        snapToInterval={BANNER_WIDTH + 12}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
      >
        {banners.map((banner) => (
          <TouchableOpacity
            key={banner.id}
            activeOpacity={0.95}
            style={[styles.banner, { backgroundColor: banner.backgroundColor, width: BANNER_WIDTH }]}
          >
            <View style={styles.textSide}>
              <Text style={styles.discountLabel}>{banner.discount} Discount</Text>
              <Text style={styles.title}>{banner.title}</Text>
              <Text style={styles.subtitle}>{banner.subtitle}</Text>
              <View style={styles.shopBtn}>
                <Text style={styles.shopBtnText}>Shop Now</Text>
              </View>
            </View>
            <View style={styles.imageSide}>
              <Image
                source={{ uri: banner.image }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {banners.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, gap: 12 },
  banner: {
    borderRadius: Radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    overflow: 'hidden',
    height: 190,
  },
  textSide: { flex: 1, paddingVertical: 28, gap: 4 },
  discountLabel: { ...Typography.labelSmall, color: Colors.primary, marginBottom: 2 },
  title: { ...Typography.headingLarge, color: Colors.textPrimary, marginBottom: 2 },
  subtitle: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: 10, lineHeight: 18 },
  shopBtn: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: 18, paddingVertical: 9,
    borderRadius: Radius.full,
  },
  shopBtnText: { ...Typography.bodyMedium, color: Colors.white, fontWeight: '700' },
  imageSide: { width: 130, height: '100%' },
  bannerImage: { width: '100%', height: '100%' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  dot:       { width: 6,  height: 6,  borderRadius: 3, backgroundColor: Colors.border },
  dotActive: { width: 20, height: 6,  borderRadius: 3, backgroundColor: Colors.primary },
});