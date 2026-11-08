// Web Worker for unthrottled background timer
// Browsers clamp setInterval in hidden tabs to 1min+, but Web Workers are NEVER throttled!

let timerId = null;

self.onmessage = function (e) {
  const data = e.data || {};
  if (data.action === 'start') {
    if (timerId) clearInterval(timerId);
    const interval = data.interval || 5000;
    timerId = setInterval(function () {
      self.postMessage({ type: 'tick', timestamp: Date.now() });
    }, interval);
  } else if (data.action === 'stop') {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }
};
