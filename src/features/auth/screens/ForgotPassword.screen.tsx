import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  StatusBar, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography } from '../../../theme';
import { forgotPasswordApi } from '../../auth/api/auth.api';
import type { ProfileStackParamList } from '../../../app/navigation/navigation.types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ForgotPassword'>;

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconArrowLeft = ({ color = '#333', size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconMail = ({ color = '#AAAAAA', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 6l-10 7L2 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconMailBig = ({ color = Colors.primary, size = 52 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 6l-10 7L2 6" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconCheck = ({ color = Colors.primary, size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Screen ───────────────────────────────────────────────────────────────────
export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const isValidEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleSend = useCallback(async () => {
    if (!email.trim()) {
      Alert.alert('Required', 'Please enter your email address.'); return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.'); return;
    }
    setLoading(true);
    try {
      await forgotPasswordApi(email.trim());
      setSent(true);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email]);

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
        <Text style={styles.topTitle}>Forgot Password</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Sent state ── */}
        {sent ? (
          <View style={styles.sentWrap}>
            <View style={styles.sentIconOuter}>
              <View style={styles.sentIconInner}>
                <IconMailBig />
              </View>
              <View style={styles.checkBadge}>
                <IconCheck size={14} color="#FFFFFF" />
              </View>
            </View>

            <Text style={styles.sentTitle}>Email Sent!</Text>
            <Text style={styles.sentBody}>
              We've sent a password reset link to
            </Text>
            <Text style={styles.sentEmail}>{email}</Text>
            <Text style={styles.sentHint}>
              Check your inbox and follow the link to reset your password. It may take a minute to arrive.
            </Text>

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.85}
            >
              <Text style={styles.backBtnText}>Back to Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendBtn}
              onPress={() => { setSent(false); }}
              activeOpacity={0.7}
            >
              <Text style={styles.resendText}>Didn't receive it?{' '}
                <Text style={styles.resendLink}>Resend</Text>
              </Text>
            </TouchableOpacity>
          </View>

        ) : (

          /* ── Input state ── */
          <View style={styles.body}>
            <View style={styles.illustrationWrap}>
              <View style={styles.illustrationCircle}>
                <IconMailBig size={48} />
              </View>
            </View>

            <Text style={styles.heading}>Reset your password</Text>
            <Text style={styles.subtitle}>
              Enter the email address linked to your account and we'll send you a link to reset your password.
            </Text>

            <Text style={styles.fieldLabel}>Email Address</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputIcon}><IconMail /></View>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#C0C0C0"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, (!email.trim() || loading) && styles.submitBtnDisabled]}
              onPress={handleSend}
              disabled={!email.trim() || loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.submitText}>Send Reset Link</Text>
              }
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
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

  // Input state
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 32 },

  illustrationWrap:   { alignItems: 'center', marginBottom: 28 },
  illustrationCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.primarySurface ?? '#EDF7ED',
    alignItems: 'center', justifyContent: 'center',
  },

  heading:    { ...Typography.headingMedium, color: Colors.textPrimary, marginBottom: 10 },
  subtitle:   { ...Typography.bodyMedium, color: Colors.textSecondary, lineHeight: 22, marginBottom: 28 },
  fieldLabel: { ...Typography.labelLarge, color: Colors.textPrimary, marginBottom: 8 },

  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.2, borderColor: '#EBEBEB',
    borderRadius: 12, paddingHorizontal: 14,
    height: 52, backgroundColor: '#FAFAFA', marginBottom: 24,
  },
  inputIcon: { marginRight: 10 },
  input:     { flex: 1, ...Typography.bodyMedium, color: Colors.textPrimary, paddingVertical: 0 },

  submitBtn: {
    height: 52, borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { ...Typography.labelLarge, color: '#FFFFFF', fontSize: 15 },

  // Sent state
  sentWrap: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 52 },

  sentIconOuter: { marginBottom: 28 },
  sentIconInner: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.primarySurface ?? '#EDF7ED',
    alignItems: 'center', justifyContent: 'center',
  },
  checkBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
  },

  sentTitle: { ...Typography.headingMedium, color: Colors.textPrimary, marginBottom: 10 },
  sentBody:  { ...Typography.bodyMedium, color: Colors.textSecondary, textAlign: 'center' },
  sentEmail: { ...Typography.labelLarge, color: Colors.textPrimary, marginTop: 4, marginBottom: 16, textAlign: 'center' },
  sentHint:  { ...Typography.bodySmall, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 36 },

  backBtn: {
    width: '100%', height: 52, borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  backBtnText: { ...Typography.labelLarge, color: '#FFFFFF', fontSize: 15 },

  resendBtn:  { paddingVertical: 8 },
  resendText: { ...Typography.bodyMedium, color: Colors.textSecondary },
  resendLink: { color: Colors.primary, fontWeight: '600' },
});