import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radii } from '@moments/ui';
import { PaperGrain, PillButton } from '@moments/ui';
import { useAuth } from '../features/auth/AuthProvider';
import { errorMessage } from '../lib/errors';

export interface SignInUpScreenProps {
  onBack: () => void;
}

/**
 * Sign in / Sign up (auth): a warm-white paper screen with a handwritten
 * greeting, fields for name, email, password and confirm password, and a cobalt
 * pill button. Matches the Moments aesthetic.
 *
 * Wired to Supabase: pressing Continue tries to create an account first, and
 * falls back to signing in if the email is already registered.
 */
/**
 * Sign in / sign up. On success the auth state changes and the navigator swaps
 * to the signed-in screens, so there is nothing to navigate to here.
 */
export function SignInUpScreen({ onBack }: SignInUpScreenProps) {
  const insets = useSafeAreaInsets();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isSignUp = mode === 'signup';

  const canSubmit =
    email.trim().length > 0 &&
    password.length > 0 &&
    (!isSignUp || (name.trim().length > 0 && confirm.length > 0)) &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (isSignUp && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      if (isSignUp) {
        const { needsConfirmation } = await signUp(email.trim(), password, name.trim());
        if (needsConfirmation) {
          setNotice('Check your email to confirm your account, then sign in.');
          setMode('signin');
        }
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err) {
      setError(errorMessage(err, 'Something went wrong. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (next: 'signin' | 'signup') => {
    setMode(next);
    setError(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <PaperGrain opacity={0.35} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={onBack}
        style={[styles.back, { top: insets.top + 16 }]}
      >
        <Text style={styles.backText}>‹</Text>
      </Pressable>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 72 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{isSignUp ? 'Create your account' : 'Welcome back'}</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? 'A quiet place to keep what God is doing.' : 'Pick up where you left off.'}
        </Text>

        <View style={styles.fields}>
          {isSignUp ? (
            <View style={styles.field}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="words"
                autoComplete="name"
                style={styles.input}
              />
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.placeholder}
              secureTextEntry
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          {isSignUp ? (
            <View style={styles.field}>
              <Text style={styles.label}>Confirm password</Text>
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                placeholder="••••••••"
                placeholderTextColor={colors.placeholder}
                secureTextEntry
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => switchMode(isSignUp ? 'signin' : 'signup')}
          style={styles.switch}
        >
          <Text style={styles.switchText}>
            {isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}
          </Text>
        </Pressable>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        <PillButton
          label={submitting ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={!canSubmit ? styles.disabled : undefined}
        />
        {submitting ? <ActivityIndicator color={colors.cobalt} style={styles.spinner} /> : null}
        <Text style={styles.terms}>By continuing you agree to our Terms &amp; Privacy Policy.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.warmWhite,
  },
  back: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  backText: {
    fontFamily: fonts.uiMedium,
    fontSize: 30,
    color: colors.cobalt,
    lineHeight: 34,
  },
  scroll: {
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 34,
    lineHeight: 37,
    color: colors.darkBlue,
  },
  subtitle: {
    fontFamily: fonts.handwriting,
    fontSize: 26,
    color: colors.cobalt,
    marginTop: 10,
  },
  fields: {
    marginTop: 36,
    gap: 20,
  },
  switch: {
    marginTop: 24,
    alignSelf: 'center',
    paddingVertical: 8,
  },
  switchText: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: colors.cobalt,
  },
  field: {
    gap: 8,
  },
  label: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    letterSpacing: 0.6,
    color: colors.textSecondary,
  },
  input: {
    height: 52,
    borderRadius: radii.field,
    backgroundColor: colors.fieldFill,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: 16,
    fontFamily: fonts.ui,
    fontSize: 15,
    color: colors.textBody,
  },
  footer: {
    paddingHorizontal: 28,
    gap: 14,
  },
  error: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
  },
  notice: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  spinner: {
    marginTop: -6,
  },
  disabled: {
    opacity: 0.5,
  },
  terms: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
