function throttle(fn, delay) {
  let timer = null;
  return function (...args) {
    if (timer) {
      return;
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
  let lastTimer = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTimer >= delay) {
      fn.apply(this, args);
      lastTimer = now;
    }
  };
}
function throttle(fn, delay) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}
