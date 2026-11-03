import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  token: '@pocketledger/token',
  user: '@pocketledger/user',
  settings: '@pocketledger/settings',
};

export const DEFAULT_SETTINGS = {
  currency: '₹',
  lastFilter: 'All',
};

export async function saveSession(token, user) {
  await AsyncStorage.multiSet([
    [KEYS.token, token],
    [KEYS.user, JSON.stringify(user)],
  ]);
}

export async function getToken() {
  return AsyncStorage.getItem(KEYS.token);
}

export async function getUser() {
  const raw = await AsyncStorage.getItem(KEYS.user);
  return raw ? JSON.parse(raw) : null;
}

export async function clearSession() {
  await AsyncStorage.multiRemove([KEYS.token, KEYS.user]);
}

export async function getSettings() {
  const raw = await AsyncStorage.getItem(KEYS.settings);
  if (!raw) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
}

export async function saveSettings(changes) {
  const next = { ...DEFAULT_SETTINGS, ...changes };
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(next));
  return next;
}

export async function clearSettings() {
  await AsyncStorage.removeItem(KEYS.settings);
}
