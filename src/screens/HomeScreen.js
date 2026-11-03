import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { createExpense, deleteExpense, getExpenses } from '../api/expenses';
import { setAuthToken } from '../api/client';
import CategoryChips from '../components/CategoryChips';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import ExpenseItem from '../components/ExpenseItem';
import SummaryCard from '../components/SummaryCard';
import { PAGE_SIZE } from '../config';
import { FILTERS, QUICK_ADD_PRESETS } from '../constants/categories';
import { clearSession, DEFAULT_SETTINGS, getSettings, saveSettings } from '../storage/storage';
import { colors, spacing } from '../theme';
import { monthName } from '../utils/format';
import { getMonthTotal, getTotal } from '../utils/summary';

export default function HomeScreen({ navigation }) {
  const [expenses, setExpenses] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [currency, setCurrency] = useState(DEFAULT_SETTINGS.currency);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={10}>
          <Text style={styles.headerLink}>Settings</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  // Load saved preferences when the screen first opens.
  useEffect(() => {
    getSettings().then((settings) => {
      setCategory(settings.lastFilter);
      setCurrency(settings.currency);
    });
  }, []);

  const fetchFirstPage = useCallback(async () => {
    const result = await getExpenses({ page: 1, limit: PAGE_SIZE });
    setExpenses(result.data);
    setPage(1);
    setHasMore(result.hasMore);
  }, []);

  // Every time Home comes back into focus: reload the latest expenses.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      fetchFirstPage()
        .then(() => active && setError(null))
        .catch((e) => active && setError(e))
        .finally(() => active && setLoading(false));
      return () => {
        active = false;
      };
    }, [fetchFirstPage])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchFirstPage();
      setError(null);
      setRefreshing(false);
    } catch (e) {
      setError(e);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    try {
      const result = await getExpenses({ page: page + 1, limit: PAGE_SIZE });
      setExpenses((prev) => [...prev, ...result.data]);
      setPage(page + 1);
      setHasMore(result.hasMore);
    } catch (e) {
      setError(e);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleQuickAdd = async (preset) => {
    try {
      const saved = await createExpense({
        title: preset.title,
        amount: preset.amount,
        category: preset.category,
      });
      setExpenses([saved, ...expenses]);
    } catch (e) {
      Alert.alert('Could not add expense', e.message);
    }
  };

  const confirmDelete = (index) => {
    Alert.alert('Delete expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const target = expenses[index];
            await deleteExpense(target.id);
            setExpenses((prev) => prev.filter((_, i) => i !== index));
          } catch (e) {
            Alert.alert('Could not delete', e.message);
          }
        },
      },
    ]);
  };

  const handleSelectCategory = (value) => {
    setCategory(value);
    saveSettings({ lastFilter: value });
  };

  const handleRelogin = async () => {
    await clearSession();
    setAuthToken(null);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const visible = useMemo(() => {
    const list = category === 'All' ? expenses : expenses.filter((e) => e.category === category);
    if (sortBy === 'amount') {
      return list.sort((a, b) => Number(b.amount) - Number(a.amount));
    }
    return list;
  }, [expenses, category, sortBy]);

  const header = (
    <View>
      <SummaryCard
        monthLabel={monthName()}
        monthTotal={getMonthTotal(visible)}
        total={getTotal(visible)}
        count={visible.length}
        currency={currency}
      />

      {error ? (
        <ErrorBanner
          message={error.message}
          actionLabel={error.status === 401 ? 'Log in again' : undefined}
          onAction={error.status === 401 ? handleRelogin : undefined}
        />
      ) : null}

      <Text style={styles.sectionTitle}>Quick add</Text>
      <View style={styles.quickRow}>
        {QUICK_ADD_PRESETS.map((preset) => (
          <Pressable
            key={preset.label}
            style={({ pressed }) => [styles.quickButton, pressed && styles.pressed]}
            onPress={() => handleQuickAdd(preset)}
          >
            <Text style={styles.quickText}>{preset.label}</Text>
            <Text style={styles.quickAmount}>{preset.amount}</Text>
          </Pressable>
        ))}
      </View>

      <CategoryChips options={FILTERS} selected={category} onSelect={handleSelectCategory} />

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Expenses</Text>
        <Pressable onPress={() => setSortBy(sortBy === 'newest' ? 'amount' : 'newest')}>
          <Text style={styles.sortText}>
            Sort: {sortBy === 'newest' ? 'Newest' : 'Highest amount'}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={visible}
        keyExtractor={(item, index) => String(index)}
        renderItem={(item, index) => (
          <ExpenseItem
            expense={item}
            index={index}
            currency={currency}
            onPress={(expense) => navigation.navigate('ExpenseDetail', { expense, currency })}
            onDelete={confirmDelete}
          />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={<EmptyState />}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator style={styles.footer} color={colors.primary} /> : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        contentContainerStyle={styles.listContent}
      />

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
        onPress={() => navigation.navigate('AddExpense')}
      >
        <Text style={styles.fabText}>+ Add</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  headerLink: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  quickRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
  },
  quickButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  quickText: {
    fontWeight: '600',
    color: colors.text,
  },
  quickAmount: {
    marginTop: 2,
    fontSize: 12,
    color: colors.muted,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: spacing.lg,
  },
  sortText: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 100,
  },
  footer: {
    marginVertical: spacing.lg,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl * 1.5,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md + 2,
    borderRadius: 999,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: {
    color: colors.primaryText,
    fontWeight: '700',
    fontSize: 16,
  },
  pressed: {
    opacity: 0.7,
  },
});
