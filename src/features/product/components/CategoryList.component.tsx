import React from 'react';
import {
  ScrollView, TouchableOpacity, Text,
  StyleSheet, View, Image,
} from 'react-native';
import type { Category } from '../types/product.types';

const PRIMARY = '#2E7D32';
const CIRCLE  = 64;

import all    from '@/assets/images/all.png';
import frozen from '@/assets/images/frozen.png';
import nuts   from '@/assets/images/nuts.png';
import powder from '@/assets/images/powder.png';
import seed   from '@/assets/images/seeds.png';
import dal    from '@/assets/images/dal.png';

const FALLBACK_IMAGES: Record<string, any> = {
  all:    all,
  frozen: frozen,
  nuts:   nuts,
  seeds:  seed,
  dal:    dal,
  powder: powder,
};

export interface StaticCategory {
  id:      string;
  name:    string;
  bg:      string;
  image:   any;
  color?:  string;
  banner?: string;
}

export const STATIC_CATEGORIES: StaticCategory[] = [
  { id: 'all',    name: 'All',    bg: '#E8F5E9', image: all    },
  { id: 'dal',    name: 'Dal',    bg: '#E8F5E9', image: dal    },
  { id: 'frozen', name: 'Frozen', bg: '#E3F2FD', image: frozen },
  { id: 'nuts',   name: 'Nuts',   bg: '#FFF3E0', image: nuts   },
  { id: 'seeds',  name: 'Seeds',  bg: '#F3E5F5', image: seed   },
  { id: 'powder', name: 'Powder', bg: '#FCE4EC', image: powder },
];

const BG_COLORS: Record<string, string> = {
  all:    '#E8F5E9',
  dal:    '#E8F5E9',
  frozen: '#E3F2FD',
  nuts:   '#FFF3E0',
  seeds:  '#F3E5F5',
  powder: '#FCE4EC',
};
const DEFAULT_BG = '#F0F0F0';

interface Props {
  selected:    string;
  onSelect:    (id: string) => void;
  categories?: Category[];
}

export const CategoryList: React.FC<Props> = ({ selected, onSelect, categories }) => {
  const items = categories && categories.length > 0 ? categories : STATIC_CATEGORIES;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ width: '100%' }}
      contentContainerStyle={styles.container}
    >
      {items.map((cat) => {
        const isSelected = cat.id === selected;
        const bg = (cat as any).bg ?? BG_COLORS[cat.id] ?? DEFAULT_BG;

        return (
          <TouchableOpacity
            key={cat.id}
            style={styles.item}
            onPress={() => onSelect(cat.id)}
            activeOpacity={0.75}
          >
            <View style={[
              styles.circle,
              { backgroundColor: cat.color ? cat.color + '22' : bg },
              isSelected && styles.circleActive,
            ]}>
              {cat.image && typeof cat.image === 'string' && cat.image.startsWith('http') ? (
                <Image
                  source={{ uri: cat.image }}
                  style={styles.categoryImage}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={FALLBACK_IMAGES[cat.id] ?? FALLBACK_IMAGES.all}
                  style={styles.categoryImage}
                  resizeMode="contain"
                />
              )}
            </View>
            <Text style={[styles.label, isSelected && styles.labelActive]} numberOfLines={2}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical:   4,
    gap:               14,
    flexDirection:     'row',
    alignItems:        'flex-start',
  },
  item:   { alignItems: 'center', gap: 7, width: 68 },
  circle: {
    width:          CIRCLE,
    height:         CIRCLE,
    borderRadius:   16,
    alignItems:     'center',
    justifyContent: 'center',
    borderWidth:    2.5,
    borderColor:    'transparent',
    overflow:       'hidden',   // FIX: clip image inside circle
  },
  circleActive:  { borderColor: PRIMARY },
  // FIX: image fits inside the circle properly
  categoryImage: { width: CIRCLE, height: CIRCLE },
  label:         { fontSize: 11, fontWeight: '500', color: '#555', textAlign: 'center', lineHeight: 15 },
  labelActive:   { color: PRIMARY, fontWeight: '700' },
});