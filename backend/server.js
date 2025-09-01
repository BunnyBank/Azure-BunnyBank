const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// JSON data paths
const ACCOUNTS_FILE = path.join(__dirname, 'data', 'accounts.json');
const CRYPTO_FILE = path.join(__dirname, 'data', 'cryptoPrices.json');
const RATES_FILE = path.join(__dirname, 'data', 'exchangeRates.json');

// ---------- Helpers ----------
function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ---------- Login ----------
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const accounts = readJSON(ACCOUNTS_FILE);
  const user = accounts[username];
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.password !== password) return res.status(401).json({ error: 'Incorrect password' });
  res.json({ username, balance: user.balance, cryptos: user.cryptos, isAdmin: username === 'admin' });
});

// ---------- Get all data ----------
app.get('/api/data', (req, res) => {
  const accounts = readJSON(ACCOUNTS_FILE);
  const cryptoPrices = readJSON(CRYPTO_FILE);
  const exchangeRates = readJSON(RATES_FILE);
  res.json({ accounts, cryptoPrices, exchangeRates });
});

// ---------- Create Account ----------
app.post('/api/users', (req, res) => {
  const { username, password } = req.body;
  const accounts = readJSON(ACCOUNTS_FILE);
  if (accounts[username]) return res.status(400).json({ error: 'User already exists' });
  accounts[username] = { password, balance: { CAD: 100, USD: 0 }, cryptos: {} };
  // initialize cryptos
  const cryptoPrices = readJSON(CRYPTO_FILE);
  Object.keys(cryptoPrices).forEach(c => accounts[username].cryptos[c] = 0);
  writeJSON(ACCOUNTS_FILE, accounts);
  res.json({ success: true });
});

// ---------- Update Balance ----------
app.put('/api/users/:username/balance', (req, res) => {
  const { username } = req.params;
  const { currency, amount } = req.body;
  const accounts = readJSON(ACCOUNTS_FILE);
  if (!accounts[username]) return res.status(404).json({ error: 'User not found' });
  accounts[username].balance[currency] = amount;
  writeJSON(ACCOUNTS_FILE, accounts);
  res.json({ success: true });
});

// ---------- Send Payment ----------
app.post('/api/pay', (req, res) => {
  const { from, to, currency, amount } = req.body;
  const accounts = readJSON(ACCOUNTS_FILE);
  if (!accounts[from] || !accounts[to]) return res.status(404).json({ error: 'User not found' });
  if ((accounts[from].balance[currency] || 0) < amount) return res.status(400).json({ error: 'Insufficient funds' });

  accounts[from].balance[currency] -= amount;
  accounts[to].balance[currency] = (accounts[to].balance[currency] || 0) + amount;
  writeJSON(ACCOUNTS_FILE, accounts);
  res.json({ success: true });
});

// ---------- Create Crypto ----------
app.post('/api/crypto', (req, res) => {
  const { username, name } = req.body;
  const accounts = readJSON(ACCOUNTS_FILE);
  const cryptoPrices = readJSON(CRYPTO_FILE);

  if (!accounts[username]) return res.status(404).json({ error: 'User not found' });
  if (accounts[username].balance.CAD < 100) return res.status(400).json({ error: 'Not enough CAD' });

  accounts[username].balance.CAD -= 100;
  accounts[username].cryptos[name] = 0;

  // register crypto globally
  Object.keys(accounts).forEach(u => {
    if (accounts[u].cryptos[name] === undefined) accounts[u].cryptos[name] = 0;
  });
  if (!cryptoPrices[name]) cryptoPrices[name] = 100;

  writeJSON(ACCOUNTS_FILE, accounts);
  writeJSON(CRYPTO_FILE, cryptoPrices);
  res.json({ success: true, price: cryptoPrices[name] });
});

// ---------- Buy/Sell Crypto ----------
app.post('/api/crypto/buy', (req, res) => {
  const { username, name, amount } = req.body;
  const accounts = readJSON(ACCOUNTS_FILE);
  const cryptoPrices = readJSON(CRYPTO_FILE);

  if (!accounts[username]) return res.status(404).json({ error: 'User not found' });
  const price = cryptoPrices[name] ?? 100;
  const cost = price * amount;
  if (accounts[username].balance.CAD < cost) return res.status(400).json({ error: 'Not enough CAD' });

  accounts[username].balance.CAD -= cost;
  accounts[username].cryptos[name] = (accounts[username].cryptos[name] || 0) + amount;
  writeJSON(ACCOUNTS_FILE, accounts);
  res.json({ success: true });
});

app.post('/api/crypto/sell', (req, res) => {
  const { username, name, amount } = req.body;
  const accounts = readJSON(ACCOUNTS_FILE);
  const cryptoPrices = readJSON(CRYPTO_FILE);

  if (!accounts[username]) return res.status(404).json({ error: 'User not found' });
  if ((accounts[username].cryptos[name] || 0) < amount) return res.status(400).json({ error: 'Not enough crypto' });

  const price = cryptoPrices[name] ?? 100;
  const gain = price * amount;
  accounts[username].cryptos[name] -= amount;
  accounts[username].balance.CAD += gain;
  writeJSON(ACCOUNTS_FILE, accounts);
  res.json({ success: true });
});

// ---------- Set Crypto Price ----------
app.put('/api/crypto/:name/price', (req, res) => {
  const { name } = req.params;
  const { price } = req.body;
  const cryptoPrices = readJSON(CRYPTO_FILE);
  cryptoPrices[name] = price;
  writeJSON(CRYPTO_FILE, cryptoPrices);
  res.json({ success: true });
});

// ---------- Set Exchange Rate ----------
app.put('/api/exchange/:currency', (req, res) => {
  const { currency } = req.params;
  const { rate } = req.body;
  const exchangeRates = readJSON(RATES_FILE);
  exchangeRates[currency] = rate;
  writeJSON(RATES_FILE, exchangeRates);
  res.json({ success: true });
});

// ---------- Serve Frontend ----------
app.use(express.static(path.join(__dirname, '../frontend')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
