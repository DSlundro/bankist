'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const accounts = [
  {
    owner: 'Jonas Schmedtmann',
    movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
    interestRate: 1.2, // %
    pin: 1111,
  },
  {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,
  },
  {
    owner: 'Steven Thomas Williams',
    movements: [200, -200, 340, -300, -20, 50, 400, -460],
    interestRate: 0.7,
    pin: 3333,
  },
  {
    owner: 'Sarah Smith',
    movements: [430, 1000, 700, 50, 90],
    interestRate: 1,
    pin: 4444,
  },
];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
/* CREATE USERNAME */
const createUsernames = accounts => 
  accounts
  .forEach(account => account.username = account.owner
    .toLowerCase()
    .split(' ')
    .map(e => e[0])
    .join(''));
createUsernames(accounts);

/* CREATE DOM ELEMENTS */
const displayMovements = (movements, sort = false) =>{
  containerMovements.innerHTML = ''
  // Sort
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements

  movs.forEach((mov, i)=>{
  const type = mov > 0 ? 'deposit' : 'withdrawal'

    const html = ` 
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${i+1} ${type}</div>
      <div class="movements__value">${mov}€</div>
    </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html)
  });
};

/* CALCULATE SUMMARY */
const calcDisplaySummary = account =>{
  const incomes = account.movements
  .filter(mov => mov > 0)
  .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${Math.abs(incomes)}€`;

  const out = account.movements
  .filter(mov => mov < 0)
  .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;

  const interest = account.movements
  .filter(mov => mov > 0)
  .map(dep => dep * account.interestRate/100)
  .reduce((acc, mov) => acc + mov, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`
};

/* CALCULATE BALANCE */
const calcDisplayBalance = account => {
  account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${account.balance}€`;

};

/* UPDATE UI */
const updateUI = (account) => {
  // Display movements
  displayMovements(account.movements);
  // Display balance
  calcDisplayBalance(account);
  // Display summary
  calcDisplaySummary(account);
};

/* CLEAR INPUTS */
const clearInput = (x, y) => {
  x.value = ''; 
  y.value = '';
};

/* FOCUS OUT INPUTS */
const focusOutInput = (x, y) =>{
    x.blur();
    y.blur();
};

/* LOGIN SISTEM */
let currentAccount;
btnLogin.addEventListener('click', e => {
  // prevent submit
  e.preventDefault();
  
  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);

  if(currentAccount?.pin === Number(inputLoginPin.value)){
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
    containerApp.style.opacity = 100;
    // Clear input fields
    clearInput(inputLoginPin, inputLoginUsername);
    // Focus out inputs
    focusOutInput(inputLoginPin, inputLoginUsername);
    // Update UI
    updateUI(currentAccount);
  }

});

/* TRANSFER MONEY */
btnTransfer.addEventListener('click', e => {
  e.preventDefault()

  const amount = Number(inputTransferAmount.value);
  const receiverAccount = accounts.find(acc => acc.username === inputTransferTo.value);

  if(
    amount > 0 && 
    receiverAccount && 
    currentAccount.balance >= amount && 
    receiverAccount?.username !== currentAccount.username)
    {
      // Doing the transfer
      currentAccount.movements.push(-amount);
      receiverAccount.movements.push(amount);
      // Update UI
      updateUI(currentAccount);
      // Clear input fields
      clearInput(inputTransferTo, inputTransferAmount);
      // Focus out inputs
      focusOutInput(inputTransferTo, inputTransferAmount);
    }
});

/* CLOSE ACCOUNT */
btnClose.addEventListener('click', e => {
  e.preventDefault()

  if(
    inputCloseUsername.value === currentAccount.username && 
    Number(inputClosePin.value) === currentAccount.pin)
    {
      const index = accounts.findIndex(acc => acc.username === currentAccount.username);
      // Delete account
      accounts.splice(index, 1);
      // Hide UI
      containerApp.style.opacity = 0;
    }
  // Clear input fields
  clearInput(inputClosePin, inputCloseUsername);
});

/* REQUEST LOAN */
btnLoan.addEventListener('click', e => {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);
  // il prestito viene concesso solo se c'è un deposito maggiore o uguale al 10% dell'importo del prestito richiesto
  if(amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)){
      // Add movement
      currentAccount.movements.push(amount);
      // Update UI
      updateUI(currentAccount);
    };
  clearInput(inputLoanAmount);
});

/* SORT ASCENDING */
let sorted = false
btnSort.addEventListener('click', e => {
  e.preventDefault();
  // Sort
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted
});


