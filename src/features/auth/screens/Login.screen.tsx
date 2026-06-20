import React, { useCallback, useReducer } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
// ── Google auth temporarily disabled — see "GOOGLE AUTH (disabled)" blocks below to re-enable ──
// import * as Google from 'expo-auth-session/providers/google';
// import * as WebBrowser from 'expo-web-browser';
import { Colors, Typography } from '../../../theme';
import { AuthField, PasswordField, AuthButton } from '../components/AuthForm.component';
import type { RootStackParamList } from '../../../app/navigation/navigation.types';
import { useAuthStore } from '../store/auth.store';
import { loginApi } from '../api/auth.api';
import { useProductStore } from '../../product/store/product.store';
import vfresh from '../../../../assets/images/vfresh.png';
// import {
//   GOOGLE_ANDROID_CLIENT_ID,
//   GOOGLE_WEB_CLIENT_ID,
//   GOOGLE_IOS_CLIENT_ID,
// } from '../config/googleAuth.config';

// WebBrowser.maybeCompleteAuthSession();

// ─── State ────────────────────────────────────────────────────────────────────

interface State {
  email:         string;
  password:      string;
  emailError:    string;
  passwordError: string;
  loading:       boolean;
}
type Action =
  | { type: 'SET';        field: 'email' | 'password'; value: string }
  | { type: 'SET_ERRORS'; emailError: string; passwordError: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_LOADING'; value: boolean };

const init: State = {
  email: '', password: '', emailError: '', passwordError: '', loading: false,
};

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'SET':          return { ...s, [a.field]: a.value };
    case 'SET_ERRORS':   return { ...s, emailError: a.emailError, passwordError: a.passwordError };
    case 'CLEAR_ERRORS': return { ...s, emailError: '', passwordError: '' };
    case 'SET_LOADING':  return { ...s, loading: a.value };
    default:             return s;
  }
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export const LoginScreen: React.FC = () => {
  const navigation     = useNavigation<NavigationProp<RootStackParamList>>();
  const [state, dispatch] = useReducer(reducer, init);
  // const [googleLoading, setGoogleLoading] = useState(false);
  // const [googleError,   setGoogleError]   = useState('');

  const login            = useAuthStore(s => s.login);
  // const loginWithGoogle  = useAuthStore(s => s.loginWithGoogle);
  const syncGuestCart    = useProductStore(s => s.syncGuestCart);
  const guestCartItems   = useProductStore(s => s.cartItems);

  // ── GOOGLE AUTH (disabled) ───────────────────────────────────────────────
  // const [, response, promptAsync] = Google.useAuthRequest({
  //   iosClientId:     GOOGLE_IOS_CLIENT_ID || undefined,
  //   androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  //   webClientId:     GOOGLE_WEB_CLIENT_ID,
  // });
  //
  // React.useEffect(() => {
  //   if (response?.type === 'success') {
  //     const idToken = response.authentication?.idToken;
  //     if (!idToken) {
  //       setGoogleError('Google sign-in failed. Please try again.');
  //       setGoogleLoading(false);
  //       return;
  //     }
  //     (async () => {
  //       try {
  //         await loginWithGoogle(idToken);
  //         await syncGuestCart(guestCartItems);
  //         navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  //       } catch (err: any) {
  //         setGoogleError(err?.response?.data?.message ?? err?.message ?? 'Google sign-in failed.');
  //       } finally {
  //         setGoogleLoading(false);
  //       }
  //     })();
  //   } else if (response?.type === 'error') {
  //     setGoogleError('Google sign-in was cancelled or failed.');
  //     setGoogleLoading(false);
  //   } else if (response?.type === 'dismiss') {
  //     setGoogleLoading(false);
  //   }
  // }, [response]);
  //
  // const handleGoogleSignIn = useCallback(async () => {
  //   setGoogleError('');
  //   setGoogleLoading(true);
  //   await promptAsync();
  // }, [promptAsync]);
  // ── END GOOGLE AUTH (disabled) ───────────────────────────────────────────

  // ── Email / password ──────────────────────────────────────────────────────

  const validate = useCallback((): boolean => {
    let emailError    = '';
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

  const handleEmailChange = useCallback((v: string) => {
    dispatch({ type: 'SET', field: 'email', value: v });
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  const handlePasswordChange = useCallback((v: string) => {
    dispatch({ type: 'SET', field: 'password', value: v });
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  const handleLogin = useCallback(async () => {
    if (!validate()) return;
    dispatch({ type: 'SET_LOADING', value: true });
    try {
      const res   = await loginApi({ email: state.email, password: state.password });
      const token = res.data.accessToken;
      const user  = res.data.user;
      if (!token) { console.log('❌ No token received'); return; }
      await login(token, user);
      await syncGuestCart(guestCartItems);
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Login failed';
      dispatch({ type: 'SET_ERRORS', emailError: '', passwordError: msg });
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }, [state.email, state.password, validate, login, navigation]);

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
        {/* ── Top navy strip ── */}
        <View style={styles.topStrip}>
          <View style={styles.logoMini}>
            <Image source={vfresh} style={styles.logoMiniImage} />
          </View>
          <Text style={styles.brandName}>VFresh</Text>
        </View>

        {/* ── White card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>
          <Text style={styles.cardSubtitle}>Welcome back! Enter your details below.</Text>

          <AuthField
            label="Email Address"
            placeholder="you@example.com"
            value={state.email}
            onChangeText={handleEmailChange}
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
            onChangeText={handlePasswordChange}
            error={state.passwordError}
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

          {/* ── GOOGLE AUTH UI (disabled) ──────────────────────────────────
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {googleError ? <Text style={styles.googleError}>{googleError}</Text> : null}

          <TouchableOpacity
            style={[styles.googleBtn, googleLoading && styles.googleBtnDisabled]}
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
            activeOpacity={0.85}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color={Colors.grey700} />
            ) : (
              <>
                <GoogleIcon />
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>
          ── END GOOGLE AUTH UI (disabled) ───────────────────────────────── */}
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>New here? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Create an account</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

// ─── Google icon (kept for when Google auth is re-enabled) ──────────────────

// const GoogleIcon = () => (
//   <View style={googleIconStyles.wrap}>
//     <Text style={googleIconStyles.g}>G</Text>
//   </View>
// );
//
// const googleIconStyles = StyleSheet.create({
//   wrap: {
//     width:           22,
//     height:          22,
//     borderRadius:    11,
//     backgroundColor: '#fff',
//     borderWidth:     1.5,
//     borderColor:     '#E8E8E8',
//     alignItems:      'center',
//     justifyContent:  'center',
//     marginRight:     10,
//   },
//   g: { fontSize: 13, fontWeight: '700', color: '#4285F4' },
// });

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1 },

  topStrip: {
    backgroundColor: Colors.navy,
    paddingTop:      60,
    paddingBottom:   68,
    alignItems:      'center',
    gap:             12,
  },
  logoMini: {
    width:           72,
    height:          72,
    borderRadius:    36,
    backgroundColor: Colors.white,
    alignItems:      'center',
    justifyContent:  'center',
    shadowColor:     Colors.primary,
    shadowOffset:    { width: 0, height: 8 },
    shadowOpacity:   0.4,
    shadowRadius:    14,
    elevation:       8,
  },
  logoMiniImage: { width: 44, height: 44, resizeMode: 'contain' },
  brandName: {
    ...Typography.headingLarge,
    color:         Colors.white,
    letterSpacing: -0.3,
  },

  card: {
    backgroundColor:      Colors.white,
    borderTopLeftRadius:  28,
    borderTopRightRadius: 28,
    marginTop:            -24,
    flex:                 1,
    paddingHorizontal:    24,
    paddingTop:           32,
    paddingBottom:        32,
    shadowColor:          '#000',
    shadowOffset:         { width: 0, height: -4 },
    shadowOpacity:        0.04,
    shadowRadius:         8,
    elevation:            4,
  },
  cardTitle:    { ...Typography.headingLarge, color: Colors.textPrimary, marginBottom: 6 },
  cardSubtitle: { ...Typography.bodyMedium,  color: Colors.textSecondary, marginBottom: 28 },

  forgotRow:  { alignSelf: 'flex-end', marginTop: -8, marginBottom: 16 },
  forgotText: { ...Typography.bodyMedium, color: Colors.primary, fontWeight: '600' },

  divider: {
    flexDirection:  'row',
    alignItems:     'center',
    marginVertical: 20,
    gap:            10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { ...Typography.bodySmall, color: Colors.textSecondary },

  googleError: {
    ...Typography.bodySmall,
    color:        Colors.error,
    textAlign:    'center',
    marginBottom: 10,
  },

  googleBtn: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'center',
    height:           52,
    borderRadius:     14,
    borderWidth:      1.5,
    borderColor:      Colors.border,
    backgroundColor:  Colors.white,
    shadowColor:      '#000',
    shadowOffset:     { width: 0, height: 2 },
    shadowOpacity:    0.06,
    shadowRadius:     4,
    elevation:        2,
  },
  googleBtnDisabled: { opacity: 0.6 },
  googleBtnText: {
    ...Typography.bodyMedium,
    color:      Colors.textPrimary,
    fontWeight: '600',
  },

  footer: {
    flexDirection:   'row',
    justifyContent:  'center',
    paddingVertical: 28,
    backgroundColor: Colors.white,
  },
  footerText: { ...Typography.bodyMedium, color: Colors.textSecondary },
  footerLink: { ...Typography.bodyMedium, color: Colors.primary, fontWeight: '700' },
});