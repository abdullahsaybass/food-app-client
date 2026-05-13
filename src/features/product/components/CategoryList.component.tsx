import React from 'react';
import {
  ScrollView, TouchableOpacity, Text,
  StyleSheet, View, Image,
} from 'react-native';
import { Colors, Typography } from '../../../theme';
import type { Category } from '../types/product.types';

const CIRCLE = 62;

interface Props {
  categories: Category[];
  selected: string;
  onSelect: (id: string) => void;
}

export const CategoryList: React.FC<Props> = ({ categories, selected, onSelect }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.container}
  >
    {categories.map((cat, index) => {
      const isSelected = cat.id === selected;
      return (
        <TouchableOpacity
          key={cat.id ?? String(index)}
          style={styles.item}
          onPress={() => onSelect(cat.id)}
          activeOpacity={0.75}
        >
          <View style={[styles.circle, isSelected && styles.circleActive]}>
            <Image
              source={{ uri: cat.image }}
              style={styles.circleImage}
              resizeMode="cover"
            />
          </View>
          <Text
            style={[styles.label, isSelected && styles.labelActive]}
            numberOfLines={1}
          >
            {cat.name}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    gap: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  item: { alignItems: 'center', gap: 6, width: 68 },
  circle: {
    width: CIRCLE, height: CIRCLE,
    borderRadius: CIRCLE / 2,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    borderWidth: 2.5,
    borderColor: 'transparent',
  },
  circleActive: { borderColor: Colors.primary },
  circleImage: { width: '100%', height: '100%' },
  label: { fontSize: 12, fontWeight: '500', color: '#555', textAlign: 'center' },
  labelActive: { color: Colors.primary, fontWeight: '700' },
});