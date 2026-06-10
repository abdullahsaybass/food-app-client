// hooks/useRingNavigate.ts
import { useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';

const RING_DURATION = 1000;

export const useRingNavigate = (onComplete: () => void) => {
  const [active, setActive]   = useState(false);
  const progress              = useRef(new Animated.Value(0)).current;
  const animRef               = useRef<Animated.CompositeAnimation | null>(null);

  const cancel = () => {
    animRef.current?.stop();
    progress.setValue(0);
    setActive(false);
  };

  const start = () => {
    if (active) { cancel(); return; }
    setActive(true);
    progress.setValue(0);
    const anim = Animated.timing(progress, {
      toValue:  1,
      duration: RING_DURATION,
      easing:   Easing.linear,
      useNativeDriver: false,
    });
    animRef.current = anim;
    anim.start(({ finished }) => {
      if (finished) {
        progress.setValue(0);
        setActive(false);
        onComplete();
      }
    });
  };

  return { active, progress, start, cancel };
};