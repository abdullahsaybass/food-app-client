import React, { useCallback, useReducer, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
// ── Google auth temporarily disabled — see "GOOGLE AUTH (disabled)" blocks below to re-enable ──
// import * as Google from 'expo-auth-session/providers/google';
// import * as WebBrowser from 'expo-web-browser';
import { Colors, Typography } from '../../../theme';
import { AuthField, PasswordField, AuthButton } from '../components/AuthForm.component';
import type { RootStackParamList } from '../../../app/navigation/navigation.types';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import vfresh from '../../../../assets/images/vfresh.png';
// import {
//   GOOGLE_ANDROID_CLIENT_ID,
//   GOOGLE_WEB_CLIENT_ID,
//   GOOGLE_IOS_CLIENT_ID,
// } from '../config/googleAuth.config';

// WebBrowser.maybeCompleteAuthSession();

// ─── State ────────────────────────────────────────────────────────────────────

interface State {
  fullName:        string;
  email:           string;
  phone:           string;
  password:        string;
  confirmPassword: string;
  errors:          Partial<Record<'fullName' | 'email' | 'phone' | 'password' | 'confirmPassword', string>>;
  loading:         boolean;
}

type Action =
  | { type: 'SET';         field: keyof Omit<State, 'errors' | 'loading'>; value: string }
  | { type: 'SET_ERRORS';  errors: State['errors'] }
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
    case 'CLEAR_ERROR': {
      const e = { ...s.errors };
      delete e[a.field as keyof typeof e];
      return { ...s, errors: e };
    }
    case 'SET_LOADING': return { ...s, loading: a.value };
    default:            return s;
  }
}

// ─── Screen ───────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [state, dispatch]         = useReducer(reducer, init);
  const [showSuccess, setShowSuccess] = useState(false);
  // const [googleLoading, setGoogleLoading] = useState(false);
  // const [googleError,   setGoogleError]   = useState('');

  // const loginWithGoogle = useAuthStore(s => s.loginWithGoogle);

  // ── GOOGLE AUTH (disabled) ───────────────────────────────────────────────
  // const [, googleResponse, promptAsync] = Google.useAuthRequest({
  //   iosClientId:     GOOGLE_IOS_CLIENT_ID || undefined,
  //   androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  //   webClientId:     GOOGLE_WEB_CLIENT_ID,
  // });
  //
  // React.useEffect(() => {
  //   if (googleResponse?.type === 'success') {
  //     const idToken = googleResponse.authentication?.idToken;
  //     if (!idToken) {
  //       setGoogleError('Google sign-up failed. Please try again.');
  //       setGoogleLoading(false);
  //       return;
  //     }
  //     (async () => {
  //       try {
  //         await loginWithGoogle(idToken);
  //         navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  //       } catch (err: any) {
  //         setGoogleError(
  //           err?.response?.data?.message ?? err?.message ?? 'Google sign-up failed.'
  //         );
  //       } finally {
  //         setGoogleLoading(false);
  //       }
  //     })();
  //   } else if (
  //     googleResponse?.type === 'error' ||
  //     googleResponse?.type === 'dismiss'
  //   ) {
  //     setGoogleLoading(false);
  //   }
  // }, [googleResponse]);
  //
  // const handleGoogleSignUp = useCallback(async () => {
  //   setGoogleError('');
  //   setGoogleLoading(true);
  //   await promptAsync();
  // }, [promptAsync]);
  // ── END GOOGLE AUTH (disabled) ───────────────────────────────────────────

  // ── Field handlers ──────────────────────────────────────────────────────────

  const handleFullNameChange = useCallback((value: string) => {
    dispatch({ type: 'SET', field: 'fullName', value });
    dispatch({ type: 'CLEAR_ERROR', field: 'fullName' });
  }, []);

  const handleEmailChange = useCallback((value: string) => {
    dispatch({ type: 'SET', field: 'email', value });
    dispatch({ type: 'CLEAR_ERROR', field: 'email' });
  }, []);

  const handlePhoneChange = useCallback((value: string) => {
    dispatch({ type: 'SET', field: 'phone', value });
    dispatch({ type: 'CLEAR_ERROR', field: 'phone' });
  }, []);

  const handlePasswordChange = useCallback((value: string) => {
    dispatch({ type: 'SET', field: 'password', value });
    dispatch({ type: 'CLEAR_ERROR', field: 'password' });
  }, []);

  const handleConfirmPasswordChange = useCallback((value: string) => {
    dispatch({ type: 'SET', field: 'confirmPassword', value });
    dispatch({ type: 'CLEAR_ERROR', field: 'confirmPassword' });
  }, []);

  // ── Validation ──────────────────────────────────────────────────────────────

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

  // ── Register ────────────────────────────────────────────────────────────────

  const handleRegister = useCallback(async () => {
    if (!validate()) return;
    dispatch({ type: 'SET_LOADING', value: true });
    try {
      await authService.register({
        name:     state.fullName,
        email:    state.email,
        phone:    state.phone,
        password: state.password,
      });
      setShowSuccess(true);
    } catch (err: any) {
      const message: string =
        err?.response?.data?.message || err.message || 'Registration failed. Please try again.';
      const lower = message.toLowerCase();
      if (lower.includes('email'))
        dispatch({ type: 'SET_ERRORS', errors: { email: message } });
      else if (lower.includes('phone'))
        dispatch({ type: 'SET_ERRORS', errors: { phone: message } });
      else
        dispatch({ type: 'SET_ERRORS', errors: { email: message } });
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }, [validate]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={20}
      >
        {/* ── Navy top strip ── */}
        <View style={styles.topStrip}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          <View style={styles.logoMini}>
            <Image source={vfresh} style={styles.logoMiniImage} />
          </View>
          <Text style={styles.brandName}>Create Account</Text>
          <Text style={styles.brandSub}>Join VFresh today</Text>
        </View>

        {/* ── White card ── */}
        <View style={styles.card}>

          {/* ── GOOGLE SIGN-UP UI (disabled) ──────────────────────────────
          {googleError ? <Text style={styles.googleError}>{googleError}</Text> : null}

          <TouchableOpacity
            style={[styles.googleBtn, googleLoading && styles.googleBtnDisabled]}
            onPress={handleGoogleSignUp}
            disabled={googleLoading}
            activeOpacity={0.85}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color={Colors.grey700} />
            ) : (
              <>
                <View style={styles.googleIconWrap}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
                <Text style={styles.googleBtnText}>Sign up with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign up with email</Text>
            <View style={styles.dividerLine} />
          </View>
          ── END GOOGLE SIGN-UP UI (disabled) ────────────────────────────── */}

          {/* ── Email form ── */}
          <AuthField
            label="Full Name"
            placeholder="John Doe"
            value={state.fullName}
            onChangeText={handleFullNameChange}
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
            onChangeText={handleEmailChange}
            error={state.errors.email}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
          />

          <AuthField
            label="Phone Number (optional)"
            placeholder="+960 123 4567"
            value={state.phone}
            onChangeText={handlePhoneChange}
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
            onChangeText={handlePasswordChange}
            error={state.errors.password}
            returnKeyType="next"
          />

          <PasswordField
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={state.confirmPassword}
            onChangeText={handleConfirmPasswordChange}
            error={state.errors.confirmPassword}
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />

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

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* ── Success Modal ── */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Text style={styles.modalIcon}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>You're in!</Text>
            <Text style={styles.modalSub}>Your account has been created successfully.</Text>
            <TouchableOpacity
              style={styles.modalBtn}
              activeOpacity={0.85}
              onPress={() => {
                setShowSuccess(false);
                navigation.navigate('Login');
              }}
            >
              <Text style={styles.modalBtnText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1 },

  // ── Top strip ──────────────────────────────────────────────────────────────
  topStrip: {
    backgroundColor: Colors.navy,
    paddingTop:      24,
    paddingBottom:   52,
    alignItems:      'center',
    gap:             8,
  },
  backBtn: {
    position:        'absolute',
    top:             24,
    left:            20,
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  backText:      { color: Colors.white, fontSize: 20, lineHeight: 24 },
  logoMini: {
    width:           64,
    height:          64,
    borderRadius:    32,
    backgroundColor: Colors.white,
    alignItems:      'center',
    justifyContent:  'center',
    shadowColor:     Colors.primary,
    shadowOffset:    { width: 0, height: 6 },
    shadowOpacity:   0.4,
    shadowRadius:    12,
    elevation:       8,
  },
  logoMiniImage: { width: 36, height: 36, resizeMode: 'contain' },
  brandName:     { ...Typography.headingMedium, color: Colors.white },
  brandSub:      { ...Typography.bodyMedium, color: 'rgba(255,255,255,0.55)' },

  // ── Card ───────────────────────────────────────────────────────────────────
  card: {
    backgroundColor:      Colors.white,
    borderTopLeftRadius:  28,
    borderTopRightRadius: 28,
    marginTop:            -28,
    flex:                 1,
    paddingHorizontal:    24,
    paddingTop:           28,
    paddingBottom:        32,
    shadowColor:          '#000',
    shadowOffset:         { width: 0, height: -4 },
    shadowOpacity:        0.04,
    shadowRadius:         8,
    elevation:            4,
  },

  // ── Google button (kept for when Google auth is re-enabled) ──────────────
  googleError: {
    ...Typography.bodySmall,
    color:        Colors.error,
    textAlign:    'center',
    marginBottom: 10,
  },
  googleBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    height:          52,
    borderRadius:    14,
    borderWidth:     1.5,
    borderColor:     Colors.border,
    backgroundColor: Colors.white,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.06,
    shadowRadius:    4,
    elevation:       2,
    marginBottom:    4,
  },
  googleBtnDisabled: { opacity: 0.6 },
  googleBtnText: {
    ...Typography.bodyMedium,
    color:      Colors.textPrimary,
    fontWeight: '600',
  },
  googleIconWrap: {
    width:           22,
    height:          22,
    borderRadius:    11,
    backgroundColor: '#fff',
    borderWidth:     1.5,
    borderColor:     '#E8E8E8',
    alignItems:      'center',
    justifyContent:  'center',
    marginRight:     10,
  },
  googleIconText: { fontSize: 13, fontWeight: '700', color: '#4285F4' },

  // ── Divider ────────────────────────────────────────────────────────────────
  divider: {
    flexDirection:  'row',
    alignItems:     'center',
    marginVertical: 20,
    gap:            10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { ...Typography.bodySmall, color: Colors.textSecondary },

  // ── Terms ──────────────────────────────────────────────────────────────────
  terms:     { ...Typography.bodySmall, color: Colors.textSecondary, textAlign: 'center', marginVertical: 14 },
  termsLink: { color: Colors.primary, fontWeight: '600' },

  // ── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    flexDirection:   'row',
    justifyContent:  'center',
    paddingVertical: 28,
    backgroundColor: Colors.white,
  },
  footerText: { ...Typography.bodyMedium, color: Colors.textSecondary },
  footerLink: { ...Typography.bodyMedium, color: Colors.primary, fontWeight: '700' },

  // ── Success Modal ──────────────────────────────────────────────────────────
  modalOverlay: {
    flex:              1,
    backgroundColor:   'rgba(0,0,0,0.45)',
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    width:             '100%',
    backgroundColor:   '#fff',
    borderRadius:      24,
    paddingHorizontal: 28,
    paddingVertical:   36,
    alignItems:        'center',
    shadowColor:       '#000',
    shadowOffset:      { width: 0, height: 12 },
    shadowOpacity:     0.15,
    shadowRadius:      24,
    elevation:         12,
  },
  modalIconWrap: {
    width:           72,
    height:          72,
    borderRadius:    36,
    backgroundColor: Colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    20,
    shadowColor:     Colors.primary,
    shadowOffset:    { width: 0, height: 6 },
    shadowOpacity:   0.35,
    shadowRadius:    12,
    elevation:       6,
  },
  modalIcon:    { fontSize: 32, color: '#fff', fontWeight: '700' },
  modalTitle:   { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  modalSub:     { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  modalBtn: {
    width:           '100%',
    height:          52,
    borderRadius:    14,
    backgroundColor: Colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
    shadowColor:     Colors.primary,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.3,
    shadowRadius:    8,
    elevation:       4,
  },
  modalBtnText: { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: 0.4 },
});