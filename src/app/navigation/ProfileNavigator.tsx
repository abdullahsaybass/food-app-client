import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen }     from '../../features/profile/screen/Profile.screen';
import { EditProfileScreen } from '../../features/profile/screen/EditProfile.screen';
import { SettingsScreen }    from '../../features/profile/screen/Settings.screen';
import type { ProfileStackParamList } from './/navigation.types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileHome" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Settings"    component={SettingsScreen} />
  </Stack.Navigator>
);