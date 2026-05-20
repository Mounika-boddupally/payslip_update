// =====================================================
// NR SOFTECH PAYSLIP SYSTEM — FRONTEND JS
// =====================================================

const API = 'http://localhost:3000/api';
let currentEmployeeId = null;
let searchTimeout = null;

flatpickr("#doj", {
    dateFormat: "d.m.Y",
    allowInput: true
});

flatpickr("#payFrom", {

    dateFormat: "d.m.Y",
    allowInput: true,

    onChange: function(selectedDates){

        if(selectedDates.length > 0){

            let fromDate = selectedDates[0];

            // LAST DAY OF MONTH
            let lastDay = new Date(
                fromDate.getFullYear(),
                fromDate.getMonth() + 1,
                0
            );

            // AUTO SET PAY TO
            document.getElementById("payTo")._flatpickr
            .setDate(lastDay, true);

            calcPayDays();
        }
    }
});

flatpickr("#payTo", {

    dateFormat: "d.m.Y",
    allowInput: true,

    onChange: function(){
        calcPayDays();
    }
});

// ══ TAB MANAGEMENT ════════════════════════════════

function showTab(tab) {
  ['form','directory','view'].forEach(t => {
    const el = document.getElementById(`tab-${t}`);
    if (el) el.style.display = (t === tab) ? 'block' : 'none';
  });
  if (tab === 'directory') loadEmployees();
}


// ══ SEARCH FOCUS (NAV BUTTON) ═════════════════════
function focusSearch() {
  showTab('directory');
  setTimeout(() => {
    const el = document.getElementById('empSearch');
    if (el) { el.focus(); el.select(); }
  }, 100);
}

// ══ TOAST ═════════════════════════════════════════

function toast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast-notif ${type}`;
  t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 3000);
}

// ══ DATE HELPERS ══════════════════════════════════

function autoFormatDate(input) {
  let v = input.value.replace(/[^0-9]/g, '');
  if (v.length >= 3 && v.length < 5) v = v.slice(0,2) + '.' + v.slice(2);
  if (v.length >= 5) v = v.slice(0,2) + '.' + v.slice(2,4) + '.' + v.slice(4,8);
  input.value = v;
}
function recalcAll(){

    let actualBasic =
    parseFloat(document.getElementById('actualbasicpay').value) || 0;

    let paidDays =
    parseFloat(document.getElementById('paidDays').value) || 0;

    let travelAllowance =
    parseFloat(document.getElementById('travelAllowance').value) || 0;

    let mealCoupon =
    parseFloat(document.getElementById('mealCoupon').value) || 0;

    let profTax =
    parseFloat(document.getElementById('profTax').value) || 0;

    let medInsurance =
    parseFloat(document.getElementById('medInsurance').value) || 0;

    // CURRENT BASIC PAY
    let currentBasic =
    (actualBasic / 30) * paidDays;

    // SET CURRENT BASIC IN BASIC PAY FIELD
    document.getElementById('basicPay').value =
    currentBasic.toFixed(2);

    // HRA = 50% OF CURRENT BASIC
    let hra = currentBasic * 0.50;

    // PF = 12% OF CURRENT BASIC
    let pf = currentBasic * 0.12;

    // SODEXO = MEAL COUPON
    let sodexo = mealCoupon;
    document.getElementById('sodexo').value =
    sodexo.toFixed(2);

    // TOTAL EARNINGS
    let totalEarnings =
    currentBasic + hra + mealCoupon;

    // INCOME TAX
    let incomeTax = 0;

    if(totalEarnings > 50000){
        incomeTax = totalEarnings * 0.20;
    }
    else if(totalEarnings > 30000){
        incomeTax = totalEarnings * 0.10;
    }

    // TOTAL DEDUCTIONS
    let totalDeductions =
    pf + profTax + medInsurance + sodexo;

    // NET PAY
    let netPay =
    totalEarnings - incomeTax - totalDeductions;

    // DISPLAY VALUES
    document.getElementById('hraDisplay').innerText =
    hra.toFixed(2);

    document.getElementById('pfDisplay').innerText =
    pf.toFixed(2);

    document.getElementById('incomeTaxDisplay').innerText =
    incomeTax.toFixed(2);

    document.getElementById('totalEarnings').innerText =
    totalEarnings.toFixed(2);

    document.getElementById('totalTax').innerText =
    incomeTax.toFixed(2);

    document.getElementById('totalDeductions').innerText =
    totalDeductions.toFixed(2);

    document.getElementById('netPay').innerText =
    "₹ " + netPay.toFixed(2);

    document.getElementById('fvEarnings').innerText =
    "₹ " + totalEarnings.toFixed(2);

    document.getElementById('fvTax').innerText =
    "₹ " + incomeTax.toFixed(2);

    document.getElementById('fvDed').innerText =
    "₹ " + totalDeductions.toFixed(2);

    // YTD CALCULATION (12 MONTHS)

document.getElementById('ytdBasic').innerText =
(currentBasic * 12).toFixed(2);

document.getElementById('ytdHRA').innerText =
(hra * 12).toFixed(2);

document.getElementById('ytdTravel').innerText =
(travelAllowance * 12).toFixed(2);

document.getElementById('ytdMeal').innerText =
(mealCoupon * 12).toFixed(2);

document.getElementById('ytdTotalEarnings').innerText =
(totalEarnings * 12).toFixed(2);

document.getElementById('ytdIncomeTax').innerText =
(incomeTax * 12).toFixed(2);

document.getElementById('ytdTotalTax').innerText =
(incomeTax * 12).toFixed(2);

document.getElementById('ytdPF').innerText =
(pf * 12).toFixed(2);

document.getElementById('ytdProfTax').innerText =
(profTax * 12).toFixed(2);

document.getElementById('ytdMed').innerText =
(medInsurance * 12).toFixed(2);

document.getElementById('ytdSodexo').innerText =
(sodexo * 12).toFixed(2);

document.getElementById('ytdTotalDeductions').innerText =
(totalDeductions * 12).toFixed(2);
}
function calcPayDays(){

    let payFrom =
    document.getElementById('payFrom').value;

    let payTo =
    document.getElementById('payTo').value;

    let leaves =
    parseFloat(document.getElementById('leavesTaken').value) || 0;

    if(payFrom && payTo){

       // CONVERT DD.MM.YYYY TO YYYY-MM-DD
        let fromParts = payFrom.split(".");
        let toParts = payTo.split(".");

        let fromDate = new Date(
            fromParts[2],
            fromParts[1] - 1,
            fromParts[0]
        );

        let toDate = new Date(
            toParts[2],
            toParts[1] - 1,
            toParts[0]
        );

        let totalDays =
        Math.floor(
            (toDate - fromDate) /
            (1000 * 60 * 60 * 24)
        ) + 1;

        let paidDays =
        totalDays - leaves;

        if(paidDays < 0){
            paidDays = 0;
        }

        document.getElementById('paidDays').value =
        paidDays.toFixed(1);

        // AUTO RECALCULATE
        recalcAll();
    }
}


// ══ INCOME TAX BRACKET (Indian Govt. Old Regime) ══

function calcIncomeTax(annualIncome) {
  let tax = 0;
  if (annualIncome <= 250000) {
    tax = 0;
  } else if (annualIncome <= 500000) {
    tax = (annualIncome - 250000) * 0.05;
  } else if (annualIncome <= 1000000) {
    tax = 12500 + (annualIncome - 500000) * 0.20;
  } else {
    tax = 112500 + (annualIncome - 1000000) * 0.30;
  }
  // Add 4% health & education cess
  tax = tax + tax * 0.04;
  return tax / 12; // monthly
}

// ══ MAIN RECALCULATION ════════════════════════════

const actualBasic =
parseFloat(
  document.getElementById('actualbasicpay').value
) || 0;

const paidDays =
parseFloat(
  document.getElementById('paidDays').value
) || 0;

const payFrom =
document.getElementById('payFrom').value;

let totalMonthDays = 30;

if(payFrom){

  const d = new Date(payFrom);

  totalMonthDays =
  new Date(
    d.getFullYear(),
    d.getMonth() + 1,
    0
  ).getDate();
}

// CURRENT BASIC
const currentBasic =
(actualBasic / totalMonthDays) * paidDays;

// AUTO UPDATE BASIC PAY FIELD
document.getElementById('basicPay').value =
currentBasic.toFixed(2);

  // HRA BASED ON CURRENT BASIC
  const hra =
  currentBasic * 0.50;

  // PF BASED ON CURRENT BASIC
  const pf =
  currentBasic * 0.12;

  // SODEXO DEDUCTION BASED ON CURRENT MEAL
  const sodexo =
  (currentMeal * 12) / 100;

  // TOTAL EARNINGS
  const totalEarnings =
  currentBasic + hra + travelAllowance + mealCoupon;

  // INCOME TAX
  const annualEarnings =
  totalEarnings * 12;

  const monthlyTax =
  calcIncomeTax(annualEarnings);

  const totalTax =
  monthlyTax;

  // TOTAL DEDUCTIONS
  const totalDeductions =
  pf +
  profT +
  medIns +
  sodexo;

  // NET PAY
  const netPay =
  totalEarnings -
  totalTax -
  totalDeductions;

  // DISPLAY VALUES
  setText('hraDisplay', fmt(hra));

  setText('pfDisplay', fmt(pf));

  setText(
    'leaveDeductDisplay',
    fmt(leaveDeduction)
  );

  setText(
    'incomeTaxDisplay',
    fmt(monthlyTax)
  );

  setText(
    'totalEarnings',
    fmt(totalEarnings)
  );

  setText(
    'totalTax',
    fmt(totalTax)
  );

  setText(
    'totalDeductions',
    fmt(totalDeductions)
  );

  setText(
    'netPay',
    `₹ ${fmt(netPay)}`
  );

  setText(
    'fvEarnings',
    `₹ ${fmt(totalEarnings)}`
  );

  setText(
    'fvTax',
    `₹ ${fmt(totalTax)}`
  );

  setText(
    'fvDed',
    `₹ ${fmt(totalDeductions)}`
  );

  // YTD
  setText('ytdBasic', fmt(currentBasic * 12));

  setText('ytdHRA', fmt(hra * 12));

  setText('ytdMeal', fmt(currentMeal * 12));

  setText(
    'ytdTotalEarnings',
    fmt(totalEarnings * 12)
  );

  setText(
    'ytdIncomeTax',
    fmt(monthlyTax * 12)
  );

  setText(
    'ytdTotalTax',
    fmt(totalTax * 12)
  );

  setText('ytdPF', fmt(pf * 12));

  setText(
    'ytdProfTax',
    fmt(profT * 12)
  );

  setText(
    'ytdMed',
    fmt(medIns * 12)
  );

  setText(
    'ytdSodexo',
    fmt(sodexo * 12)
  );

  setText(
    'ytdTotalDeductions',
    fmt(totalDeductions * 12)
  );

function fmt(n) { return isNaN(n) ? '0.00' : Math.max(0,n).toFixed(2); }
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

// ══ SAVE PAYSLIP ══════════════════════════════════

async function savePayslip() {
  const empData = gatherEmployeeData();
  if (!empData.name.trim()) { toast('Please enter employee name', 'error'); return; }

  const basic   = parseFloat(document.getElementById('basicPay').value) || 0;
  const travelAllowance =
parseFloat(document.getElementById('travelAllowance').value) || 0;
  const meal    = parseFloat(document.getElementById('mealCoupon').value) || 0;
  const hra     = basic * 0.50;
  const pf      = basic * 0.12;
  const profT   = parseFloat(document.getElementById('profTax').value) || 0;
  const medIns  = parseFloat(document.getElementById('medInsurance').value) || 0;
  const sodexo  = parseFloat(document.getElementById('sodexo').value) || 0;
  const leaves  = parseFloat(document.getElementById('leavesTaken').value) || 0;

  const payFromInput = document.getElementById('payFrom').value;
  let totalDays = 30;
  if (payFromInput) {
    const from = new Date(payFromInput);
    totalDays = new Date(from.getFullYear(), from.getMonth() + 1, 0).getDate();
  }
  const leaveDeduction = (basic / totalDays) * leaves;

  const totalEarnings = basic + hra + travelAllowance + meal;
  const annualEarnings = totalEarnings * 12;
  const monthlyTax = calcIncomeTax(annualEarnings);
  const totalDeductions = pf + profT + medIns + sodexo;
  const netPay = totalEarnings - monthlyTax - totalDeductions;

  // Save or update employee
  let empId = currentEmployeeId;
  try {
    if (!empId) {
      const res = await fetch(`${API}/employees`, {
        method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(empData)
      });
      const data = await res.json();
      if (data.error) { toast(data.error, 'error'); return; }
      empId = data.id;
      currentEmployeeId = empId;
    } else {
      await fetch(`${API}/employees/${empId}`, {
        method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(empData)
      });
    }

    // Save payslip
    const payFrom = payFromInput ? formatPayPeriod(payFromInput) : '';
    const payTo = document.getElementById('payTo').value;
    const paidDays = parseFloat(document.getElementById('paidDays').value) || 0;

    const slipRes = await fetch(`${API}/payslips`, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        employee_id: empId, pay_from: payFrom, pay_to: payTo, paid_days: paidDays, leaves_taken: leaves,
        basic_pay: basic, hra, travel_allowance: travelAllowance, meal_coupon: meal, total_earnings: totalEarnings,
        income_tax: monthlyTax, total_tax: monthlyTax,
        ee_pf_contribution: pf, prof_tax: profT, med_insurance: medIns,
        sodexo_deduction: sodexo, total_deductions: totalDeductions, net_pay: netPay
      })
    });
    const slipData = await slipRes.json();
    if (slipData.error) { toast(slipData.error, 'error'); return; }

    toast('✅ Payslip saved successfully!', 'success');
    setTimeout(() => showPayslipView(slipData.id), 800);
  } catch(err) {
    toast('❌ Server error: ' + err.message, 'error');
  }
}

// ══ SAVE EMPLOYEE ONLY ════════════════════════════

async function saveEmployeeOnly() {
  const empData = gatherEmployeeData();
  if (!empData.name.trim()) { toast('Please enter employee name', 'error'); return; }
  try {
    const method = currentEmployeeId ? 'PUT' : 'POST';
    const url = currentEmployeeId ? `${API}/employees/${currentEmployeeId}` : `${API}/employees`;
    const res = await fetch(url, {
      method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(empData)
    });
    const data = await res.json();
    if (data.error) { toast(data.error, 'error'); return; }
    if (!currentEmployeeId) currentEmployeeId = data.id;
    toast('✅ Employee saved successfully!', 'success');
  } catch(err) {
    toast('❌ Server error: ' + err.message, 'error');
  }
}

// ══ HELPERS ═══════════════════════════════════════

function gatherEmployeeData() {
  return {
    name:         document.getElementById('empName').value,
    pers_no:      document.getElementById('persNo').value,
    designation:  document.getElementById('designation').value,
    pan:          document.getElementById('pan').value,
    department:   document.getElementById('department').value,
    doj:          document.getElementById('doj').value,
    pf_no:        document.getElementById('pfNo').value,
    uan:          document.getElementById('uan').value,
    bank_name:    document.getElementById('bankName').value,
    bank_account: document.getElementById('bankAccount').value
  };
}

function formatPayPeriod(dateStr) {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function clearForm() {
  currentEmployeeId = null;
  ['empName','persNo','designation','pan','department','doj','pfNo','uan','bankAccount',
   'basicPay', 'travelallowance','mealCoupon','profTax','medInsurance','sodexo','leavesTaken']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('payFrom').value = '';
  document.getElementById('payTo').value = '';
  document.getElementById('paidDays').value = '';
  document.getElementById('bankName').value = '';
  recalcAll();
  toast('Form cleared', 'info');
}

// ══ EMPLOYEE DIRECTORY ════════════════════════════

async function loadEmployees(query = '') {
  try {
    const res = await fetch(`${API}/employees?q=${encodeURIComponent(query)}`);
    const employees = await res.json();
    renderEmployeeTable(employees);
  } catch(err) {
    document.getElementById('empTableBody').innerHTML =
      `<tr><td colspan="9" class="text-center py-4 text-danger">Server not reachable. Start the Node.js server first.</td></tr>`;
  }
}

function renderEmployeeTable(employees) {
  const tbody = document.getElementById('empTableBody');
  if (!employees.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-muted">No employees found.</td></tr>`;
    return;
  }
  tbody.innerHTML = employees.map((e, i) => `
    <tr>
      <td>${i+1}</td>
      <td><b>${e.name}</b></td>
      <td>${e.pers_no || '-'}</td>
      <td>${e.designation || '-'}</td>
      <td>${e.department || '-'}</td>
      <td>${e.doj || '-'}</td>
      <td>${e.pan || '-'}</td>
      <td>${e.bank_name || '-'}</td>
      <td>
        <div class="action-btns">
          <button class="btn-sm view" onclick="viewEmployeePayslips(${e.id},'${e.name}')"><i class="bi bi-eye"></i> View</button>
          <button class="btn-sm edit" onclick="editEmployee(${e.id})"><i class="bi bi-pencil"></i> Edit</button>
          <button class="btn-sm del" onclick="deleteEmployee(${e.id})"><i class="bi bi-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function searchEmployees(val) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => loadEmployees(val), 300);
}

function clearSearch() {
  document.getElementById('empSearch').value = '';
  loadEmployees();
}

async function viewEmployeePayslips(empId, empName) {
  document.getElementById('modalTitle').textContent = `${empName} – Payslips`;
  document.getElementById('empPayslipsModal').style.display = 'flex';
  document.getElementById('modalBody').innerHTML = '<p class="text-center text-muted py-3">Loading…</p>';

  try {
    const res = await fetch(`${API}/payslips/${empId}`);
    const slips = await res.json();
    if (!slips.length) {
      document.getElementById('modalBody').innerHTML = '<p class="text-center text-muted py-3">No payslips found for this employee.</p>';
      return;
    }
    document.getElementById('modalBody').innerHTML = `
      <table class="emp-table">
        <thead><tr>
          <th>#</th><th>Pay Period</th><th>Paid Days</th>
          <th>Net Pay (₹)</th><th>Total Earnings</th><th>Action</th>
        </tr></thead>
        <tbody>
          ${slips.map((s,i) => `
            <tr>
              <td>${i+1}</td>
              <td>${s.pay_from} to ${s.pay_to}</td>
              <td>${s.paid_days}</td>
              <td><b>₹ ${parseFloat(s.net_pay).toFixed(2)}</b></td>
              <td>₹ ${parseFloat(s.total_earnings).toFixed(2)}</td>
              <td>
                <button class="btn-sm view" onclick="showPayslipView(${s.id});closeEmpModal()">
                  <i class="bi bi-eye"></i> View
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;
  } catch(err) {
    document.getElementById('modalBody').innerHTML = '<p class="text-center text-danger">Error loading payslips.</p>';
  }
}

async function editEmployee(empId) {
  try {
    const res = await fetch(`${API}/employees/${empId}`);
    const e = await res.json();
    currentEmployeeId = e.id;

    document.getElementById('empName').value       = e.name || '';
    document.getElementById('persNo').value        = e.pers_no || '';
    document.getElementById('designation').value   = e.designation || '';
    document.getElementById('pan').value           = e.pan || '';
    document.getElementById('department').value    = e.department || '';
    document.getElementById('doj').value           = e.doj || '';
    document.getElementById('pfNo').value          = e.pf_no || '';
    document.getElementById('uan').value           = e.uan || '';
    document.getElementById('bankName').value      = e.bank_name || '';
    document.getElementById('bankAccount').value   = e.bank_account || '';

    showTab('form');
    toast(`Editing: ${e.name}`, 'info');
  } catch(err) {
    toast('Error loading employee', 'error');
  }
}

async function deleteEmployee(empId) {
  if (!confirm('Delete this employee and all their payslips? This cannot be undone.')) return;
  try {
    await fetch(`${API}/employees/${empId}`, { method: 'DELETE' });
    toast('Employee deleted', 'success');
    loadEmployees();
  } catch(err) {
    toast('Error deleting employee', 'error');
  }
}

function closeEmpModal() { document.getElementById('empPayslipsModal').style.display = 'none'; }
function closeModal(e) { if (e.target.className === 'modal-overlay') closeEmpModal(); }

// ══ PAYSLIP VIEW ══════════════════════════════════

async function showPayslipView(slipId) {
  showTab('view');
  try {
    const res = await fetch(`${API}/payslip/${slipId}`);
    const s = await res.json();
    document.getElementById('payslipViewWrap').innerHTML = buildPayslipHTML(s);
  } catch(err) {
    document.getElementById('payslipViewWrap').innerHTML = '<p class="text-center text-danger mt-4">Error loading payslip.</p>';
  }
}

function buildPayslipHTML(s) {
  const f = n => parseFloat(n || 0).toFixed(2);
  const hra = parseFloat(s.hra || 0);
  const leaveDeduct = parseFloat(s.total_deductions || 0) - parseFloat(s.ee_pf_contribution || 0)
                    - parseFloat(s.prof_tax || 0) - parseFloat(s.med_insurance || 0) - parseFloat(s.sodexo_deduction || 0);

  return `
  <div class="payslip-view-card" id="printable">
    <div class="pv-header">
      <img src="images/NRSoftechlogo.png" alt="Logo" class="pv-logo" />
      <div>
        <div class="pv-company-name">NR SOFTECH (I) PVT. LTD.</div>
        <div class="pv-company-sub">Payslip / Salary Slip</div>
      </div>
    </div>
    <div class="pv-rainbow"></div>

    <div class="pv-details">
      <div class="pv-det-row">
        <div class="pv-det-lft"><b>Name:</b> ${s.name || ''}</div>
        <div class="pv-det-rgt"><b>Pers. No:</b> ${s.pers_no || ''}</div>
      </div>
      <div class="pv-det-row">
        <div class="pv-det-lft"><b>Designation:</b> ${s.designation || ''}</div>
        <div class="pv-det-rgt"><b>PAN:</b> ${s.pan || ''}</div>
      </div>
      <div class="pv-det-row">
        <div class="pv-det-lft"><b>Department:</b> ${s.department || ''}</div>
        <div class="pv-det-rgt"><b>DOJ:</b> ${s.doj || ''}</div>
      </div>
      <div class="pv-det-row">
        <div class="pv-det-lft"><b>Pay Period:</b> ${s.pay_from || ''} to ${s.pay_to || ''}</div>
        <div class="pv-det-rgt"><b>Paid Days:</b> ${s.paid_days || ''}</div>
      </div>
      <div class="pv-det-row">
        <div class="pv-det-lft"><b>PF No:</b> ${s.pf_no || ''}</div>
        <div class="pv-det-rgt"><b>UAN:</b> ${s.uan || ''}</div>
      </div>
    </div>

    <div class="pv-col-header">
      <div class="pv-col-h-lbl">Component</div>
      <div class="pv-col-h-cur">Current Period (₹)</div>
      <div class="pv-col-h-ytd">Year to Date (₹)</div>
    </div>

    <div class="pv-section">
      <div class="pv-sec-label earn">▲ EARNINGS</div>
      <div class="pv-line"><span class="n">Basic Pay</span><span class="c">${f(s.basic_pay)}</span><span class="y">${f(s.basic_pay*12)}</span></div>
      <div class="pv-line"><span class="n">H.R.A. (50%)</span><span class="c">${f(hra)}</span><span class="y">${f(hra*12)}</span></div>
      <div class="pv-line">
  <span class="n">Travel Allowance</span>
  <span class="c">${f(s.travel_allowance)}</span>
  <span class="y">${f(s.travel_allowance * 12)}</span>
</div>
      <div class="pv-line"><span class="n">Meal Coupon</span><span class="c">${f(s.meal_coupon)}</span><span class="y">${f(s.meal_coupon*12)}</span></div>
      <div class="pv-line total"><span class="n">*** Total Earnings</span><span class="c">${f(s.total_earnings)}</span><span class="y">${f(s.total_earnings*12)}</span></div>
    </div>

    <div class="pv-divider"></div>

    <div class="pv-section">
      <div class="pv-sec-label tax">⊕ TAXES</div>
      <div class="pv-line"><span class="n">Income Tax</span><span class="c">${f(s.income_tax)}</span><span class="y">${f(s.income_tax*12)}</span></div>
      <div class="pv-line total"><span class="n">*** Total Tax</span><span class="c">${f(s.total_tax)}</span><span class="y">${f(s.total_tax*12)}</span></div>
    </div>

    <div class="pv-divider"></div>

    <div class="pv-section">
      <div class="pv-sec-label ded">▼ DEDUCTIONS</div>
      <div class="pv-line"><span class="n">Ee PF Contribution (12%)</span><span class="c">${f(s.ee_pf_contribution)}</span><span class="y">${f(s.ee_pf_contribution*12)}</span></div>
      <div class="pv-line"><span class="n">Prof Tax – Full Period</span><span class="c">${f(s.prof_tax)}</span><span class="y">${f(s.prof_tax*12)}</span></div>
      <div class="pv-line"><span class="n">Med. Insurance – Sr. Citizen</span><span class="c">${f(s.med_insurance)}</span><span class="y">${f(s.med_insurance*12)}</span></div>
      <div class="pv-line"><span class="n">Sodexo Deduction</span><span class="c">${f(s.sodexo_deduction)}</span><span class="y">${f(s.sodexo_deduction*12)}</span></div>
      <div class="pv-line total"><span class="n">*** Total Deductions</span><span class="c">${f(s.total_deductions)}</span><span class="y">${f(s.total_deductions*12)}</span></div>
    </div>

    <div class="pv-divider"></div>

    <div class="pv-section">
      <div class="pv-sec-label bank">★ DIRECT DEPOSIT INFORMATION</div>
      <div class="pv-bank-row">
        <div class="pv-bank-col"><b>Bank Name:</b> ${s.bank_name || '-'}</div>
        <div class="pv-bank-col"><b>Bank Account:</b> ${s.bank_account || '-'}</div>
      </div>
    </div>

    <div class="pv-divider"></div>

    <div class="pv-formula">
      <div class="pv-formula-bar">FORMULA: NET PAY = TOTAL EARNINGS – TOTAL TAXES – TOTAL DEDUCTIONS</div>
      <div class="pv-formula-vals">
        <div class="pv-fv-box net"><div class="pv-fv-lbl">NET PAY</div><div class="pv-fv-val">₹ ${f(s.net_pay)}</div></div>
        <div class="pv-fv-eq">=</div>
        <div class="pv-fv-box earn"><div class="pv-fv-lbl">TOTAL EARNINGS</div><div class="pv-fv-val">₹ ${f(s.total_earnings)}</div></div>
        <div class="pv-fv-eq">–</div>
        <div class="pv-fv-box tax"><div class="pv-fv-lbl">TOTAL TAXES</div><div class="pv-fv-val">₹ ${f(s.total_tax)}</div></div>
        <div class="pv-fv-eq">–</div>
        <div class="pv-fv-box ded"><div class="pv-fv-lbl">TOTAL DEDUCTIONS</div><div class="pv-fv-val">₹ ${f(s.total_deductions)}</div></div>
      </div>
    </div>
  </div>`;
}

function downloadPayslip() {
  window.print();
}

// ══ INIT ══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  showTab('form');
  recalcAll();
});
