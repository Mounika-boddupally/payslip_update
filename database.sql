-- =====================================================
-- NR SOFTECH PAYSLIP MANAGEMENT SYSTEM - DATABASE SETUP
-- Run this script in MySQL before starting the app
-- =====================================================

CREATE DATABASE IF NOT EXISTS nrsoftech_payslip;
USE nrsoftech_payslip;

CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  pers_no VARCHAR(20),
  designation VARCHAR(100),
  pan VARCHAR(20),
  department VARCHAR(100),
  doj VARCHAR(20),
  pf_no VARCHAR(30),
  uan VARCHAR(30),
  bank_name VARCHAR(50),
  bank_account VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payslips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  pay_from VARCHAR(15),
  pay_to VARCHAR(15),
  paid_days DECIMAL(5,2),
  leaves_taken DECIMAL(5,2) DEFAULT 0,
  basic_pay DECIMAL(10,2) DEFAULT 0,
  hra DECIMAL(10,2) DEFAULT 0,
  meal_coupon DECIMAL(10,2) DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  income_tax DECIMAL(10,2) DEFAULT 0,
  total_tax DECIMAL(10,2) DEFAULT 0,
  ee_pf_contribution DECIMAL(10,2) DEFAULT 0,
  prof_tax DECIMAL(10,2) DEFAULT 0,
  med_insurance DECIMAL(10,2) DEFAULT 0,
  sodexo_deduction DECIMAL(10,2) DEFAULT 0,
  total_deductions DECIMAL(10,2) DEFAULT 0,
  net_pay DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
