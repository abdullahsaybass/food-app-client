// import React, { useCallback, useReducer } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   StatusBar,
//   Image,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { Colors, Typography } from '../../../theme';
// import { AuthField, PasswordField, AuthButton } from '../components/AuthForm.component';
// import type { RootStackParamList } from '../../../app/navigation/navigation.types';
// import { authService } from '../services/auth.service';
// import vfresh from '../../../../assets/images/vfresh.png';

// // ─── State ────────────────────────────────────────────────────────────────────

// interface State {
//   fullName: string;
//   email: string;
//   phone: string;
//   password: string;
//   confirmPassword: string;
//   errors: Partial<Record<'fullName' | 'email' | 'phone' | 'password' | 'confirmPassword', string>>;
//   loading: boolean;
// }
// type Action =
//   | { type: 'SET'; field: keyof Omit<State, 'errors' | 'loading'>; value: string }
//   | { type: 'SET_ERRORS'; errors: State['errors'] }
//   | { type: 'CLEAR_ERROR'; field: string }
//   | { type: 'SET_LOADING'; value: boolean };

// const init: State = {
//   fullName: '', email: '', phone: '', password: '', confirmPassword: '',
//   errors: {}, loading: false,
// };

// function reducer(s: State, a: Action): State {
//   switch (a.type) {
//     case 'SET':         return { ...s, [a.field]: a.value };
//     case 'SET_ERRORS':  return { ...s, errors: a.errors };
//     case 'CLEAR_ERROR': { const e = { ...s.errors }; delete e[a.field as keyof typeof e]; return { ...s, errors: e }; }
//     case 'SET_LOADING': return { ...s, loading: a.value };
//     default:            return s;
//   }
// }

// // ─── Screen ──────────────────────────────────────────────────────────────────

// type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

// export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
//   const [state, dispatch] = useReducer(reducer, init);

//   // ← memoized handlers to prevent TextInput re-render flash
//   const handleFullNameChange = useCallback((value: string) => {
//     dispatch({ type: 'SET', field: 'fullName', value });
//     dispatch({ type: 'CLEAR_ERROR', field: 'fullName' });
//   }, []);

//   const handleEmailChange = useCallback((value: string) => {
//     dispatch({ type: 'SET', field: 'email', value });
//     dispatch({ type: 'CLEAR_ERROR', field: 'email' });
//   }, []);

//   const handlePhoneChange = useCallback((value: string) => {
//     dispatch({ type: 'SET', field: 'phone', value });
//     dispatch({ type: 'CLEAR_ERROR', field: 'phone' });
//   }, []);

//   const handlePasswordChange = useCallback((value: string) => {
//     dispatch({ type: 'SET', field: 'password', value });
//     dispatch({ type: 'CLEAR_ERROR', field: 'password' });
//   }, []);

//   const handleConfirmPasswordChange = useCallback((value: string) => {
//     dispatch({ type: 'SET', field: 'confirmPassword', value });
//     dispatch({ type: 'CLEAR_ERROR', field: 'confirmPassword' });
//   }, []);

//   const validate = useCallback((): boolean => {
//     const errors: State['errors'] = {};

//     if (!state.fullName.trim() || state.fullName.trim().length < 2)
//       errors.fullName = 'Enter your full name';

//     if (!state.email.trim())
//       errors.email = 'Email is required';
//     else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email))
//       errors.email = 'Enter a valid email';

//     if (state.phone && !/^\+?[0-9]{7,15}$/.test(state.phone.replace(/\s/g, '')))
//       errors.phone = 'Enter a valid phone number';

//     if (!state.password)
//       errors.password = 'Password is required';
//     else if (state.password.length < 8)
//       errors.password = 'Minimum 8 characters';
//     else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(state.password))
//       errors.password = 'Add at least 1 uppercase & 1 number';

//     if (!state.confirmPassword)
//       errors.confirmPassword = 'Please confirm your password';
//     else if (state.password !== state.confirmPassword)
//       errors.confirmPassword = 'Passwords do not match';

//     dispatch({ type: 'SET_ERRORS', errors });
//     return Object.keys(errors).length === 0;
//   }, [state]);

//   const handleRegister = useCallback(async () => {
//     if (!validate()) return;

//     dispatch({ type: 'SET_LOADING', value: true });

//     try {
//       await authService.register({
//         name: state.fullName,
//         email: state.email,
//         phone: state.phone,
//         password: state.password,
//       });

//       alert('Registration successful! Please login.');
//       navigation.navigate('Login');

//     } catch (err: any) {
//       const message: string =
//         err?.response?.data?.message || err.message || 'Registration failed. Please try again.';

//       // Map server duplicate-field errors to the right field
//       const lower = message.toLowerCase();
//       if (lower.includes('email')) {
//         dispatch({ type: 'SET_ERRORS', errors: { email: message } });
//       } else if (lower.includes('phone')) {
//         dispatch({ type: 'SET_ERRORS', errors: { phone: message } });
//       } else {
//         // Generic error — show under email so it's always visible
//         dispatch({ type: 'SET_ERRORS', errors: { email: message } });
//       }
//     } finally {
//       dispatch({ type: 'SET_LOADING', value: false });
//     }
//   }, [validate]);

//   return (
//     <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
//       <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

//       <KeyboardAwareScrollView
//         contentContainerStyle={styles.scroll}
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}
//         enableOnAndroid
//         extraScrollHeight={20}
//       >
//         {/* ── Navy top strip with back button ── */}
//         <View style={styles.topStrip}>
//           <TouchableOpacity
//             style={styles.backBtn}
//             onPress={() => navigation.goBack()}
//             hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//           >
//             <Text style={styles.backText}>←</Text>
//           </TouchableOpacity>

//           <View style={styles.logoMini}>
//             <Image source={vfresh} style={styles.logoMiniImage} />
//           </View>
//           <Text style={styles.brandName}>Create Account</Text>
//           <Text style={styles.brandSub}>Join VFresh today</Text>
//         </View>

//         {/* ── White card ── */}
//         <View style={styles.card}>
//           <AuthField
//             label="Full Name"
//             placeholder="John Doe"
//             value={state.fullName}
//             onChangeText={handleFullNameChange}
//             error={state.errors.fullName}
//             autoComplete="name"
//             textContentType="name"
//             autoCapitalize="words"
//             returnKeyType="next"
//           />

//           <AuthField
//             label="Email Address"
//             placeholder="you@example.com"
//             value={state.email}
//             onChangeText={handleEmailChange}
//             error={state.errors.email}
//             keyboardType="email-address"
//             autoComplete="email"
//             textContentType="emailAddress"
//             returnKeyType="next"
//           />

//           <AuthField
//             label="Phone Number (optional)"
//             placeholder="+91 98765 43210"
//             value={state.phone}
//             onChangeText={handlePhoneChange}
//             error={state.errors.phone}
//             keyboardType="phone-pad"
//             autoComplete="tel"
//             textContentType="telephoneNumber"
//             returnKeyType="next"
//           />

//           <PasswordField
//             label="Password"
//             placeholder="Min 8 chars, 1 uppercase, 1 number"
//             value={state.password}
//             onChangeText={handlePasswordChange}
//             error={state.errors.password}
//             returnKeyType="next"
//           />

//           <PasswordField
//             label="Confirm Password"
//             placeholder="Re-enter your password"
//             value={state.confirmPassword}
//             onChangeText={handleConfirmPasswordChange}
//             error={state.errors.confirmPassword}
//             returnKeyType="done"
//             onSubmitEditing={handleRegister}
//           />

//           {/* Terms */}
//           <Text style={styles.terms}>
//             By signing up you agree to our{' '}
//             <Text style={styles.termsLink}>Terms of Service</Text>
//             {' '}and{' '}
//             <Text style={styles.termsLink}>Privacy Policy</Text>
//           </Text>

//           <AuthButton
//             label="Create Account"
//             onPress={handleRegister}
//             loading={state.loading}
//           />
//         </View>

//         {/* Footer */}
//         <View style={styles.footer}>
//           <Text style={styles.footerText}>Already have an account? </Text>
//           <TouchableOpacity onPress={() => navigation.navigate('Login')}>
//             <Text style={styles.footerLink}>Sign In</Text>
//           </TouchableOpacity>
//         </View>
//       </KeyboardAwareScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safe:   { flex: 1, backgroundColor: Colors.background },
//   scroll: { flexGrow: 1 },

//   topStrip: {
//     backgroundColor: Colors.navy,
//     paddingTop: 24,
//     paddingBottom: 52,
//     alignItems: 'center',
//     gap: 8,
//   },
//   backBtn: {
//     position: 'absolute',
//     top: 24,
//     left: 20,
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255,255,255,0.12)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   backText: { color: Colors.white, fontSize: 20, lineHeight: 24 },
//   logoMini: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: Colors.white,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: Colors.primary,
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.4,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   logoMiniImage: { width: 36, height: 36, resizeMode: 'contain' },
//   brandName: { ...Typography.headingMedium, color: Colors.white },
//   brandSub:  { ...Typography.bodyMedium, color: 'rgba(255,255,255,0.55)' },

//   card: {
//     backgroundColor: Colors.white,
//     borderTopLeftRadius: 28,
//     borderTopRightRadius: 28,
//     marginTop: -28,
//     flex: 1,
//     paddingHorizontal: 24,
//     paddingTop: 28,
//     paddingBottom: 32,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -4 },
//     shadowOpacity: 0.04,
//     shadowRadius: 8,
//     elevation: 4,
//   },

//   terms: { ...Typography.bodySmall, color: Colors.textSecondary, textAlign: 'center', marginVertical: 14 },
//   termsLink: { color: Colors.primary, fontWeight: '600' },

//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     paddingVertical: 28,
//     backgroundColor: Colors.white,
//   },
//   footerText: { ...Typography.bodyMedium, color: Colors.textSecondary },
//   footerLink: { ...Typography.bodyMedium, color: Colors.primary, fontWeight: '700' },
// });

import React, { useCallback, useReducer } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography } from '../../../theme';
import { AuthField, PasswordField, AuthButton } from '../components/AuthForm.component';
import type { RootStackParamList } from '../../../app/navigation/navigation.types';
import { authService } from '../services/auth.service';
import vfresh from '../../../../assets/images/vfresh.png';

// ─── State ────────────────────────────────────────────────────────────────────

interface State {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  errors: Partial<Record<'fullName' | 'email' | 'phone' | 'password' | 'confirmPassword', string>>;
  loading: boolean;
}
type Action =
  | { type: 'SET'; field: keyof Omit<State, 'errors' | 'loading'>; value: string }
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

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [state, dispatch] = useReducer(reducer, init);

  // ← memoized handlers to prevent TextInput re-render flash
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

      Alert.alert('Success', 'Registration successful! Please login.');
      navigation.navigate('Login');

    } catch (err: any) {
      const message: string =
        err?.response?.data?.message || err.message || 'Registration failed. Please try again.';

      // Map server duplicate-field errors to the right field
      const lower = message.toLowerCase();
      if (lower.includes('email')) {
        dispatch({ type: 'SET_ERRORS', errors: { email: message } });
      } else if (lower.includes('phone')) {
        dispatch({ type: 'SET_ERRORS', errors: { phone: message } });
      } else {
        // Generic error — show under email so it's always visible
        dispatch({ type: 'SET_ERRORS', errors: { email: message } });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }, [validate]);

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
            <Image source={vfresh} style={styles.logoMiniImage} />
          </View>
          <Text style={styles.brandName}>Create Account</Text>
          <Text style={styles.brandSub}>Join VFresh today</Text>
        </View>

        {/* ── White card ── */}
        <View style={styles.card}>
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
            placeholder="+91 98765 43210"
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
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.background },
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
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoMiniImage: { width: 36, height: 36, resizeMode: 'contain' },
  brandName: { ...Typography.headingMedium, color: Colors.white },
  brandSub:  { ...Typography.bodyMedium, color: 'rgba(255,255,255,0.55)' },

  card: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
  },

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