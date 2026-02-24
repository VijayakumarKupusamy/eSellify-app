// Custom json-server with /login and /register routes
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// ─── POST /login ──────────────────────────────────────────────────────────────
server.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const db = router.db; // lowdb instance
  const user = db.get('users').find({ email }).value();

  if (!user) {
    return res.status(401).json({ error: 'No account found with that email.' });
  }
  if (user.password !== password) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  // Return user without password
  const { password: _pw, ...safeUser } = user;
  return res.status(200).json({ user: safeUser, token: 'mock-jwt-' + safeUser.id });
});

// ─── POST /register ───────────────────────────────────────────────────────────
server.post('/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const db = router.db;
  const existing = db.get('users').find({ email }).value();
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const newUser = {
    id: 'u_' + Date.now(),
    name,
    email,
    password, // stored only for demo purposes (never do this in production)
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
    role: 'customer',
    joinedAt: new Date().toISOString().split('T')[0],
  };

  db.get('users').push(newUser).write();

  const { password: _pw, ...safeUser } = newUser;
  return res.status(201).json({ user: safeUser, token: 'mock-jwt-' + safeUser.id });
});

// ─── GET /profile?token=mock-jwt-:id ─────────────────────────────────────────
server.get('/profile', (req, res) => {
  const token = req.query.token || req.headers['authorization']?.replace('Bearer ', '');
  if (!token || !token.startsWith('mock-jwt-')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const userId = token.replace('mock-jwt-', '');
  const db = router.db;
  const user = db.get('users').find({ id: userId }).value();
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _pw, ...safeUser } = user;
  return res.status(200).json(safeUser);
});

// ─── PATCH /profile/:id ───────────────────────────────────────────────────────
server.patch('/profile/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  // Remove password from updates if not explicitly changing it
  if (!updates.password) delete updates.password;
  const db = router.db;
  const user = db.get('users').find({ id }).value();
  if (!user) return res.status(404).json({ error: 'User not found' });
  db.get('users').find({ id }).assign(updates).write();
  const updated = db.get('users').find({ id }).value();
  const { password: _pw, ...safeUser } = updated;
  return res.status(200).json(safeUser);
});

// ─── GET /adminStats (computed dynamically from live data) ───────────────────
server.get('/adminStats', (_req, res) => {
  const db = router.db;

  const users    = db.get('users').value()    || [];
  const products = db.get('products').value() || [];
  const orders   = db.get('orders').value()   || [];
  const sellers  = db.get('sellers').value()  || [];
  const reports  = db.get('reports').value()  || [];

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const now       = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const newUsersThisMonth = users.filter((u) => (u.joinedAt || '').startsWith(thisMonth)).length;

  // Build monthly revenue from orders (last 8 months)
  const monthMap = {};
  for (let i = 7; i >= 0; i--) {
    const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('en-US', { month: 'short' });
    monthMap[key] = { month: label, revenue: 0, orders: 0 };
  }
  orders.forEach((o) => {
    const key = (o.createdAt || '').slice(0, 7);
    if (monthMap[key]) {
      monthMap[key].revenue += o.total || 0;
      monthMap[key].orders  += 1;
    }
  });

  const salesData = db.get('salesData').value() || [];
  const monthlyRevenue = Object.keys(monthMap).length
    ? Object.values(monthMap)
    : salesData.map(({ month, revenue, orders: ord }) => ({ month, revenue, orders: ord }));

  // Rough revenue growth: compare last two months that have data
  const filledMonths = monthlyRevenue.filter((m) => m.revenue > 0);
  let revenueGrowth = 0;
  if (filledMonths.length >= 2) {
    const last = filledMonths[filledMonths.length - 1].revenue;
    const prev = filledMonths[filledMonths.length - 2].revenue;
    revenueGrowth = prev > 0 ? +((((last - prev) / prev) * 100).toFixed(1)) : 0;
  }

  res.json({
    totalUsers:         users.length,
    totalSellers:       sellers.length,
    totalProducts:      products.length,
    totalOrders:        orders.length,
    totalRevenue:       +totalRevenue.toFixed(2),
    pendingReports:     reports.filter((r) => r.status === 'pending').length,
    newUsersThisMonth,
    revenueGrowth,
    platformFee:        5.0,
    monthlyRevenue,
  });
});

// ─── Use default router for all other routes ──────────────────────────────────
server.use(router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n  ✅  JSON Server running at http://localhost:${PORT}`);
  console.log(`  📦  Products      -> GET  http://localhost:${PORT}/products`);
  console.log(`  🔐  Login         -> POST http://localhost:${PORT}/login`);
  console.log(`  📝  Register      -> POST http://localhost:${PORT}/register`);
  console.log(`  🛒  Cart          -> GET  http://localhost:${PORT}/cartItems?userId=<id>`);
  console.log(`  📋  Orders        -> GET  http://localhost:${PORT}/orders?userId=<id>`);
  console.log(`  📊  Admin Stats   -> GET  http://localhost:${PORT}/adminStats`);
  console.log(`  🗂️   Activity Logs -> GET  http://localhost:${PORT}/activityLogs?_sort=timestamp&_order=desc\n`);
});
