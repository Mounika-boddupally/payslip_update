// =====================================================
// NR SOFTECH PAYSLIP MANAGEMENT SYSTEM - SERVER
// =====================================================

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// ── Middleware ──────────────────────────────────────
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ── MySQL Connection ────────────────────────────────
// ⚠️  UPDATE these credentials to match your MySQL setup
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',          // ← change if needed
  password: 'Mouni@1234',          // ← change to your MySQL password
  database: 'nrsoftech_payslip',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('   Make sure MySQL is running and credentials in server.js are correct.');
    console.error('   Also run database.sql first to create the database.');
  } else {
    console.log('✅ MySQL connected successfully');
    connection.release();
  }
});

// ── EMPLOYEES ROUTES ────────────────────────────────

// GET all employees (search supported via ?q=)
app.get('/api/employees', (req, res) => {
  const q = req.query.q ? `%${req.query.q}%` : '%';
  const sql = `SELECT * FROM employees WHERE name LIKE ? OR pers_no LIKE ? OR department LIKE ? ORDER BY name ASC`;
  db.query(sql, [q, q, q], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET single employee
app.get('/api/employees/:id', (req, res) => {
  db.query('SELECT * FROM employees WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json(results[0]);
  });
});

// POST create employee
app.post('/api/employees', (req, res) => {
  const { name, pers_no, designation, pan, department, doj, pf_no, uan, bank_name, bank_account } = req.body;
  const sql = `INSERT INTO employees (name, pers_no, designation, pan, department, doj, pf_no, uan, bank_name, bank_account) VALUES (?,?,?,?,?,?,?,?,?,?)`;
  db.query(sql, [name, pers_no, designation, pan, department, doj, pf_no, uan, bank_name, bank_account], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, message: 'Employee saved successfully' });
  });
});

// PUT update employee
app.put('/api/employees/:id', (req, res) => {
  const { name, pers_no, designation, pan, department, doj, pf_no, uan, bank_name, bank_account } = req.body;
  const sql = `UPDATE employees SET name=?, pers_no=?, designation=?, pan=?, department=?, doj=?, pf_no=?, uan=?, bank_name=?, bank_account=? WHERE id=?`;
  db.query(sql, [name, pers_no, designation, pan, department, doj, pf_no, uan, bank_name, bank_account, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Employee updated successfully' });
  });
});

// DELETE employee
app.delete('/api/employees/:id', (req, res) => {
  db.query('DELETE FROM employees WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Employee deleted' });
  });
});

// ── PAYSLIPS ROUTES ─────────────────────────────────

// GET payslips for an employee
app.get('/api/payslips/:employee_id', (req, res) => {
  db.query('SELECT * FROM payslips WHERE employee_id = ? ORDER BY created_at DESC', [req.params.employee_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET single payslip
app.get('/api/payslip/:id', (req, res) => {
  const sql = `SELECT p.*, e.name, e.pers_no, e.designation, e.pan, e.department, e.doj, e.pf_no, e.uan, e.bank_name, e.bank_account
               FROM payslips p JOIN employees e ON p.employee_id = e.id WHERE p.id = ?`;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Payslip not found' });
    res.json(results[0]);
  });
});

// POST create payslip
app.post('/api/payslips', (req, res) => {
  const {
    employee_id, pay_from, pay_to, paid_days, leaves_taken,
    basic_pay, hra, meal_coupon, total_earnings,
    income_tax, total_tax,
    ee_pf_contribution, prof_tax, med_insurance, sodexo_deduction, total_deductions,
    net_pay
  } = req.body;

  const sql = `INSERT INTO payslips
    (employee_id, pay_from, pay_to, paid_days, leaves_taken, basic_pay, hra, meal_coupon, total_earnings,
     income_tax, total_tax, ee_pf_contribution, prof_tax, med_insurance, sodexo_deduction, total_deductions, net_pay)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

  db.query(sql, [
    employee_id, pay_from, pay_to, paid_days, leaves_taken || 0,
    basic_pay, hra, meal_coupon, total_earnings,
    income_tax, total_tax,
    ee_pf_contribution, prof_tax, med_insurance, sodexo_deduction, total_deductions,
    net_pay
  ], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, message: 'Payslip saved successfully' });
  });
});

// ── Serve index.html ────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 NR Softech Payslip System running at http://localhost:${PORT}`);
  console.log(`   Press Ctrl+C to stop\n`);
});
