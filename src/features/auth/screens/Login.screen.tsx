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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing } from '../../../theme';
import { AuthField, PasswordField, AuthButton, AuthDivider } from '../components/AuthForm.component';
import type { AuthStackParamList } from '../../../app/navigation/navigation.types';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import { loginApi } from '../api/auth.api';
// ─── State ────────────────────────────────────────────────────────────────────

interface State {
  email: string;
  password: string;
  emailError: string;
  passwordError: string;
  loading: boolean;
}
type Action =
  | { type: 'SET'; field: 'email' | 'password'; value: string }
  | { type: 'SET_ERRORS'; emailError: string; passwordError: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_LOADING'; value: boolean };

const init: State = { email: '', password: '', emailError: '', passwordError: '', loading: false };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'SET':           return { ...s, [a.field]: a.value };
    case 'SET_ERRORS':    return { ...s, emailError: a.emailError, passwordError: a.passwordError };
    case 'CLEAR_ERRORS':  return { ...s, emailError: '', passwordError: '' };
    case 'SET_LOADING':   return { ...s, loading: a.value };
    default:              return s;
  }
}

// ─── Screen ──────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [state, dispatch] = useReducer(reducer, init);

  const validate = useCallback((): boolean => {
    let emailError = '';
    let passwordError = '';

    if (!state.email.trim())
      emailError = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email))
      emailError = 'Enter a valid email';

    if (!state.password)
      passwordError = 'Password is required';
    else if (state.password.length < 6)
      passwordError = 'Min 6 characters';

    dispatch({ type: 'SET_ERRORS', emailError, passwordError });
    return !emailError && !passwordError;
  }, [state.email, state.password]);

const login = useAuthStore((s) => s.login);

const handleLogin = useCallback(async () => {
  try {
    const res = await loginApi({
      email: state.email,
      password: state.password,
    });

    console.log('FULL RESPONSE:', res);

    const { token, user } = res;

    if (!token) {
      console.log('❌ No token received');
      return;
    }

    await login(token, user);

    console.log('USER:', user);

  } catch (err: any) {
    console.log('Login error:', err?.response?.data || err.message);
  }
}, [state.email, state.password]);


  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Top illustration area (navy strip like the UI header) ── */}
          <View style={styles.topStrip}>
            <View style={styles.logoMini}>
              <Text style={styles.logoMiniEmoji}>🛒</Text>
            </View>
            <Text style={styles.brandName}>FreshMart</Text>
          </View>

          {/* ── White card ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSubtitle}>Welcome back! Enter your details below.</Text>

            <AuthField
              label="Email Address"
              placeholder="you@example.com"
              value={state.email}
              onChangeText={v => {
                dispatch({ type: 'SET', field: 'email', value: v });
                dispatch({ type: 'CLEAR_ERRORS' });
              }}
              error={state.emailError}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
            />

            <PasswordField
              label="Password"
              placeholder="Enter your password"
              value={state.password}
              onChangeText={v => {
                dispatch({ type: 'SET', field: 'password', value: v });
                dispatch({ type: 'CLEAR_ERRORS' });
              }}
              error={state.passwordError}
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              style={styles.forgotRow}
              onPress={() => navigation.navigate('ForgotPassword')}
              hitSlop={{ top: 8, bottom: 8 }}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <AuthButton label="Sign In" onPress={handleLogin} loading={state.loading} />

            <AuthDivider label="or continue with" />

            {/* Google SSO — wire up later */}
            <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>New here? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },
  flex:    { flex: 1 },
  scroll:  { flexGrow: 1 },

  // Top navy strip (mirrors app header from UI)
  topStrip: {
    backgroundColor: Colors.navy,
    paddingTop: 40,
    paddingBottom: 48,
    alignItems: 'center',
    gap: 12,
  },
  logoMini: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  logoMiniEmoji: { fontSize: 32 },
  brandName: {
    ...Typography.headingLarge,
    color: Colors.white,
    letterSpacing: -0.3,
  },

  // White card overlapping the strip
  card: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,       // overlap the navy strip
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
    // subtle shadow upward
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    ...Typography.headingLarge,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  cardSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: 28,
  },

  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 16,
  },
  forgotText: {
    ...Typography.bodyMedium,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Google button style matching UI's clean card buttons
  googleBtn: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.white,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleText: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 28,
    backgroundColor: Colors.white,
  },
  footerText: { ...Typography.bodyMedium, color: Colors.textSecondary },
  footerLink: { ...Typography.bodyMedium, color: Colors.primary, fontWeight: '700' },
});