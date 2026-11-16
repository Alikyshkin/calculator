const MAX_EXPRESSION_LENGTH = 180;
const MAX_HISTORY_LENGTH = 30;
const VALID_INPUT = /^[0-9.+*/()-]$/;
const START_NEW_EXPRESSION = /^[0-9.(]$/;
const KEY_ALIASES = new Map([[',', '.'], ['Enter', '='], ['Delete', 'Escape']]);
const COMMAND_KEYS = new Set(['=', 'Backspace', 'Escape']);
const display = document.getElementById('calc-display');
const context = document.getElementById('calc-context');
const status = document.getElementById('calc-status');
const historyList = document.getElementById('history-list');
const historyEmpty = document.getElementById('history-empty');

let expression = '';
let previousExpression = '';
let showingResult = false;

function evaluateExpression(source) {
  let cursor = 0;
  const numberPattern = /(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/iy;

  function readFactor() {
    const token = source[cursor];
    if (token === '+' || token === '-') {
      cursor += 1;
      const value = readFactor();
      return token === '-' ? -value : value;
    }
    if (token === '(') {
      cursor += 1;
      const value = readSum();
      if (source[cursor] !== ')') throw new Error('Закройте скобку.');
      cursor += 1;
      return value;
    }

    numberPattern.lastIndex = cursor;
    const match = numberPattern.exec(source);
    if (!match) throw new Error('Проверьте выражение.');
    cursor = numberPattern.lastIndex;
    return Number(match[0]);
  }

  function readProduct() {
    let value = readFactor();
    while (source[cursor] === '*' || source[cursor] === '/') {
      const operator = source[cursor++];
      const next = readFactor();
      if (operator === '/' && next === 0) throw new Error('На ноль делить нельзя.');
      value = operator === '*' ? value * next : value / next;
    }
    return value;
  }

  function readSum() {
    let value = readProduct();
    while (source[cursor] === '+' || source[cursor] === '-') {
      const operator = source[cursor++];
      const next = readProduct();
      value = operator === '+' ? value + next : value - next;
    }
    return value;
  }

  const result = readSum();
  if (cursor !== source.length) throw new Error('Проверьте выражение.');
  if (!Number.isFinite(result)) throw new Error('Число за пределами диапазона.');
  return Number.isInteger(result) ? result : Number(result.toPrecision(15));
}

function formatExpression(value) {
  return value.replaceAll('*', '×').replaceAll('/', '÷').replaceAll('-', '−');
}

function renderDisplay(message = '', announceOnly = false) {
  display.value = formatExpression(expression || '0');
  display.scrollLeft = display.scrollWidth;
  context.textContent = previousExpression ? formatExpression(previousExpression) + ' =' : '';
  status.textContent = message;
  status.classList.toggle('shows-message', Boolean(message) && !announceOnly);
}

function useResult(result, fromExpression) {
  expression = result;
  previousExpression = fromExpression;
  showingResult = true;
  renderDisplay('Результат: ' + formatExpression(result), true);
}

function addHistory(fromExpression, result) {
  const row = document.createElement('li');
  const button = document.createElement('button');
  const operation = document.createElement('span');
  const value = document.createElement('span');
  button.type = 'button';
  button.setAttribute('aria-label', 'Использовать результат: ' + fromExpression + ' = ' + result);
  button.addEventListener('click', () => useResult(result, fromExpression));
  operation.textContent = formatExpression(fromExpression) + ' =';
  value.textContent = formatExpression(result);
  button.append(operation, value);
  row.append(button);
  historyList.prepend(row);
  if (historyList.children.length > MAX_HISTORY_LENGTH) historyList.lastElementChild.remove();
  historyEmpty.hidden = true;
}

function calculate() {
  if (!expression || showingResult) return;
  const input = expression;
  try {
    const result = String(evaluateExpression(input));
    addHistory(input, result);
    useResult(result, input);
  } catch (error) {
    renderDisplay(error.message);
  }
}

function pressKey(key) {
  if (key === 'Escape') {
    expression = '';
    previousExpression = '';
    showingResult = false;
  } else if (key === '=') {
    calculate();
    return;
  } else if (key === 'Backspace') {
    expression = expression.slice(0, -1);
    previousExpression = '';
    showingResult = false;
  } else if (VALID_INPUT.test(key)) {
    if (showingResult && START_NEW_EXPRESSION.test(key)) expression = '';
    previousExpression = '';
    showingResult = false;
    if (expression.length >= MAX_EXPRESSION_LENGTH) {
      renderDisplay('Достигнута максимальная длина выражения.');
      return;
    }
    expression += key;
  }
  renderDisplay();
}

document.querySelector('.keypad').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-key]');
  if (button) pressKey(button.dataset.key);
});

document.addEventListener('keydown', (event) => {
  if (event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === 'Enter' && event.target instanceof HTMLButtonElement) return;

  const key = KEY_ALIASES.get(event.key) ?? event.key;
  const isExpressionKey = VALID_INPUT.test(key);
  if (!isExpressionKey && !COMMAND_KEYS.has(key)) return;

  event.preventDefault();
  if (event.target instanceof HTMLButtonElement && (isExpressionKey || key === 'Backspace')) {
    display.focus({ preventScroll: true });
  }
  pressKey(key);
});
