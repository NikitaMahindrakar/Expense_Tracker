const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const db = require("./db");

const app = express();

// ---- Middleware ----
app.use(cors());
app.use(express.json());

// ---- Health check (optional but useful) ----
app.get("/", (req, res) => {
    res.json({ status: "Expense Tracker API running" });
});

// ---- POST /expenses (idempotent) ----
app.post("/expenses", (req, res) => {
    const { amount, category, description, date } = req.body;
    const idempotencyKey = req.header("Idempotency-Key") || null;

    // Basic validation
    if (
        typeof amount !== "number" ||
        amount <= 0 ||
        !category ||
        !date
    ) {
        return res.status(400).json({ error: "Invalid input" });
    }

    // If request is retried, return existing expense
    if (idempotencyKey) {
        db.get(
            "SELECT * FROM expenses WHERE idempotency_key = ?", [idempotencyKey],
            (err, row) => {
                if (err) {
                    return res.status(500).json({ error: "Database error" });
                }
                if (row) {
                    return res.json(row);
                }
                insertExpense();
            }
        );
    } else {
        insertExpense();
    }

    function insertExpense() {
        const expense = {
            id: crypto.randomUUID(),
            amount_paise: Math.round(amount * 100),
            category,
            description: description || "",
            date,
            created_at: new Date().toISOString(),
            idempotency_key: idempotencyKey
        };

        db.run(
            `
      INSERT INTO expenses
      (id, amount_paise, category, description, date, created_at, idempotency_key)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
                expense.id,
                expense.amount_paise,
                expense.category,
                expense.description,
                expense.date,
                expense.created_at,
                expense.idempotency_key
            ],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: "Insert failed" });
                }
                res.status(201).json(expense);
            }
        );
    }
});

// ---- GET /expenses ----
app.get("/expenses", (req, res) => {
    const { category, sort } = req.query;

    let query = "SELECT * FROM expenses";
    const params = [];

    if (category) {
        query += " WHERE category = ?";
        params.push(category);
    }

    if (sort === "date_desc") {
        query += " ORDER BY date DESC";
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        // ALWAYS return array
        res.json(rows || []);
    });
});

// ---- Start server ----
const PORT = 5300;
app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
});