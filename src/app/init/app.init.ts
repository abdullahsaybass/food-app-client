import { useAuthStore }    from '../../features/auth/store/auth.store';
import { useProductStore } from '../../features/product/store/product.store';
import { notificationApi } from '../../features/notification/api/notification.api';
import { loadGuestCart }   from '../../features/product/store/product.store';
import { Platform }        from 'react-native';
import Constants           from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';

const registerDeviceToken = async () => {
  // The static import of expo-notifications itself crashes Expo Go (SDK 53+).
  // Use dynamic require so the native module is never loaded in Expo Go.
  if (isExpoGo) return;
  try {
    const Notifications = require('expo-notifications');
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return;

    const { data: token } = await Notifications.getExpoPushTokenAsync();
    const platform = Platform.OS === 'ios' ? 'ios' : 'android';
    await notificationApi.registerDeviceToken(token, platform);
    console.log('Device token registered');
  } catch (err) {
    console.log('Device token registration failed:', err);
  }
};

export const initAuth = async () => {
  try {
    console.log('Starting hydrate...');

    await useAuthStore.getState().hydrate();

    console.log('Hydrate success');

    const { isAuthenticated } = useAuthStore.getState();

    if (isAuthenticated) {
      // Logged-in: fetch server cart + register device token
      await useProductStore.getState().fetchCart();
      console.log('Cart fetched');
      registerDeviceToken(); // fire-and-forget
    } else {
      // Guest: hydrate local cart from AsyncStorage
      const guestItems = await loadGuestCart();
      if (guestItems.length > 0) {
        await useProductStore.getState().hydrateGuestCart();
        console.log('Guest cart hydrated');
      }
    }
  } catch (error) {
    console.log('Hydrate error:', error);
  }
};