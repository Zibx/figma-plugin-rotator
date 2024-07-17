/** @function Store.debounce
 * @param {function} fn - function that would be called
 * @param {number} dt - delay before call
 * @param {boolean} [strictDelay = false] - delay would be
 * @description prevent multiple function calls
 * @returns {function}
 * */
export const debounce = function <A extends unknown[], R>(
  fn: (...args: A) => R,
  dt: number,
  strictDelay: boolean
): (...args: A) => void {
  let timeout = 0,
    args: A,
    scope: never,
    lastCall = 0;

  const realCall = function (): number | void {
    if (strictDelay) {
      const now = +new Date();
      if (lastCall >= now - dt) {
        timeout = setTimeout(realCall, lastCall + dt - now + 1);
        return timeout;
      }
    }
    timeout = 0;
    fn.apply(scope, args);
  };
  const out = function (this: never, ...arg: A): void {
    lastCall = +new Date();
    args = arg;
    scope = this;
    if (!timeout) {
      timeout = setTimeout(realCall, dt);
    }
  };
  out.now = function (anyway = false) {
    if (timeout || anyway) {
      clearTimeout(timeout);
      realCall();
    }
  };
  return out;
};

export const debounceAnimationFrame = function <A extends unknown[], R>(
  fn: (...args: A) => R,
  dt: number,
  strictDelay: boolean
): (...args: A) => void {
  let scope: never;
  return debounce(
    function (this: never, ...args: A) {
      scope = this;
      requestAnimationFrame(() => {
        fn.apply(scope, args);
      });
    },
    dt,
    strictDelay
  );
};
