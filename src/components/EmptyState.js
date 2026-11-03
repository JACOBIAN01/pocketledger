import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

export default function EmptyState({ message = 'No expenses here yet' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🧾</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emoji: {
    fontSize: 40,
  },
  text: {
    marginTop: spacing.sm,
    color: colors.muted,
    fontSize: 15,
  },
});
