const historyKey = 'history';


let history = [];

try {
  let newHistory = JSON.parse(sessionStorage.getItem(historyKey));
  if (Array.isArray(newHistory)) {
    history = newHistory;
  }
} catch (error) {
  console.error('[photon-history-helper] Invalid history in local storage, replacing it by an empty history',
      sessionStorage.getItem(historyKey));
}

function flush() {
  sessionStorage.setItem(historyKey, JSON.stringify(history));
}

function list() {
  return history;
}

function push(context) {
  history.push(context);
  flush();
}

function pop() {
  history.pop();
  flush();
}

function shift() {
  history.shift();
  flush();
}

function get(id) {
  return history[id];
}

function last() {
  return history[history.length-1];
}

function clean() {
  return localStorage.removeItem(historyKey);
}

function replace(newHistory) {
  history = newHistory;
  flush();
}

const historyHelper = { flush, list, push, pop, shift, get, last, clean, replace };

export default historyHelper;
export { flush, list, push, pop, shift, get, last, clean, replace };

