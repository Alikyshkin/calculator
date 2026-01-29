const { createApp, ref } = Vue;

const SAFE_EXPRESSION_REGEX = /^[\d\s+\-*/().]+$/;

const BUTTON_CLASSES = {
  digit: 'py-3 text-lg font-medium bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 active:bg-slate-100 transition-colors',
  operator: 'py-3 text-lg bg-amber-100 border border-amber-200 rounded-lg hover:bg-amber-200 transition-colors',
  equals: 'py-3 text-lg font-medium bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 active:bg-blue-700 transition-colors',
  clear: 'col-span-4 py-3 text-lg font-medium bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600 active:bg-red-700 transition-colors',
};

const BUTTONS_LAYOUT = [
  { label: '7', value: 7, variant: 'digit', ariaLabel: 'Цифра 7' },
  { label: '8', value: 8, variant: 'digit', ariaLabel: 'Цифра 8' },
  { label: '9', value: 9, variant: 'digit', ariaLabel: 'Цифра 9' },
  { label: '/', value: '/', variant: 'operator', ariaLabel: 'Деление' },
  { label: '4', value: 4, variant: 'digit', ariaLabel: 'Цифра 4' },
  { label: '5', value: 5, variant: 'digit', ariaLabel: 'Цифра 5' },
  { label: '6', value: 6, variant: 'digit', ariaLabel: 'Цифра 6' },
  { label: '*', value: '*', variant: 'operator', ariaLabel: 'Умножение' },
  { label: '1', value: 1, variant: 'digit', ariaLabel: 'Цифра 1' },
  { label: '2', value: 2, variant: 'digit', ariaLabel: 'Цифра 2' },
  { label: '3', value: 3, variant: 'digit', ariaLabel: 'Цифра 3' },
  { label: '−', value: '-', variant: 'operator', ariaLabel: 'Минус' },
  { label: '0', value: 0, variant: 'digit', ariaLabel: 'Цифра 0' },
  { label: '.', value: '.', variant: 'digit', ariaLabel: 'Десятичная точка' },
  { label: '=', value: '=', variant: 'equals', ariaLabel: 'Равно, вычислить' },
  { label: '+', value: '+', variant: 'operator', ariaLabel: 'Плюс' },
  { label: 'C', value: 'C', variant: 'clear', ariaLabel: 'Очистить' },
];

const app = createApp({
  setup() {
    const getButtonClass = (variant) => BUTTON_CLASSES[variant] || '';
    const display = ref('');
    const history = ref([]);
    let idCounter = 0;

    const append = (value) => {
      display.value += String(value);
    };

    const clearDisplay = () => {
      display.value = '';
    };

    const calculate = () => {
      const expr = display.value.trim();
      if (!expr) return;

      if (!SAFE_EXPRESSION_REGEX.test(expr)) {
        display.value = 'Error';
        return;
      }

      try {
        const result = Function('"use strict"; return (' + expr + ')')();
        const num = Number(result);
        if (!Number.isFinite(num)) {
          display.value = 'Error';
          return;
        }
        history.value.unshift({
          id: idCounter++,
          expression: expr,
          result: num,
        });
        display.value = String(num);
      } catch {
        display.value = 'Error';
      }
    };

    const onButtonClick = (value) => {
      if (value === 'C') clearDisplay();
      else if (value === '=') calculate();
      else append(value);
    };

    return {
      display,
      history,
      buttons: BUTTONS_LAYOUT,
      getButtonClass,
      onButtonClick,
    };
  },
});

app.mount('#app');
