import React, { useCallback, useReducer } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { Colors, Typography } from '../../../theme';
import { AuthField, PasswordField, AuthButton } from '../components/AuthForm.component';
import type { RootStackParamList } from '../../../app/navigation/navigation.types';
import { useAuthStore } from '../store/auth.store';
import { loginApi } from '../api/auth.api';
import { useProductStore } from '../../product/store/product.store';
import vfresh from '../../../../assets/images/vfresh.png';

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
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [state, dispatch] = useReducer(reducer, init);
  const login          = useAuthStore(s => s.login);
  const syncGuestCart  = useProductStore(s => s.syncGuestCart);
  const guestCartItems = useProductStore(s => s.cartItems);

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

      if (!token) {
        console.log('❌ No token received');
        return;
      }

      await login(token, user);

      // Sync any guest cart items to the server
      await syncGuestCart(guestCartItems);

      // Navigate to MainTabs after successful login.
      // Use reset so the user can't go back to Login with the back button.
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });

    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Login failed';
      dispatch({
        type: 'SET_ERRORS',
        emailError:    '',
        passwordError: msg,
      });
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
    backgroundColor:     Colors.white,
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
  cardTitle: {
    ...Typography.headingLarge,
    color:        Colors.textPrimary,
    marginBottom: 6,
  },
  cardSubtitle: {
    ...Typography.bodyMedium,
    color:        Colors.textSecondary,
    marginBottom: 28,
  },

  forgotRow: {
    alignSelf:    'flex-end',
    marginTop:    -8,
    marginBottom: 16,
  },
  forgotText: {
    ...Typography.bodyMedium,
    color:      Colors.primary,
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