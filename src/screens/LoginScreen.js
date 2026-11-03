import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setAuthToken } from '../api/client';
import { login } from '../api/expenses';
import { saveSession } from '../storage/storage';
import { colors, spacing } from '../theme';

export default function LoginScreen({ navigation }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    if (name.trim().length < 2) {
      setError('Please enter at least 2 characters');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await login(name.trim());
      await saveSession(token, user);
      setAuthToken(token);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.logo}>
          <Text style={styles.logoText}>₹</Text>
        </View>
        <Text style={styles.title}>PocketLedger</Text>
        <Text style={styles.subtitle}>Track every rupee, one tap at a time.</Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.muted}
          autoCapitalize="words"
          returnKeyType="go"
          onSubmitEditing={handleLogin}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.button, (pressed || loading) && styles.pressed]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  logoText: {
    color: colors.primaryText,
    fontSize: 36,
    fontWeight: '800',
  },
  title: {
    marginTop: spacing.lg,
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    color: colors.muted,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  error: {
    marginTop: spacing.sm,
    color: colors.danger,
    fontWeight: '600',
  },
  button: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.primaryText,
    fontWeight: '700',
    fontSize: 16,
  },
  pressed: {
    opacity: 0.7,
  },
});
