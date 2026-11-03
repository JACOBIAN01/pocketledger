import { request } from './client';

export function login(name) {
  return request('/login', { method: 'POST', body: { name } });
}

export function getExpenses({ page = 1, limit = 10 } = {}) {
  return request(`/expenses?page=${page}&limit=${limit}`);
}

export function getExpense(id) {
  return request(`/expenses/${id}`);
}

export function createExpense(expense) {
  return request('/expenses', { method: 'POST', body: expense });
}

export function updateExpense(id, changes) {
  return request(`/expenses/${id}`, { method: 'PUT', body: changes });
}

export function deleteExpense(id) {
  return request(`/expenses/${id}`, { method: 'DELETE' });
}
