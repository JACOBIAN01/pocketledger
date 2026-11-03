import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from '../constants/categories';
import { colors, spacing } from '../theme';
import { formatDate, formatMoney } from '../utils/format';

export default function ExpenseItem({ expense, index, currency, onPress, onDelete }) {
  const badgeColor = CATEGORY_COLORS[expense.category] || DEFAULT_CATEGORY_COLOR;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={() => onPress(expense)}
      onLongPress={() => onDelete(index)}
    >
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Text style={styles.badgeText}>{expense.category.charAt(0)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {expense.title}
        </Text>
        <Text style={styles.meta}>
          {expense.category} · {formatDate(expense.createdAt)}
        </Text>
      </View>
      <Text style={styles.amount}>{formatMoney(expense.amount, currency)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  meta: {
    marginTop: 2,
    fontSize: 13,
    color: colors.muted,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginLeft: spacing.sm,
  },
});
