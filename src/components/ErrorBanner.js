import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

export default function ErrorBanner({ message, actionLabel, onAction }) {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>{message}</Text>
      {onAction ? (
        <Pressable onPress={onAction} style={styles.action}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.dangerBg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
  },
  text: {
    color: colors.danger,
    fontWeight: '600',
  },
  action: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  actionText: {
    color: colors.danger,
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
});
