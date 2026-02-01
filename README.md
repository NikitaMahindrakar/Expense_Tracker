## Expense Tracker ##

## **Features**

- Add new expenses with:
  - Amount (₹)
  - Category
  - Description
  - Date
- Filter expenses by category
- Sort expenses by date (newest first)
- Display total for the currently visible expenses
- Display summary (total per category)
- Basic validation:
  - Amount must be > 0
  - Date is required
  - Category is required
- Idempotent POST requests to handle retries
- Simple, clean UI

## **Tech Stack**

- **Backend:** Node.js, Express
- **Database:** SQLite – stores expenses with unique IDs
- **Frontend:** HTML, CSS, JavaScript
- **CORS support:** Enabled for frontend-backend communication

## **Setup (Local)**

1. Clone the repository:

```bash
git clone <repo-url>
cd expense-tracker/backend
```

2. Install dependencies:
   
```bash
npm install
```

3. Start the server:
   
```bash
npm start
```
