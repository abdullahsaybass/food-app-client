import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,  // ✅ ADD
  StyleProp,  // ✅ ADD
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../../theme';

interface AuthFieldProps extends TextInputProps {
  label: string;
  error?: string;
  rightElement?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const AuthField: React.FC<AuthFieldProps> = ({
  label,
  error,
  rightElement,
  containerStyle,
  ...inputProps
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.fieldContainer, containerStyle]}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputWrapperFocused,
          !!error && styles.inputWrapperError,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.textDisabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="none"
          {...inputProps}
        />
        {rightElement}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

// ─── Password field with show/hide toggle ───────────────────────────────────

interface PasswordFieldProps extends Omit<AuthFieldProps, 'secureTextEntry'> {}

export const PasswordField: React.FC<PasswordFieldProps> = (props) => {
  const [visible, setVisible] = useState(false);

  return (
    <AuthField
      {...props}
      secureTextEntry={!visible}
      rightElement={
        <TouchableOpacity
          onPress={() => setVisible((v) => !v)}
          style={styles.eyeButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
        >
          <Text style={styles.eyeText}>{visible ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      }
    />
  );
};

// ─── Primary action button ───────────────────────────────────────────────────

interface AuthButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;      // ✅ ADD
  labelStyle?: StyleProp<TextStyle>;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  style,      // ✅ ADD
  labelStyle, // ✅ ADD
}) => (
  <TouchableOpacity
    style={[styles.button, (disabled || loading) && styles.buttonDisabled, style]} // ✅ ADD style
    onPress={onPress}
    activeOpacity={0.85}
    disabled={disabled || loading}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <Text style={[styles.buttonText, labelStyle]}> {/* ✅ ADD labelStyle */}
      {loading ? 'Please wait…' : label}
    </Text>
  </TouchableOpacity>
);

// ─── Divider with label ──────────────────────────────────────────────────────

export const AuthDivider: React.FC<{ label?: string }> = ({ label = 'or' }) => (
  <View style={styles.dividerRow}>
    <View style={styles.dividerLine} />
    <Text style={styles.dividerLabel}>{label}</Text>
    <View style={styles.dividerLine} />
  </View>
);

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Field
  fieldContainer: {
    marginBottom: Spacing.base,
  },
  label: {
    ...Typography.labelLarge,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textTransform: undefined, // override uppercase from labelLarge if needed
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.base,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: Colors.borderFocus,
    backgroundColor: Colors.primarySurface,
  },
  inputWrapperError: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    ...Typography.bodyLarge,
    color: Colors.textPrimary,
    paddingVertical: 0, // Android fix
  },
  errorText: {
    ...Typography.bodyMedium,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  eyeButton: {
    paddingLeft: Spacing.sm,
  },
  eyeText: {
    fontSize: 18,
  },

  // Button
  button: {
    height: 54,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    ...Typography.labelLarge,
    color: Colors.white,
    letterSpacing: 0.5,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerLabel: {
    ...Typography.bodyMedium,
    color: Colors.textDisabled,
    marginHorizontal: Spacing.md,
  },
});