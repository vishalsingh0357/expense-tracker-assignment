const express = require('express');
const cors = require('cors');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let db;

// Initialize Database and Server
async function initializeDBAndServer() {
    try {
        db = await open({
            filename: path.join(__dirname, 'expenses.db'),
            driver: sqlite3.Database
        });

        // Creates the database table with the updated 'type' column for income tracking
        await db.run(`
            CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                date TEXT NOT NULL,
                note TEXT,
                type TEXT DEFAULT 'expense'
            )
        `);

        app.listen(PORT, () => {
            console.log(`Backend Server is active at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error(`Database Error: ${error.message}`);
        process.exit(1);
    }
}

initializeDBAndServer();

// --- API ROUTES ---

// 1. Get all transactions (Incomes & Expenses)
app.get('/api/expenses', async (req, res) => {
    try {
        const expenses = await db.all('SELECT * FROM expenses ORDER BY date DESC');
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Add a new transaction
app.post('/api/expenses', async (req, res) => {
    const { amount, category, date, note, type } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number.' });
    }
    if (!category) {
        return res.status(400).json({ error: 'Category is required.' });
    }
    if (!date) {
        return res.status(400).json({ error: 'Date is required.' });
    }

    try {
        const transactionType = type || 'expense'; // default fallback
        const result = await db.run(
            `INSERT INTO expenses (amount, category, date, note, type) VALUES (?, ?, ?, ?, ?)`,
            [amount, category, date, note || '', transactionType]
        );
        res.status(201).json({ id: result.lastID, amount, category, date, note, type: transactionType });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Edit an existing transaction
app.put('/api/expenses/:id', async (req, res) => {
    const { id } = req.params;
    const { amount, category, date, note, type } = req.body;

    try {
        await db.run(
            `UPDATE expenses SET amount = ?, category = ?, date = ?, note = ?, type = ? WHERE id = ?`,
            [amount, category, date, note, type || 'expense', id]
        );
        res.json({ message: 'Transaction updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Delete a transaction
app.delete('/api/expenses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.run('DELETE FROM expenses WHERE id = ?', [id]);
        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});