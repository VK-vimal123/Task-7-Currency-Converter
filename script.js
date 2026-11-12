// script.js
// Currency Converter functionality using ExchangeRate-API

// List of supported currencies with display name and flag country code (ISO 3166-1 alpha-2)
const currencies = [
  {code: 'USD', name: 'US Dollar', flag: 'us'},
  {code: 'INR', name: 'Indian Rupee', flag: 'in'},
  {code: 'EUR', name: 'Euro', flag: 'eu'},
  {code: 'GBP', name: 'British Pound', flag: 'gb'},
  {code: 'JPY', name: 'Japanese Yen', flag: 'jp'},
  {code: 'AED', name: 'UAE Dirham', flag: 'ae'},
  {code: 'AUD', name: 'Australian Dollar', flag: 'au'},
  {code: 'CAD', name: 'Canadian Dollar', flag: 'ca'},
  {code: 'SGD', name: 'Singapore Dollar', flag: 'sg'},
];

const amountInput = document.getElementById('amount');
const fromSelect = document.getElementById('fromCurrency');
const toSelect = document.getElementById('toCurrency');
const swapBtn = document.getElementById('swapBtn');
const convertBtn = document.getElementById('convertBtn');
const resultDiv = document.getElementById('result');
const convertedAmountP = resultDiv.querySelector('.converted-amount');
const rateInfoP = resultDiv.querySelector('.rate-info');
const updatedTimeP = resultDiv.querySelector('.updated-time');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const popularList = document.getElementById('popularList');
const currencyList = document.getElementById('currencyList');

/** Populate <select> elements with currency options */
function populateSelects() {
  currencies.forEach(cur => {
    const optionFrom = document.createElement('option');
    optionFrom.value = cur.code;
    optionFrom.textContent = `${cur.code} – ${cur.name}`;
    fromSelect.appendChild(optionFrom);

    const optionTo = optionFrom.cloneNode(true);
    toSelect.appendChild(optionTo);
  });
  // default selections
  fromSelect.value = 'USD';
  toSelect.value = 'INR';
}

/** Populate supported currencies grid with flag icons */
function populateSupported() {
  currencies.forEach(cur => {
    const li = document.createElement('li');
    const img = document.createElement('img');
    img.src = `https://flagcdn.com/16x12/${cur.flag}.png`;
    img.alt = cur.flag;
    const span = document.createElement('span');
    span.textContent = `${cur.code} – ${cur.name}`;
    li.appendChild(img);
    li.appendChild(span);
    currencyList.appendChild(li);
  });
}

/** Show loading spinner */
function setLoading(show) {
  loadingDiv.classList.toggle('hidden', !show);
}
/** Show error message */
function setError(msg) {
  errorDiv.textContent = msg;
  errorDiv.classList.remove('hidden');
  resultDiv.classList.add('hidden');
}
/** Clear error */
function clearError() {
  errorDiv.classList.add('hidden');
  errorDiv.textContent = '';
}
/** Fetch rates for a base currency */
async function fetchRates(base) {
  const url = `https://open.er-api.com/v6/latest/${base}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('Network response was not ok');
  const data = await resp.json();
  if (data.result !== 'success') throw new Error(data['error-type'] || 'API error');
  return data; // contains rates, time_last_update_utc, etc.
}

/** Perform conversion */
async function convert() {
  clearError();
  const amt = parseFloat(amountInput.value);
  if (isNaN(amt) || amt <= 0) {
    setError('Please enter a positive amount.');
    return;
  }
  const from = fromSelect.value;
  const to = toSelect.value;
  if (from === to) {
    setError('From and To currencies must differ.');
    return;
  }
  setLoading(true);
  try {
    const data = await fetchRates(from);
    const rate = data.rates[to];
    if (!rate) throw new Error('Target currency not available in API response');
    const converted = (amt * rate).toFixed(4);
    convertedAmountP.textContent = `${amt} ${from} = ${converted} ${to}`;
    rateInfoP.textContent = `1 ${from} = ${rate} ${to}`;
    updatedTimeP.textContent = `Last updated: ${data.time_last_update_utc}`;
    resultDiv.classList.remove('hidden');
  } catch (e) {
    setError(`Conversion failed: ${e.message}`);
  } finally {
    setLoading(false);
  }
}

/** Swap currencies */
function swapCurrencies() {
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;
}

/** Populate popular rates (USD base) */
async function loadPopular() {
  try {
    const data = await fetchRates('USD');
    const usdRates = data.rates;
    // Show a subset – the same list as supported
    currencies.forEach(cur => {
      if (cur.code === 'USD') return;
      const div = document.createElement('div');
      div.textContent = `1 USD = ${usdRates[cur.code]} ${cur.code}`;
      popularList.appendChild(div);
    });
  } catch (e) {
    // silently ignore for now
  }
}

// Event listeners
swapBtn.addEventListener('click', swapCurrencies);
convertBtn.addEventListener('click', convert);

// Initialise UI
populateSelects();
populateSupported();
loadPopular();

