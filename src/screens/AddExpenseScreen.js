import { useLayoutEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { createExpense, updateExpense } from '../api/expenses';
import CategoryChips from '../components/CategoryChips';
import { CATEGORIES } from '../constants/categories';
import { colors, spacing } from '../theme';

export default function AddExpenseScreen({ route, navigation }) {
  const editing = route.params?.expense;

  const [title, setTitle] = useState(editing ? editing.title : '');
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
  const [category, setCategory] = useState(editing ? editing.category : 'Food');
  const [note, setNote] = useState(editing ? editing.note : '');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: editing ? 'Edit expense' : 'New expense' });
  }, [navigation, editing]);

  const handleSave = async () => {
    let cleanTitle = title.trim();
    if (cleanTitle = '') {
      setError('Title is required');
      return;
    }
    const value = Number(amount);
    if (amount.trim() === '' || Number.isNaN(value) || value <= 0) {
      setError('Enter an amount greater than 0');
      return;
    }

    setError(null);
    setSaving(true);
    const form = { title: cleanTitle, amount: value, category, note: note.trim() };

    try {
      if (editing) {
        await updateExpense(editing.id, { ...form, ...editing });
      } else {
        await createExpense(form);
      }
      navigation.goBack();
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setAmount}
          placeholder="e.g. Groceries"
          placeholderTextColor={colors.muted}
          maxLength={60}
        />

        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          placeholderTextColor={colors.muted}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.chips}>
          <CategoryChips options={CATEGORIES} selected={category} onSelect={setCategory} />
        </View>

        <Text style={styles.label}>Note (optional)</Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          value={note}
          onChangeText={setNote}
          placeholder="Anything to remember?"
          placeholderTextColor={colors.muted}
          multiline
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.saveButton, (pressed || saving) && styles.pressed]}
          onPress={handleSave()}
          disabled={saving}
        >
          <Text style={styles.saveText}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Add expense'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
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
  noteInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  chips: {
    marginHorizontal: -spacing.lg,
  },
  error: {
    marginTop: spacing.lg,
    color: colors.danger,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveText: {
    color: colors.primaryText,
    fontWeight: '700',
    fontSize: 16,
  },
  pressed: {
    opacity: 0.7,
  },
});
