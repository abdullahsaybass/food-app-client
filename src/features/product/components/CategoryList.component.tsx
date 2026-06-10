import React from 'react';
import {
  ScrollView, TouchableOpacity, Text,
  StyleSheet, View, Image,
} from 'react-native';
import all    from '@/assets/images/all.png';
import frozen from '@/assets/images/frozen.png';
import nuts   from '@/assets/images/nuts.png';
import powder from '@/assets/images/powder.png';
import seed   from '@/assets/images/seeds.png';
import dal    from '@/assets/images/dal.png';
const PRIMARY = '#2E7D32';

export interface StaticCategory {
  id:    string;
  name:  string;
  bg:    string;
  image: any;
}

export const STATIC_CATEGORIES: StaticCategory[] = [
  { id: 'all',    name: 'All',    bg: '#E8F5E9', image: seed    },
   { id: 'dal',    name: 'Dal',    bg: '#E8F5E9', image: dal    },
  { id: 'frozen', name: 'Frozen', bg: '#E3F2FD', image: frozen },
  { id: 'nuts',   name: 'Nuts',   bg: '#FFF3E0', image: nuts   },
  { id: 'seeds',  name: 'Seeds',  bg: '#F3E5F5', image: seed   },
  { id: 'powder', name: 'Powder', bg: '#FCE4EC', image: powder },
];

const CIRCLE = 64;

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

export const CategoryList: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {STATIC_CATEGORIES.map((cat) => {
        const isSelected = cat.id === selected;
        return (
          <TouchableOpacity
            key={cat.id}
            style={styles.item}
            onPress={() => onSelect(cat.id)}
            activeOpacity={0.75}
          >
            <View
              style={[
                styles.circle,
                { backgroundColor: cat.bg },
                isSelected && styles.circleActive,
              ]}
            >
              <Image
                source={cat.image}
                style={styles.categoryImage}
                resizeMode="contain"
              />
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
    paddingVertical: 4,
    gap: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  item:   { alignItems: 'center', gap: 7, width: 68 },
  circle: {
    width: CIRCLE, height: CIRCLE,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: 'transparent',
  },
  circleActive:  { borderColor: PRIMARY },
  categoryImage: { width: 72, height: 72 },
  label:         { fontSize: 11, fontWeight: '500', color: '#555', textAlign: 'center', lineHeight: 15 },
  labelActive:   { color: PRIMARY, fontWeight: '700' },
});