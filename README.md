# PocketLedger: Bug Bounty 🐞💰

PocketLedger is a small personal expense tracker built with **React Native (Expo)**,
**React Navigation**, **AsyncStorage** and a small **Express** backend.

It was shipped in a hurry and now it's broken. **There are 23 bugs hidden in the app.**
Your job is to find and fix as many as you can.

- Some bugs stop the app from starting. Others only show up when you *use* the app in a particular way.
- Every bug is in the **React Native code** (`App.js` and `src/`).
  **The server in `/server` is correct. Do not change it.**
- Use the **Expected behaviour** section below as the source of truth. If the app does
  something different from what's written there, that's a bug.

---

## 1. Setup

You need Node.js 20+ and either Expo Go on your phone, an iOS simulator or an Android emulator.

> This project uses **Expo SDK 58**. If the Expo Go app on your phone says the SDK is not supported,
> use an iOS simulator or Android emulator instead.

### Start the backend
```bash
cd server
npm install
npm start
```
The server prints the URLs you can use, for example:
```
iOS simulator / web:   http://localhost:3000/api
Android emulator:      http://10.0.2.2:3000/api
Physical device (LAN): http://192.168.1.23:3000/api
```
Your phone and your computer must be on the same Wi-Fi network to use the LAN URL.

To wipe all data and start fresh: `npm run reset` (with the server stopped).

### Start the app
In a second terminal, from the project root:
```bash
npm install
npx expo start
```
Then open the app on your simulator, emulator or Expo Go.

---

## 2. API reference

All endpoints are under `/api`. Every endpoint except `/login` needs an
`Authorization: Bearer <token>` header.

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/login` | `{ name }` | `{ token, user: { id, name } }` |
| GET | `/expenses?page=1&limit=10` | - | `{ data: Expense[], page, limit, total, hasMore }` (newest first) |
| GET | `/expenses/:id` | - | `Expense` |
| POST | `/expenses` | `{ title, amount, category, note? }` | `Expense` (201) |
| PUT | `/expenses/:id` | any of `{ title, amount, category, note }` | `Expense` |
| DELETE | `/expenses/:id` | - | `{ ok: true, id }` |

```json
// Expense
{
  "id": 12,
  "title": "Groceries",
  "amount": "450.00",
  "category": "Food",          // Food | Transport | Shopping | Bills | Fun | Health
  "note": "",
  "createdAt": "2026-11-02T10:15:00.000Z",
  "updatedAt": "2026-11-02T10:15:00.000Z"
}
```
Errors look like `{ "error": "message" }`. An invalid or missing token returns **401**.
The server adds a short artificial delay to every request to simulate a real network.

---

## 3. Expected behaviour (the spec)

### General
- The app runs without red or yellow error boxes.
- The status bar is readable on every screen.

### Login
- Enter a name (at least 2 characters) and tap **Continue**. A new name gets an account with sample expenses.
- The session is stored on the device, so a logged-in user stays logged in.

### Home
- **Summary card:** purple card, white text. It shows:
  - the amount spent in the current month
  - how many expenses are shown
  - their total
  - every amount formatted as currency with 2 decimals (e.g. `₹1250.50`)
- **Quick add:** Coffee / Bus / Lunch buttons create that expense and show it at the top of the list.
- **Category filter:** a horizontally scrollable row of chips (All, Food, Transport, Shopping, Bills, Fun, Health).
  - It filters the list.
  - Empty categories show *"No expenses here yet"*.
  - The chosen filter is saved as a preference.
- **Sort:** toggles between *Newest* and *Highest amount*.
- **List rows:** each row shows:
  - a circle in the category's colour (Food orange, Transport blue, Shopping pink, Bills green, Fun purple, Health red)
  - the title, category, date and amount
- **Pagination:** loads 10 at a time as you scroll, until everything is loaded.
- **Pull to refresh** reloads the list and shows an error banner if the server can't be reached.
- **Long-press** a row to delete it (with confirmation).
- **Tap** a row to open its details.
- An invalid session shows a banner with **Log in again**.

### Add / Edit expense
- The fields are Title, Amount (numeric keyboard), Category and Note (optional).
- Validation:
  - an empty title shows *"Title is required"*
  - an invalid amount shows *"Enter an amount greater than 0"*
- Saving creates or updates the expense and goes back.

### Expense detail
- Shows the category, title, amount, date, time and note.
- **Edit** and **Delete** (with confirmation).

### Settings
- Opens from the Home header.
- Shows your name, a currency picker (₹ $ € £) and the saved filter.
- **Currency** and the **saved filter** are preferences stored on the device. They apply across the app.
- **Reset preferences** restores ₹ and "All".
- **Log out** returns to Login.

---

## 4. Submitting

For every bug you fix, add an entry to `BUGS_FIXED.md`:

```md
### Bug: <short name>
- Where: src/screens/HomeScreen.js
- Symptom: what you saw in the app
- Cause: why it happened
- Fix: what you changed
```

You are graded on the number of bugs fixed **and** on how well you explain each cause.
A fix that hides the symptom without fixing the cause doesn't count.

Good luck! 🐛🔨
