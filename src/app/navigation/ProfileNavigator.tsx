import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen }     from '../../features/profile/screen/Profile.screen';
import { EditProfileScreen } from '../../features/profile/screen/EditProfile.screen';
import { SettingsScreen }    from '../../features/profile/screen/Settings.screen';
import { SelectAddressScreen } from '../../features/profile/screen/Selectaddressscreen';
import { AddAddressScreen } from '../../features/profile/screen/Addaddressscreen';
// import { OrderHistoryScreen } from '../../features/profile/screen/OrderHistory.screen';
// import type { ProfileStackParamList } from './navigation.types';
import type { RootStackParamList } from './navigation.types';
import { CartScreen } from '../../features/product/screens/Cart.screen'; // adjust path
import { ForgotPasswordScreen } from '@/src/features/auth/screens/ForgotPassword.screen';
import { ChangePasswordScreen } from '@/src/features/profile/screen/Changepassword.screen';
import {StaticContentScreen } from '../../features/profile/screen/Staticcontentscreen';

// const Stack = createNativeStackNavigator<ProfileStackParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
export const ProfileNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileHome" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Settings"    component={SettingsScreen} />
    <Stack.Screen
  name="SelectAddress"
  component={SelectAddressScreen}
 
/>

<Stack.Screen
  name="AddAddress"
  component={AddAddressScreen}
/>
<Stack.Screen name="StaticContent" component={StaticContentScreen} />
<Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
<Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
{/* <Stack.Screen
  name="OrderHistory"
  component={OrderHistoryScreen}
/> */}
  </Stack.Navigator>
);