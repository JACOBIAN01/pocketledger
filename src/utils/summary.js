export function getTotal(expenses) {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export function getMonthTotal(expenses, now = new Date()) {
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const thisMonth = expenses.filter((expense) => {
    const d = new Date(expense.createdAt);
    return d.getMonth() === month && d.getFullYear() === year;
  });
  return getTotal(thisMonth);
}
