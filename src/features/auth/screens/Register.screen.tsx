import React, { useCallback, useReducer } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing } from '../../../theme';
import { AuthField, PasswordField, AuthButton } from '../components/AuthForm.component';
import type { AuthStackParamList } from '../../../app/navigation/navigation.types';
import { authService } from '../services/auth.service';
// ─── State ────────────────────────────────────────────────────────────────────

interface State {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  errors: Partial<Record<'fullName'|'email'|'phone'|'password'|'confirmPassword', string>>;
  loading: boolean;
}
type Action =
  | { type: 'SET'; field: keyof Omit<State,'errors'|'loading'>; value: string }
  | { type: 'SET_ERRORS'; errors: State['errors'] }
  | { type: 'CLEAR_ERROR'; field: string }
  | { type: 'SET_LOADING'; value: boolean };

const init: State = {
  fullName: '', email: '', phone: '', password: '', confirmPassword: '',
  errors: {}, loading: false,
};

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'SET':         return { ...s, [a.field]: a.value };
    case 'SET_ERRORS':  return { ...s, errors: a.errors };
    case 'CLEAR_ERROR': { const e = { ...s.errors }; delete e[a.field as keyof typeof e]; return { ...s, errors: e }; }
    case 'SET_LOADING': return { ...s, loading: a.value };
    default:            return s;
  }
}

// ─── Screen ──────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [state, dispatch] = useReducer(reducer, init);

  const set = (field: keyof Omit<State,'errors'|'loading'>) => (value: string) => {
    dispatch({ type: 'SET', field, value });
    dispatch({ type: 'CLEAR_ERROR', field });
  };

  const validate = useCallback((): boolean => {
    const errors: State['errors'] = {};

    if (!state.fullName.trim() || state.fullName.trim().length < 2)
      errors.fullName = 'Enter your full name';

    if (!state.email.trim())
      errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email))
      errors.email = 'Enter a valid email';

    if (state.phone && !/^\+?[0-9]{7,15}$/.test(state.phone.replace(/\s/g, '')))
      errors.phone = 'Enter a valid phone number';

    if (!state.password)
      errors.password = 'Password is required';
    else if (state.password.length < 8)
      errors.password = 'Minimum 8 characters';
    else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(state.password))
      errors.password = 'Add at least 1 uppercase & 1 number';

    if (!state.confirmPassword)
      errors.confirmPassword = 'Please confirm your password';
    else if (state.password !== state.confirmPassword)
      errors.confirmPassword = 'Passwords do not match';

    dispatch({ type: 'SET_ERRORS', errors });
    return Object.keys(errors).length === 0;
  }, [state]);

  const handleRegister = useCallback(async () => {
  if (!validate()) return;

  dispatch({ type: 'SET_LOADING', value: true });

  try {
    await authService.register({
      name: state.fullName,
      email: state.email,
      phone: state.phone,
      password: state.password,
    });

    alert("Registration successful! Please login.");

    navigation.navigate('Login');

  } catch (err: any) {
    console.log('Register error:', err?.response?.data || err.message);
  } finally {
    dispatch({ type: 'SET_LOADING', value: false });
  }
}, [validate]);

  // Step indicator — 3 steps: Account → Verify → Done
  const steps = ['Account', 'Verify', 'Done'];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Navy top strip with back button ── */}
          <View style={styles.topStrip}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>

            <View style={styles.logoMini}>
              <Text style={styles.logoMiniEmoji}>🛒</Text>
            </View>
            <Text style={styles.brandName}>Create Account</Text>
            <Text style={styles.brandSub}>Join FreshMart today</Text>
          </View>

          {/* ── White card ── */}
          <View style={styles.card}>
            {/* Step indicator */}
            <View style={styles.stepRow}>
              {steps.map((label, i) => (
                <React.Fragment key={label}>
                  <View style={styles.stepItem}>
                    <View style={[styles.stepDot, i === 0 && styles.stepDotActive]}>
                      <Text style={[styles.stepNum, i === 0 && styles.stepNumActive]}>
                        {i + 1}
                      </Text>
                    </View>
                    <Text style={[styles.stepLabel, i === 0 && styles.stepLabelActive]}>
                      {label}
                    </Text>
                  </View>
                  {i < steps.length - 1 && (
                    <View style={[styles.stepLine, i === 0 && styles.stepLineActive]} />
                  )}
                </React.Fragment>
              ))}
            </View>

            <AuthField
              label="Full Name"
              placeholder="John Doe"
              value={state.fullName}
              onChangeText={set('fullName')}
              error={state.errors.fullName}
              autoComplete="name"
              textContentType="name"
              autoCapitalize="words"
              returnKeyType="next"
            />

            <AuthField
              label="Email Address"
              placeholder="you@example.com"
              value={state.email}
              onChangeText={set('email')}
              error={state.errors.email}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
            />

            <AuthField
              label="Phone Number (optional)"
              placeholder="+91 98765 43210"
              value={state.phone}
              onChangeText={set('phone')}
              error={state.errors.phone}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              returnKeyType="next"
            />

            <PasswordField
              label="Password"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              value={state.password}
              onChangeText={set('password')}
              error={state.errors.password}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
            />

            <PasswordField
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={state.confirmPassword}
              onChangeText={set('confirmPassword')}
              error={state.errors.confirmPassword}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />

            {/* Terms */}
            <Text style={styles.terms}>
              By signing up you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>

            <AuthButton
              label="Create Account"
              onPress={handleRegister}
              loading={state.loading}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.background },
  flex:   { flex: 1 },
  scroll: { flexGrow: 1 },

  topStrip: {
    backgroundColor: Colors.navy,
    paddingTop: 24,
    paddingBottom: 52,
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    position: 'absolute',
    top: 24,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: Colors.white, fontSize: 20, lineHeight: 24 },
  logoMini: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoMiniEmoji: { fontSize: 28 },
  brandName: { ...Typography.headingMedium, color: Colors.white },
  brandSub:  { ...Typography.bodyMedium,   color: 'rgba(255,255,255,0.55)' },

  card: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
  },

  // Step indicator
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  stepDotActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  stepNum: { ...Typography.bodySmall, color: Colors.textDisabled, fontWeight: '700' },
  stepNumActive: { color: Colors.white },
  stepLabel: { ...Typography.bodySmall, color: Colors.textDisabled },
  stepLabelActive: { color: Colors.primary, fontWeight: '600' },
  stepLine: { flex: 1, height: 2, backgroundColor: Colors.border, marginBottom: 16, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: Colors.primary },

  terms: { ...Typography.bodySmall, color: Colors.textSecondary, textAlign: 'center', marginVertical: 14 },
  termsLink: { color: Colors.primary, fontWeight: '600' },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 28,
    backgroundColor: Colors.white,
  },
  footerText: { ...Typography.bodyMedium, color: Colors.textSecondary },
  footerLink: { ...Typography.bodyMedium, color: Colors.primary, fontWeight: '700' },
});