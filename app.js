const { createApp, ref } = Vue;

createApp({
  setup() {
    const display = ref('');
    const history = ref([]);
    let idCounter = 0;

    const append = (val) => {
      display.value += val.toString();
    };

    const clearDisplay = () => {
      display.value = '';
    };

    const calculate = () => {
      try {
        const result = Function('return ' + display.value)();
        history.value.unshift({
          id: idCounter++,
          expression: display.value,
          result,
        });
        display.value = result.toString();
      } catch (e) {
        display.value = 'Error';
      }
    };

    return { display, history, append, clearDisplay, calculate };
  },
}).mount('#app');
