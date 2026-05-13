import React, { useReducer, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../../../theme';
import { AuthField, AuthButton } from '../components/AuthForm.component';
import type { AuthScreenProps } from '../../../app/navigation/navigation.types';
import { authService } from '../services/auth.service';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'email' | 'success';

interface State {
  email: string;
  emailError: string;
  loading: boolean;
  step: Step;
}

type Action =
  | { type: 'SET_EMAIL'; value: string }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; value: boolean }
  | { type: 'SET_STEP'; step: Step };

const init: State = { email: '', emailError: '', loading: false, step: 'email' };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'SET_EMAIL':   return { ...s, email: a.value };
    case 'SET_ERROR':   return { ...s, emailError: a.error };
    case 'CLEAR_ERROR': return { ...s, emailError: '' };
    case 'SET_LOADING': return { ...s, loading: a.value };
    case 'SET_STEP':    return { ...s, step: a.step };
    default:            return s;
  }
}

// ─── Screen ───────────────────────────────────────────────────────────────────

type Props = AuthScreenProps<'ForgotPassword'>;

const ForgotPasswordScreen = ({ navigation }: Props) => {
  const [state, dispatch] = useReducer(reducer, init);
  const successOpacity = useRef(new Animated.Value(0)).current;
  const successScale   = useRef(new Animated.Value(0.8)).current;

  const validate = useCallback((): boolean => {
    if (!state.email.trim()) {
      dispatch({ type: 'SET_ERROR', error: 'Email address is required' });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
      dispatch({ type: 'SET_ERROR', error: 'Enter a valid email address' });
      return false;
    }
    return true;
  }, [state.email]);

  const handleSend = useCallback(async () => {
    if (!validate()) return;

    dispatch({ type: 'SET_LOADING', value: true });

    try {
      await authService.forgotPassword(state.email);

      dispatch({ type: 'SET_STEP', step: 'success' });

      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

    } catch (err: any) {
      dispatch({
        type: 'SET_ERROR',
        error: err?.response?.data?.message || 'Something went wrong',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }, [validate]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.navy} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Navy top strip ── */}
        <View style={styles.topStrip}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>🔑</Text>
          </View>

          <Text style={styles.stripTitle}>Forgot Password?</Text>
          <Text style={styles.stripSub}>
            {state.step === 'email'
              ? "No worries, we'll send you reset instructions"
              : 'Check your email for the reset link'}
          </Text>
        </View>

        {/* ── White card ── */}
        <View style={styles.card}>
          {state.step === 'email' ? (

            // ── Email input step ──
            <>
              <Text style={styles.cardTitle}>Reset Password</Text>
              <Text style={styles.cardSubtitle}>
                Enter the email address linked to your FreshMart account.
              </Text>

              <AuthField
                label="Email Address"
                placeholder="you@example.com"
                value={state.email}
                onChangeText={(v: string) => {
                  dispatch({ type: 'SET_EMAIL', value: v });
                  dispatch({ type: 'CLEAR_ERROR' });
                }}
                error={state.emailError}
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="done"
                onSubmitEditing={handleSend}
                autoFocus
              />

              <View style={styles.infoBox}>
                <Text style={styles.infoIcon}>ℹ️</Text>
                <Text style={styles.infoText}>
                  We'll send a secure link to this email. Link expires in 15 minutes.
                </Text>
              </View>

              <AuthButton
                label="Send Reset Link"
                onPress={handleSend}
                loading={state.loading}
              />

              <TouchableOpacity
                style={styles.backToLogin}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.backToLoginText}>← Back to Sign In</Text>
              </TouchableOpacity>
            </>

          ) : (

            // ── Success step ──
            <Animated.View
              style={[
                styles.successContainer,
                { opacity: successOpacity, transform: [{ scale: successScale }] },
              ]}
            >
              <View style={styles.successIconWrap}>
                <Text style={styles.successIcon}>✉️</Text>
              </View>

              <Text style={styles.successTitle}>Email Sent!</Text>
              <Text style={styles.successBody}>
                We've sent a password reset link to{'\n'}
                <Text style={styles.successEmail}>{state.email}</Text>
              </Text>

              {['Check your email inbox', 'Click the reset link', 'Create a new password'].map(
                (step, i) => (
                  <View key={step} style={styles.stepRow}>
                    <View style={styles.stepNum}>
                      <Text style={styles.stepNumText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ),
              )}

              {/* ✅ alignSelf stretch fixes left/right width inside alignItems:center parent */}
              <AuthButton
                label="Open Email App"
                onPress={() => {
                  // TODO: Linking.openURL('mailto:')
                }}
                style={{ paddingHorizontal: 40 }}
                labelStyle={{ fontSize: 14 }}
              />

              <TouchableOpacity
                style={styles.resendRow}
                onPress={() => dispatch({ type: 'SET_STEP', step: 'email' })}
              >
                <Text style={styles.resendText}>
                  Didn't receive it?{' '}
                  <Text style={styles.resendLink}>Resend email</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backToLogin}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.backToLoginText}>← Back to Sign In</Text>
              </TouchableOpacity>
            </Animated.View>

          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen; // ✅ default export — import without curly braces

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.navy },
  flex: { flex: 1 },

  // Navy strip
  topStrip: {
    backgroundColor: Colors.navy,
    paddingTop: 16,
    paddingBottom: 52,
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { color: Colors.white, fontSize: 20 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  iconEmoji: { fontSize: 36 },
  stripTitle: { ...Typography.headingLarge, color: Colors.white },
  stripSub: {
    ...Typography.bodyMedium,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    paddingHorizontal: 24,
  },

  // White card
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  cardTitle: { ...Typography.headingLarge, color: Colors.textPrimary, marginBottom: 6 },
  cardSubtitle: { ...Typography.bodyMedium, color: Colors.textSecondary, marginBottom: 28 },

  // Info box
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.primarySurface,
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: 20,
    gap: 10,
    alignItems: 'flex-start',
  },
  infoIcon: { fontSize: 16 },
  infoText: { ...Typography.bodySmall, color: Colors.primary, flex: 1, lineHeight: 18 },

  backToLogin: { alignItems: 'center', marginTop: 20 },
  backToLoginText: { ...Typography.bodyMedium, color: Colors.textSecondary, fontWeight: '600' },

  // Success state
  successContainer: { alignItems: 'center', paddingTop: 8 },
  successIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successIcon: { fontSize: 44 },
  successTitle: { ...Typography.headingLarge, color: Colors.textPrimary, marginBottom: 10 },
  successBody: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  successEmail: { color: Colors.primary, fontWeight: '700' },

  // Steps
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 14,
    marginBottom: 14,
    backgroundColor: Colors.grey100,
    borderRadius: Radius.md,
    padding: 14,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { ...Typography.bodySmall, color: Colors.white, fontWeight: '700' },
  stepText: { ...Typography.bodyMedium, color: Colors.textPrimary, flex: 1 },

  resendRow: { marginTop: 16, marginBottom: 4 },
  resendText: { ...Typography.bodyMedium, color: Colors.textSecondary, textAlign: 'center' },
  resendLink: { color: Colors.primary, fontWeight: '700' },
});