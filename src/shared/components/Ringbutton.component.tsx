// components/RingButton.component.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { useRingNavigate } from '../hooks/usernavigate';

const RING_SIZE = 20;

interface RingButtonProps {
  label: string;
  onComplete: () => void;
  icon?: React.ReactNode;
  variant?: 'outline' | 'solid';
  color?: string;
  style?: any;
  textStyle?: any;
}

export const RingButton: React.FC<RingButtonProps> = ({
  label,
  onComplete,
  icon,
  variant = 'solid',
  color   = '#2E7D32',
  style,
  textStyle,
}) => {
  const { active, progress, start } = useRingNavigate(onComplete);

  const rotation = progress.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      onPress={start}
      activeOpacity={0.85}
      style={[
        styles.btn,
        isOutline
          ? [styles.outline, { borderColor: color }]
          : [styles.solid,   { backgroundColor: color }],
        style,
      ]}
    >
      {active && (
        <View style={styles.ringWrap} pointerEvents="none">
          <View style={[styles.ringTrack, {
            width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2,
            borderColor: isOutline ? `${color}33` : 'rgba(255,255,255,0.3)',
          }]} />
          <Animated.View
            style={[
              styles.ringArcWrapper,
              { width: RING_SIZE, height: RING_SIZE },
              { transform: [{ rotate: rotation }] },
            ]}
          >
            <View style={[
              styles.ringArc,
              {
                width: RING_SIZE, height: RING_SIZE / 2,
                borderTopLeftRadius:  RING_SIZE / 2,
                borderTopRightRadius: RING_SIZE / 2,
                borderColor: isOutline ? color : '#fff',
              },
            ]} />
          </Animated.View>
        </View>
      )}

      {!active && icon && <View style={styles.icon}>{icon}</View>}
      {!active && (
        <Text style={[
          styles.label,
          { color: isOutline ? color : '#fff' },
          textStyle,
        ]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    height:            50,
    borderRadius:      10,
    paddingHorizontal: 20,
    overflow: 'visible',
    position:          'relative',
  },
  solid:   {},
  outline: { borderWidth: 1.5, backgroundColor: 'transparent' },
  icon:    { marginRight: 8 },
  label:   { fontSize: 14, fontWeight: '700' },

 ringWrap: {
    position:       'absolute',
    top:            0,
    left:           0,
    right:          0,
    bottom:         0,
    alignItems:     'center',
    justifyContent: 'center',
  },
  ringTrack: {
    position:    'absolute',
    borderWidth: 2.5,
  },
  ringArcWrapper: {
    position: 'absolute',
    overflow: 'hidden',
  },
  ringArc: {
    position:          'absolute',
    top:               0,
    borderWidth:       2.5,
    borderBottomWidth: 0,
  },
});