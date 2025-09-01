# 🐇 BunnyBank

BunnyBank is a demo banking web application with **frontend + backend** built for deployment on **Azure**.  
It supports user accounts, crypto creation, exchange rates, and an admin panel for full management.

---

## 🚀 Features

### 👤 User
- View balances (CAD, USD, Crypto).
- Create new cryptocurrencies (cost: 100 CAD).
- Buy/Sell crypto at admin-set prices.
- Send money to other users.

### 🛠️ Admin
- Create new accounts (default CAD 100 balance).
- Adjust exchange rates (e.g., CAD → USD).
- Adjust user balances manually.
- Set crypto prices for buy/sell.
- View all users and their balances.

---

## 📂 Project Structure

```
Azure-BunnyBank/
├── backend/            # Node.js + Express backend (API + data handling)
├── frontend/           # Static frontend (HTML, CSS, JS)
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── images/
│       └── favicon.png
├── package.json        # Dependencies + scripts
└── README.md           # Project documentation
```

---

## ⚙️ Setup & Run

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/Azure-BunnyBank.git
cd Azure-BunnyBank
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Locally
```bash
node server.js
```
Backend runs at: `http://localhost:3000`

### 4. Deploy to Azure
- Create a new **Azure Web App (Node.js runtime)**.
- Deploy via GitHub Actions or `az webapp up`.
- Ensure `package.json` is included for build.

---

## 🔑 Demo Accounts

- **Admin:** `admin` / `admin123`  
- **User:** `user1` / `user123`  

---

## 📝 Notes
- Logout button is always bottom-right.  
- BunnyBank favicon located in `/frontend/images/favicon.png`.  
- Exchange rates, balances, and crypto prices are **fully configurable in the Admin Panel**.  

---

## 📜 License
MIT License © 2025 BunnyBank
