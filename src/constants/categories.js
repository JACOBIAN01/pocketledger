export const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Fun', 'Health'];

export const FILTERS = ['All', ...CATEGORIES];

export const CATEGORY_COLORS = {
  food: '#F59E0B',
  transport: '#3B82F6',
  shopping: '#EC4899',
  bills: '#10B981',
  fun: '#8B5CF6',
  health: '#EF4444',
};

export const DEFAULT_CATEGORY_COLOR = '#9CA3AF';

export const QUICK_ADD_PRESETS = [
  { label: '☕ Coffee', title: 'Coffee', amount: 80, category: 'Food' },
  { label: '🚌 Bus', title: 'Bus ticket', amount: 30, category: 'Transport' },
  { label: '🥪 Lunch', title: 'Lunch', amount: 150, category: 'Food' },
];

export const CURRENCIES = [
  { symbol: '₹', name: 'Indian Rupee' },
  { symbol: '$', name: 'US Dollar' },
  { symbol: '€', name: 'Euro' },
  { symbol: '£', name: 'British Pound' },
];
