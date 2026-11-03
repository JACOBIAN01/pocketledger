const express = require('express');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');
const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Fun', 'Health'];

// ---------- tiny JSON "database" ----------
function loadDb() {
  if (!fs.existsSync(DB_FILE)) {
    return { users: [], sessions: {}, expenses: [], nextUserId: 1, nextExpenseId: 1 };
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

let db = loadDb();

function saveDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// ---------- seed data for new users ----------
const SAMPLE = {
  Food: ['Groceries', 'Pizza night', 'Coffee', 'Lunch with team', 'Bakery', 'Fruit market'],
  Transport: ['Metro card', 'Cab to office', 'Fuel', 'Bus pass', 'Auto ride'],
  Shopping: ['T-shirt', 'Headphones', 'Notebook', 'Shoes', 'Backpack'],
  Bills: ['Electricity bill', 'Phone recharge', 'Internet', 'Water bill'],
  Fun: ['Movie tickets', 'Bowling', 'Concert', 'Game top-up'],
};
const SEED_CATEGORIES = Object.keys(SAMPLE); // no "Health" on purpose

function seedExpensesFor(userId) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const items = [];

  for (let i = 0; i < 36; i++) {
    let createdAt;
    if (i < 8) {
      // a few expenses guaranteed to be in the current month
      const span = Math.max(now.getTime() - monthStart.getTime(), 60 * 1000);
      createdAt = new Date(monthStart.getTime() + Math.random() * span);
    } else {
      const daysAgo = 3 + Math.random() * 55;
      createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      if (createdAt >= monthStart) {
        createdAt = new Date(monthStart.getTime() - (1 + Math.random() * 25) * 24 * 60 * 60 * 1000);
      }
    }
    const category = SEED_CATEGORIES[i % SEED_CATEGORIES.length];
    const titles = SAMPLE[category];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const amount = (20 + Math.random() * 1500).toFixed(2);

    items.push({
      id: db.nextExpenseId++,
      userId,
      title,
      amount,
      category,
      note: '',
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    });
  }
  db.expenses.push(...items);
}

// ---------- helpers ----------
function toPublic(expense) {
  const { userId, ...rest } = expense;
  return rest;
}

function validateExpense({ title, amount, category }) {
  if (typeof title !== 'string' || title.trim().length === 0) return 'Title is required';
  if (title.trim().length > 60) return 'Title must be 60 characters or less';
  const value = Number(amount);
  if (amount === '' || amount === null || amount === undefined || Number.isNaN(value) || value <= 0) {
    return 'Amount must be a number greater than 0';
  }
  if (!CATEGORIES.includes(category)) return `Category must be one of: ${CATEGORIES.join(', ')}`;
  return null;
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const userId = token ? db.sessions[token] : undefined;
  if (!userId) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
  req.userId = userId;
  next();
}

function findOwnExpense(req, res) {
  const id = Number(req.params.id);
  const expense = db.expenses.find((e) => e.id === id && e.userId === req.userId);
  if (!expense) {
    res.status(404).json({ error: 'Expense not found' });
    return null;
  }
  return expense;
}

// ---------- app ----------
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()}  ${req.method} ${req.originalUrl}`);
  next();
});

// Simulate a real network: reads are a bit slow, writes are slower.
app.use('/api', (req, res, next) => {
  setTimeout(next, req.method === 'GET' ? 400 : 800);
});

app.get('/', (req, res) => {
  res.send('PocketLedger API is running. Endpoints live under /api');
});

app.post('/api/login', (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  if (name.length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters' });
  }

  let user = db.users.find((u) => u.name.toLowerCase() === name.toLowerCase());
  if (!user) {
    user = { id: db.nextUserId++, name };
    db.users.push(user);
    seedExpensesFor(user.id);
  }

  const token = crypto.randomBytes(24).toString('hex');
  db.sessions[token] = user.id;
  saveDb();
  res.json({ token, user });
});

app.get('/api/expenses', auth, (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

  const all = db.expenses
    .filter((e) => e.userId === req.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const start = (page - 1) * limit;
  const data = all.slice(start, start + limit).map(toPublic);
  res.json({ data, page, limit, total: all.length, hasMore: start + limit < all.length });
});

app.get('/api/expenses/:id', auth, (req, res) => {
  const expense = findOwnExpense(req, res);
  if (expense) res.json(toPublic(expense));
});

app.post('/api/expenses', auth, (req, res) => {
  const error = validateExpense(req.body);
  if (error) return res.status(400).json({ error });

  const now = new Date().toISOString();
  const expense = {
    id: db.nextExpenseId++,
    userId: req.userId,
    title: req.body.title.trim(),
    amount: Number(req.body.amount).toFixed(2),
    category: req.body.category,
    note: typeof req.body.note === 'string' ? req.body.note.trim() : '',
    createdAt: now,
    updatedAt: now,
  };
  db.expenses.push(expense);
  saveDb();
  res.status(201).json(toPublic(expense));
});

app.put('/api/expenses/:id', auth, (req, res) => {
  const expense = findOwnExpense(req, res);
  if (!expense) return;

  const next = {
    title: req.body.title ?? expense.title,
    amount: req.body.amount ?? expense.amount,
    category: req.body.category ?? expense.category,
    note: req.body.note ?? expense.note,
  };
  const error = validateExpense(next);
  if (error) return res.status(400).json({ error });

  expense.title = String(next.title).trim();
  expense.amount = Number(next.amount).toFixed(2);
  expense.category = next.category;
  expense.note = String(next.note).trim();
  expense.updatedAt = new Date().toISOString();
  saveDb();
  res.json(toPublic(expense));
});

app.delete('/api/expenses/:id', auth, (req, res) => {
  const expense = findOwnExpense(req, res);
  if (!expense) return;
  db.expenses = db.expenses.filter((e) => e.id !== expense.id);
  saveDb();
  res.json({ ok: true, id: expense.id });
});

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\nPocketLedger API listening on port ${PORT}\n`);
  console.log(`  iOS simulator / web:   http://localhost:${PORT}/api`);
  console.log(`  Android emulator:      http://10.0.2.2:${PORT}/api`);
  const nets = os.networkInterfaces();
  Object.values(nets)
    .flat()
    .filter((n) => n && n.family === 'IPv4' && !n.internal)
    .forEach((n) => console.log(`  Physical device (LAN): http://${n.address}:${PORT}/api`));
  console.log('');
});
