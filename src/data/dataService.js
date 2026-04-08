import * as XLSX from 'xlsx';

// Main row month columns: Jan=4, Feb=7, Mar=10, ... Dec=37, Total=40
const MAIN_MONTH_COLS = [4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37];
const MAIN_TOTAL_COL = 40;

// Sub-item month columns (Visa breakdowns): Jan=3, Feb=6, Mar=9, ... Dec=36, Total=39
const SUB_MONTH_COLS = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
const SUB_TOTAL_COL = 39;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function safeNum(val) {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[$,]/g, '').trim();
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

function extractMonthly(row, cols) {
  return cols.map(c => safeNum(row?.[c]));
}

function extractTotal(row, col) {
  return safeNum(row?.[col]);
}

function findRow(data, label) {
  const target = label.toLowerCase().trim();
  for (let i = 0; i < data.length; i++) {
    const cell = data[i]?.[1];
    if (cell != null) {
      const text = String(cell).toLowerCase().trim();
      if (text.includes(target)) return i;
    }
  }
  return -1;
}

function findRowExact(data, label) {
  const target = label.toLowerCase().replace(/\s+/g, ' ').trim();
  for (let i = 0; i < data.length; i++) {
    const cell = data[i]?.[1];
    if (cell != null) {
      const text = String(cell).toLowerCase().replace(/\s+/g, ' ').trim();
      if (text === target) return i;
    }
  }
  return -1;
}

function findRowByIndex(data, label, startFrom = 0) {
  const target = label.toLowerCase().trim();
  for (let i = startFrom; i < data.length; i++) {
    const cell = data[i]?.[1];
    if (cell != null) {
      const text = String(cell).toLowerCase().trim();
      if (text.includes(target)) return i;
    }
  }
  return -1;
}

function getRowData(data, rowIdx, cols) {
  if (rowIdx < 0 || !data[rowIdx]) return new Array(cols.length).fill(0);
  return extractMonthly(data[rowIdx], cols);
}

function getRowTotal(data, rowIdx, col) {
  if (rowIdx < 0 || !data[rowIdx]) return 0;
  return extractTotal(data[rowIdx], col);
}

function lastNonNull(arr) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] !== 0 && arr[i] != null) return arr[i];
  }
  return 0;
}

export function parseFinancials(workbook) {
  const sheet = workbook.Sheets['RS P&L - 2025'];
  if (!sheet) throw new Error('Sheet "RS P&L - 2025" not found');

  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // --- INCOME ---
  const totalPersonalIncomeRow = findRow(data, 'TOTAL PERSONAL INCOME');
  const totalTrustIncomeRow = findRow(data, 'TOTAL TRUST INCOME');
  const incomeTotalRow = findRow(data, 'INCOME - TOTAL');

  const personalIncome = getRowData(data, totalPersonalIncomeRow, MAIN_MONTH_COLS);
  const trustIncome = getRowData(data, totalTrustIncomeRow, MAIN_MONTH_COLS);
  const totalIncome = getRowData(data, incomeTotalRow, MAIN_MONTH_COLS);

  // Income line items (use col 40 totals)
  const ltcReimbRow = findRow(data, '9553  long term care reimb');
  const socialSecRow = findRow(data, '9553  social security');
  const trustTransferRow = findRow(data, '5777 other');
  const rentalIncomeRow = findRow(data, '3952  rental income');
  const brokerageClosedRow = findRow(data, '7850  brokerage');

  // Interest: combine 9553 Interest + 5777 Interest + 3952 VV1 Interest
  const interest9553Row = findRowByIndex(data, '9553  interest', 0);
  const interest5777Row = findRow(data, '5777  interest');
  const interestVV1Row = findRow(data, '3952  vv1 interest');

  const incomeBreakdown = {
    ltcReimbursement: getRowTotal(data, ltcReimbRow, MAIN_TOTAL_COL),
    socialSecurity: getRowTotal(data, socialSecRow, MAIN_TOTAL_COL),
    trustTransfers: getRowTotal(data, trustTransferRow, MAIN_TOTAL_COL),
    rentalIncome: getRowTotal(data, rentalIncomeRow, MAIN_TOTAL_COL),
    brokerageClosed: getRowTotal(data, brokerageClosedRow, MAIN_TOTAL_COL),
    interest:
      getRowTotal(data, interest9553Row, MAIN_TOTAL_COL) +
      getRowTotal(data, interest5777Row, MAIN_TOTAL_COL) +
      getRowTotal(data, interestVV1Row, MAIN_TOTAL_COL),
  };

  // --- EXPENSES ---
  const totalPersonalExpensesRow = findRow(data, 'TOTAL PERSONAL EXPENSES');
  const totalTrustExpensesRow = findRow(data, 'TOTAL TRUST EXPENSES');
  const expenseTotalRow = findRow(data, 'EXPENSE - TOTAL');

  const personalExpenses = getRowData(data, totalPersonalExpensesRow, MAIN_MONTH_COLS);
  const trustExpenses = getRowData(data, totalTrustExpensesRow, MAIN_MONTH_COLS);
  const totalExpenses = getRowData(data, expenseTotalRow, MAIN_MONTH_COLS);

  // VISA CC total (main cols)
  const visaCCRow = findRow(data, 'visa cc');
  const visaTotal = getRowTotal(data, visaCCRow, MAIN_TOTAL_COL);

  // Visa sub-items (use SUB columns for totals)
  const visaClothingRow = findRow(data, 'visa  clothing');
  const visaMealsRow = findRow(data, 'visa meals/entertainment');
  const visaPersonalSuppliesRow = findRow(data, 'visa personal supplies');
  const visaMedicalRow = findRow(data, 'visa medical');
  const visaPharmacyRow = findRow(data, 'visa pharmacy/medication');
  const visaHairRow = findRow(data, 'visa hair & nails');
  const visaAideRow = findRow(data, 'visa aide');
  const blueCrossRow = findRow(data, 'blue cross - blue shield');

  const visaClothing = getRowTotal(data, visaClothingRow, SUB_TOTAL_COL);
  const visaMeals = getRowTotal(data, visaMealsRow, SUB_TOTAL_COL);
  const visaPersonalSupplies = getRowTotal(data, visaPersonalSuppliesRow, SUB_TOTAL_COL);
  const visaMedical = getRowTotal(data, visaMedicalRow, SUB_TOTAL_COL);
  const visaPharmacy = getRowTotal(data, visaPharmacyRow, SUB_TOTAL_COL);
  const visaHairNails = getRowTotal(data, visaHairRow, SUB_TOTAL_COL);
  const visaAide = getRowTotal(data, visaAideRow, SUB_TOTAL_COL);
  const blueCross = getRowTotal(data, blueCrossRow, MAIN_TOTAL_COL);

  const visaKnown = visaClothing + visaMeals + visaPersonalSupplies + visaMedical +
    visaPharmacy + visaHairNails + visaAide;
  const visaOther = Math.max(0, visaTotal - visaKnown - blueCross);

  // VV1 expenses (main cols, col 40 totals)
  const hoaRow = findRow(data, 'hoa');
  const taxesRow = findRowByIndex(data, 'taxes', 70);
  const repairRow = findRow(data, 'visa repair + maintenance');
  const llcRow = findRow(data, 'njgov llc registration');
  const utilitiesRow = findRowByIndex(data, 'utilities', 70);
  const insuranceRow = findRowByIndex(data, 'insurance', 70);
  const townshipRow = findRow(data, 'township');

  // Other expense items
  const aideHelpRow = findRow(data, 'aide help');
  const ltcOutPersonalRow = findRow(data, 'asst living/ltc reimbursement');
  const ltcOutTrustRow = findRow(data, 'reimbursement to ws for ltc');

  // Professional fees: Accountant + Bookkeeper + Legal
  const accountantRow = findRow(data, 'accountant');
  const bookkeeperRow = findRow(data, 'bookkeeper');
  const legalRow = findRow(data, 'legal');

  // --- NET ---
  const netIncomeRow = findRow(data, 'net income');
  const netMonthly = getRowData(data, netIncomeRow, MAIN_MONTH_COLS);

  // --- BALANCES ---
  const bal9553Row = findRowByIndex(data, '9553   (main cking)', 100);
  const bal5777Row = findRowByIndex(data, '5777    (main cking)', 100);
  const bal3952Row = findRowByIndex(data, '3952   (vv1 main cking)', 100);
  const bal6121Row = findRowByIndex(data, '6121   (vv1 sec deposit)', 100);
  const bal5299Row = findRowByIndex(data, '5299   (brokerage)', 100);
  const totalPersonalBalRow = findRow(data, 'total personal balance');
  const totalTrustBalRow = findRow(data, 'total trust balance');
  const grandTotalBalRow = findRowByIndex(data, 'total balance', 115);

  const balances = {
    personal9553: getRowData(data, bal9553Row, MAIN_MONTH_COLS),
    trust5777: getRowData(data, bal5777Row, MAIN_MONTH_COLS),
    trust5299: getRowData(data, bal5299Row, MAIN_MONTH_COLS),
    vv13952: getRowData(data, bal3952Row, MAIN_MONTH_COLS),
    vv16121: getRowData(data, bal6121Row, MAIN_MONTH_COLS),
    totalPersonal: getRowData(data, totalPersonalBalRow, MAIN_MONTH_COLS),
    totalTrust: getRowData(data, totalTrustBalRow, MAIN_MONTH_COLS),
    grandTotal: getRowData(data, grandTotalBalRow, MAIN_MONTH_COLS),
  };

  const incomeYtd = getRowTotal(data, incomeTotalRow, MAIN_TOTAL_COL) ||
    totalIncome.reduce((a, b) => a + b, 0);
  const expenseYtd = getRowTotal(data, expenseTotalRow, MAIN_TOTAL_COL) ||
    totalExpenses.reduce((a, b) => a + b, 0);
  const netYtd = getRowTotal(data, netIncomeRow, MAIN_TOTAL_COL) ||
    netMonthly.reduce((a, b) => a + b, 0);

  return {
    months: MONTHS,
    income: {
      personal: personalIncome,
      trust: trustIncome,
      total: totalIncome,
      ytdTotal: incomeYtd,
      breakdown: incomeBreakdown,
    },
    expenses: {
      personal: personalExpenses,
      trust: trustExpenses,
      total: totalExpenses,
      ytdTotal: expenseYtd,
      visa: {
        total: visaTotal,
        clothing: visaClothing,
        meals: visaMeals,
        personalSupplies: visaPersonalSupplies,
        medical: visaMedical,
        pharmacy: visaPharmacy,
        hairAndNails: visaHairNails,
        aide: visaAide,
        blueCross: blueCross,
        other: visaOther,
      },
      vv1: {
        hoa: getRowTotal(data, hoaRow, MAIN_TOTAL_COL),
        taxes: getRowTotal(data, taxesRow, MAIN_TOTAL_COL),
        repairMaintenance: getRowTotal(data, repairRow, MAIN_TOTAL_COL),
        llcRegistration: getRowTotal(data, llcRow, MAIN_TOTAL_COL),
        utilities: getRowTotal(data, utilitiesRow, MAIN_TOTAL_COL),
        insurance: getRowTotal(data, insuranceRow, MAIN_TOTAL_COL),
        township: getRowTotal(data, townshipRow, MAIN_TOTAL_COL),
      },
      aideCare: getRowTotal(data, aideHelpRow, MAIN_TOTAL_COL),
      ltcReimbursementOut:
        getRowTotal(data, ltcOutPersonalRow, MAIN_TOTAL_COL) +
        getRowTotal(data, ltcOutTrustRow, MAIN_TOTAL_COL),
      professional:
        getRowTotal(data, accountantRow, MAIN_TOTAL_COL) +
        getRowTotal(data, bookkeeperRow, MAIN_TOTAL_COL) +
        getRowTotal(data, legalRow, MAIN_TOTAL_COL),
    },
    net: {
      monthly: netMonthly,
      ytdTotal: netYtd,
    },
    balances,
    accounts: [
      { id: '9553', name: 'Main Checking', type: 'Personal', status: 'active' },
      { id: '5777', name: 'Trust Checking', type: 'Trust', status: 'active' },
      { id: '5299', name: 'Trust Brokerage', type: 'Trust', status: 'active' },
      { id: '3952', name: 'VV1 Checking', type: 'Rental', status: 'active' },
      { id: '6121', name: 'VV1 Security Deposit', type: 'Rental', status: 'active' },
      { id: '9914', name: 'Checking (Closed)', type: 'Personal', status: 'closed', closedDate: 'Feb 2025' },
      { id: '7850', name: 'Brokerage (Closed)', type: 'Personal', status: 'closed', closedDate: 'Feb 2025' },
    ],
    _lastNonNull: lastNonNull,
  };
}

export async function loadFinancialsFromUrl(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
  return parseFinancials(workbook);
}

export function loadFinancialsFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        resolve(parseFinancials(workbook));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
