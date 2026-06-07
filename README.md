# Full-Stack Mini Expense Tracker Dashboard

An engineering assessment submission developed for Studio Graphene. This application is a comprehensive full-stack personal finance tracker that isolates client-side rendering from backend transaction handling. It features an automated SQLite data persistence model, dynamic state-based view switching (eliminating heavy external routing dependencies), real-time financial KPI computations, structural categorical drop-down filtering, and interactive metric plotting.

## 🔗 Live Demo Links
- **GitHub Repository:** [Insert your public GitHub repository link here]
- **Live Deployment:** *Running locally as permitted per local environment guidelines*

## 🚀 Tech Stack & Justifications
- **React.js:** Chosen for fast, declarative component building and smooth reactive UI updates.
- **Tailwind CSS (via CDN):** Used to build an elegant, highly responsive production-grade design without increasing the local bundle build weight.
- **Recharts:** Used for high-performance SVG visual analytics because it handles real-time dataset re-rendering fluidly.
- **Lucide-React:** Provides lightweight, consistently designed vector iconography.
- **Node.js & Express.js:** Selected to create an asynchronous, decoupled RESTful API backend with minimal overhead.
- **SQLite3:** A lightweight, serverless relational database chosen to ensure permanent, safe disk-level transaction logging without requiring complex third-party system configurations.

## ⚙️ How to Run Locally
Ensure you have **Node.js** installed on your system. Open the project root folder in your terminal environment and split it into two active workspaces:

### 1. Initialize the Backend Core API Server

cd server
npm install
npm run dev

 ### 2. Initialize the Backend Core API Server
cd client
npm install
npm run dev

 ### API Documentation
 1. Fetch All Logs
Method: GET

Path: /api/expenses

Response Shape:
[
  {
    "id": 1,
    "amount": 15000.00,
    "category": "Salary",
    "date": "2026-06-07",
    "note": "Freelance Milestone",
    "type": "income"
  }
]

2. Create Transaction Entry
Method: POST

Path: /api/expenses

Request Body:
{
  "amount": 250.50,
  "category": "Food",
  "date": "2026-06-07",
  "note": "Lunch with team",
  "type": "expense"
}
3. Update Existing Entry
Method: PUT

Path: /api/expenses/:id

Request Body: Same shape as POST.

Response Shape: {"message": "Transaction updated successfully"}

4. Remove Entry
Method: DELETE

Path: /api/expenses/:id

Response Shape: {"message": "Transaction deleted successfully"}


## 📁 Project Structure

```text
expense-tracker-assignment/
├── server/
│   ├── server.js          # Express initialization, SQLite schema configuration, & REST endpoints
│   ├── package.json       # Server execution scripts & dependencies
│   └── expenses.db        # Generated localized database storage layer
└── client/
    ├── index.html         # Document markup wrapper with Tailwind CDN integration
    └── src/
        ├── App.jsx        # Core application engine, analytical hooks, and visual screens
        └── main.jsx       # Virtual DOM entry point mapping
