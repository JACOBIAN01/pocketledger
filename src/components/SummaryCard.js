import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import { formatMoney } from '../utils/format';

export default function SummaryCard({ monthLabel, monthTotal, total, count, currency }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Spent in {monthLabel}</Text>
      <Text style={styles.total}>{formatMoney(monthTotal, currency)}</Text>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Showing {count} expenses</Text>
        {count && <Text style={styles.footerText}>{formatMoney(total, currency)} total</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundcolor: colors.primary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizantal: spacing.xl,
    borderRadius: 20,
  },
  label: {
    color: '#C7D2FE',
    fontSize: 14,
    fontWeight: '600',
  },
  total: {
    color: colors.primaryText,
    fontSize: 34,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  footerText: {
    color: '#E0E7FF',
    fontSize: 13,
  },
});
