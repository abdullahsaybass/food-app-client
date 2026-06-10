import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography } from '../../../theme';
import { changePasswordApi } from '../api/user.api';
import type { RootStackParamList } from '../../../app/navigation/navigation.types';

type Props = NativeStackScreenProps<RootStackParamList, 'ChangePassword'>;

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconArrowLeft = ({ color = '#333', size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconLock = ({ color = '#AAAAAA', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={11} width={18} height={11} rx={2} ry={2} stroke={color} strokeWidth={1.8} />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconEye = ({ color = '#AAAAAA', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" stroke={color} strokeWidth={1.8} />
  </Svg>
);

const IconEyeOff = ({ color = '#AAAAAA', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M1 1l22 22" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

// ─── Input ────────────────────────────────────────────────────────────────────
const PasswordInput = ({
  label, value, onChangeText, placeholder,
}: {
  label: string; value: string;
  onChangeText: (v: string) => void; placeholder?: string;
}) => {
  const [show, setShow] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <View style={styles.inputIcon}><IconLock /></View>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#C0C0C0"
          secureTextEntry={!show}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShow(p => !p)} style={styles.eyeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          {show ? <IconEyeOff /> : <IconEye />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────
export const ChangePasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [current,  setCurrent]  = useState('');
  const [next,     setNext]     = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!current || !next || !confirm) {
      Alert.alert('Missing Fields', 'Please fill in all fields.'); return;
    }
    if (next.length < 6) {
      Alert.alert('Too Short', 'New password must be at least 6 characters.'); return;
    }
    if (next !== confirm) {
      Alert.alert('Mismatch', 'New passwords do not match.'); return;
    }
    setLoading(true);
    try {
      await changePasswordApi({ currentPassword: current, newPassword: next });
      Alert.alert('Success', 'Password changed successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  }, [current, next, confirm]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.topBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconArrowLeft color={Colors.textPrimary} size={22} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Change Password</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.body}>
        <Text style={styles.subtitle}>
          Enter your current password and choose a new one.
        </Text>

        <PasswordInput
          label="Current Password"
          value={current}
          onChangeText={setCurrent}
          placeholder="Enter current password"
        />
        <PasswordInput
          label="New Password"
          value={next}
          onChangeText={setNext}
          placeholder="Enter new password"
        />
        <PasswordInput
          label="Confirm New Password"
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Re-enter new password"
        />

        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={styles.submitText}>Update Password</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  topBtn:   { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  topTitle: { ...Typography.headingMedium, color: Colors.textPrimary },

  body:     { flex: 1, paddingHorizontal: 20, paddingTop: 28 },
  subtitle: { ...Typography.bodyMedium, color: Colors.textSecondary, marginBottom: 28, lineHeight: 22 },

  fieldWrap:  { marginBottom: 16 },
  fieldLabel: { ...Typography.labelLarge, color: Colors.textPrimary, marginBottom: 8 },

  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.2, borderColor: '#EBEBEB',
    borderRadius: 12, paddingHorizontal: 14,
    height: 52, backgroundColor: '#FAFAFA',
  },
  inputIcon: { marginRight: 10 },
  input:     { flex: 1, ...Typography.bodyMedium, color: Colors.textPrimary, paddingVertical: 0 },
  eyeBtn:    { paddingLeft: 8 },

  submitBtn: {
    height: 52, borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 12,
  },
  submitText: { ...Typography.labelLarge, color: '#FFFFFF', fontSize: 15 },
});