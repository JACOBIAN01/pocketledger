import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { deleteExpense } from '../api/expenses';
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from '../constants/categories';
import { colors, spacing } from '../theme';
import { formatDate, formatMoney, formatTime } from '../utils/format';

export default function ExpenseDetailScreen({ route, navigation }) {
  const { expense, currency } = route.params;
  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    Alert.alert('Delete expense', `Delete "${expense.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteExpense(expense.id);
            navigation.goBack();
          } catch (e) {
            setDeleting(false);
            Alert.alert('Could not delete', e.message);
          }
        },
      },
    ]);
  };

  const badgeColor = CATEGORY_COLORS[expense.category] || DEFAULT_CATEGORY_COLOR;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={[styles.categoryPill, { backgroundColor: badgeColor }]}>
          <Text style={styles.categoryText}>{expense.category}</Text>
        </View>
        <Text style={styles.title}>{expense.title}</Text>
        <Text style={styles.amount}>{formatMoney(expense.amount, currency)}</Text>

        <View style={styles.divider} />

        <Row label="Date" value={formatDate(expense.createdAt)} />
        <Row label="Time" value={formatTime(expense.createdAt)} />
        <Row label="Note" value={expense.note ? expense.note : '—'} />
      </View>

      <Pressable
        style={({ pressed }) => [styles.button, styles.editButton, pressed && styles.pressed]}
        onPress={() => navigation.navigate('AddExpense', { expense })}
      >
        <Text style={styles.editText}>Edit</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.button, styles.deleteButton, pressed && styles.pressed]}
        onPress={handleDelete}
        disabled={deleting}
      >
        <Text style={styles.deleteText}>{deleting ? 'Deleting…' : 'Delete'}</Text>
      </Pressable>
    </ScrollView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  categoryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  title: {
    marginTop: spacing.md,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  amount: {
    marginTop: spacing.xs,
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  rowLabel: {
    color: colors.muted,
    fontSize: 15,
  },
  rowValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: spacing.lg,
  },
  button: {
    marginTop: spacing.md,
    paddingVertical: spacing.lg,
    borderRadius: 14,
    alignItems: 'center',
  },
  editButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
  },
  editText: {
    color: colors.primaryText,
    fontWeight: '700',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: colors.dangerBg,
  },
  deleteText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 16,
  },
  pressed: {
    opacity: 0.7,
  },
});
