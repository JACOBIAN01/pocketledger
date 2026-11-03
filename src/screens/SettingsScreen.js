import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { setAuthToken } from '../api/client';
import { CURRENCIES } from '../constants/categories';
import { clearSession, clearSettings, getSettings, getUser, saveSettings } from '../storage/storage';
import { colors, spacing } from '../theme';

export function SettingsScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getUser().then(setUser);
    getSettings().then(setSettings);
  }, []);

  const handleCurrency = async (symbol) => {
    const next = await saveSettings({ currency: symbol });
    setSettings(next);
  };

  const handleClearPreferences = () => {
    Alert.alert('Reset preferences', 'Currency and saved filter will go back to defaults.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await clearSettings();
          setSettings(await getSettings());
        },
      },
    ]);
  };

  const handleLogout = async () => {
    await clearSession();
    setAuthToken(null);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.section}>Account</Text>
      <View style={styles.card}>
        <Text style={styles.name}>{user ? user.name : '…'}</Text>
        <Text style={styles.muted}>Signed in</Text>
      </View>

      <Text style={styles.section}>Currency</Text>
      <View style={styles.card}>
        {CURRENCIES.map((item, index) => {
          const selected = settings?.currency === item.symbol;
          return (
            <Pressable
              key={item.symbol}
              onPress={() => handleCurrency(item.symbol)}
              style={[styles.option, index < CURRENCIES.length - 1 && styles.optionBorder]}
            >
              <Text style={styles.optionText}>
                {item.symbol}  {item.name}
              </Text>
              {selected ? <Text style={styles.check}>✓</Text> : null}
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.section}>Saved filter</Text>
      <View style={styles.card}>
        <Text style={styles.optionText}>{settings ? settings.lastFilter : '…'}</Text>
        <Text style={styles.muted}>Home opens with this category selected</Text>
      </View>

      <Pressable style={styles.secondaryButton} onPress={handleClearPreferences}>
        <Text style={styles.secondaryText}>Reset preferences</Text>
      </Pressable>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  muted: {
    marginTop: 2,
    color: colors.muted,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  check: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  secondaryButton: {
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  secondaryText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.lg,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: colors.dangerBg,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 16,
  },
});
