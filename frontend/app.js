const API = "http://localhost:5300"; // your backend URL

const form = document.getElementById("expenseForm");
const list = document.getElementById("expenseList");
const totalEl = document.getElementById("total");
const filter = document.getElementById("categoryFilter");
const summaryEl = document.getElementById("summary");
const sortBtn = document.getElementById("sortBtn");

let sortNewest = true; // default: newest first

// ------------------ ADD EXPENSE ------------------
form.addEventListener("submit", async(e) => {
    e.preventDefault();

    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value.trim();
    const description = document.getElementById("description").value.trim();
    const date = document.getElementById("date").value;

    // Basic validation
    if (!date) return alert("Date is required");
    if (isNaN(amount) || amount <= 0) return alert("Amount must be greater than 0");
    if (!category) return alert("Category is required");

    try {
        await fetch(`${API}/expenses`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Idempotency-Key": crypto.randomUUID()
            },
            body: JSON.stringify({ amount, category, description, date })
        });

        form.reset();
        loadExpenses(); // refresh list after adding
    } catch {
        alert("Failed to add expense");
    }
});

// ------------------ LOAD EXPENSES ------------------
async function loadExpenses() {
    const selectedCategory = filter.value;
    const url = new URL(`${API}/expenses`);

    // Filter by category
    if (selectedCategory) url.searchParams.set("category", selectedCategory);

    // Sort by newest first if sortNewest is true
    if (sortNewest) url.searchParams.set("sort", "date_desc");

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (!Array.isArray(data)) return alert("Failed to load expenses");

        renderExpenses(data);
    } catch {
        alert("Failed to fetch expenses");
    }
}

// ------------------ RENDER EXPENSES ------------------
function renderExpenses(data) {
    list.innerHTML = "";
    summaryEl.innerHTML = "";

    let total = 0;
    const categoryTotals = {};
    const allCategories = new Set();

    data.forEach(exp => {
        const amount = exp.amount_paise / 100;
        total += amount;

        allCategories.add(exp.category);
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + amount;

        const li = document.createElement("li");
        li.textContent = `${exp.date} | ${exp.category} | ₹${amount.toFixed(2)}`;
        list.appendChild(li);
    });

    totalEl.textContent = `Total: ₹${total.toFixed(2)}`;

    // Summary per category
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
        const li = document.createElement("li");
        li.textContent = `${cat}: ₹${amt.toFixed(2)}`;
        summaryEl.appendChild(li);
    });

    // Update filter dropdown dynamically
    filter.innerHTML = `<option value="">All Categories</option>`;
    allCategories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        filter.appendChild(opt);
    });
}

// ------------------ EVENT LISTENERS ------------------
filter.addEventListener("change", loadExpenses);

sortBtn.addEventListener("click", () => {
    sortNewest = !sortNewest; // toggle sort
    loadExpenses();
});

// Initial load
loadExpenses();