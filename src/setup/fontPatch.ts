import { Text, TextInput, Platform } from 'react-native';

const FONT = Platform.select({
  ios: 'Helvetica Neue',
  android: 'sans-serif',
  default: 'sans-serif',
});

// Override render so fontFamily is always injected,
// even when the component has its own style prop.
const patchComponent = (Component: any) => {
  const oldRender = Component.render;
  Component.render = function (...args: any[]) {
    const origin = oldRender.call(this, ...args);
    if (!origin) return origin;
    const existingStyle = origin.props.style;
    const newStyle = Array.isArray(existingStyle)
      ? [{ fontFamily: FONT }, ...existingStyle]
      : [{ fontFamily: FONT }, existingStyle];
    return { ...origin, props: { ...origin.props, style: newStyle } };
  };
};

patchComponent(Text);
patchComponent(TextInput);