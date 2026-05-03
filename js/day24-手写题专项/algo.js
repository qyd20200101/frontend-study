//防抖：事件连续触发,只在最后一次触发结束后的指定时间后执行回调,等你停下来
//场景：输入框搜索，表单校验,窗口resize,搜索联想,按钮联想点击放重复提交
//清除定时器是为了保证最后一次触发的定时器存活，之前的不清除就会变成多次执行
function debounce(fn, wait) {
  let timer = null;
  return function (...args) {
    const context = this;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, wait);
  };
}

//节流是固定时间窗口内，只允许第一次或在最后一次执行一次，核心是限制单位时间的触发频率
//一直触发也没关系，按频率控制
//场景：scroll/resize

//时间戳+定时器
function throttle(fn, delay) {
  let lastTime = 0;
  return function (...args) {
    const nowTime = Date.now();
    const context = this;
    if (nowTime - lastTime >= delay) {
      lastTime = nowTime;
      fn.apply(context, args);
    }
  };

  let timer = null;
  return function (...args) {
    const context = this;
    if (timer) return;
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
}

//深拷贝
//循环引用导致深拷贝过程无限递归，造成栈溢出或者拷贝死循环
//date,RegExp通过new对应的构造函数返回对象
function deepClone(target, map = new WeakMap()) {
  if (target === null || target !== "object") {
    return target;
  }
  if (map.has(target)) {
    return map.get(target);
  }

  let cloneTarget;
  if (target instanceof Date) {
    cloneTarget = new Date(target);
    return cloneTarget;
  }
  if (target instanceof RegExp) {
    cloneTarget = new RegExp(target);
    return cloneTarget;
  }
  if (target instanceof Function) {
    return target;
  }
  cloneTarget = Array.isArray(target) ? [] : {};
  map.set(target);
  for (const key in target) {
    if (Object.prototype.hasOwnProperty.call(target, key)) {
      cloneTarget[key] = deepClone(target[key], map);
    }
  }
  return cloneTarget;
}

//call 立即执行，传参是逐个传递
//判断调用者是不是数组,处理上下文对象,把函数临时挂载到上下文对象，调用结束后删除临时属性
Function.prototype.myCall = function (context, ...args) {
  if (typeof this !== "function") {
    throw new TypeError("myCall must be called on a function");
  }
  context = context || window;
  const fn = Symbol("fn");
  context[fn] = this;

  const result = context[fn](...args);
  delete context[fn];

  return result;
};

Function.prototype.myApply = function (context, args) {
  if (typeof this !== "function") {
    throw TypeError("myApply must be called on a function");
  }

  context = context || window;
  const fn = Symbol("fn");
  context[fn] = this;

  const result = args ? context[fn](...args) : context[fn]();
  delete context[fn];

  return result;
};

//bind，非立即执行，返回新函数，预先绑定this,预设参数,返回的新函数可以被new出来
Function.prototype.myBind = function (context, ...args) {
  if (typeof this !== "function") {
    throw new TypeError("myBind must be called on a function");
  }
  const fn = this;
  function boundFn(...restArgs) {
    return fn.apply(this instanceof boundFn ? this : context, [
      ...args,
      ...restArgs,
    ]);
  }

  boundFn.prototype = Object.create(fn.prototype);

  return boundFn;
};

//new: 1.创建一个空对象,2.再把空对象的原型指向构造函数的prototype；
// 3.把构造函数内部的this绑定到新对象，并执行构造函数,4.判断构造函数返回值，如果返回的是对象就直接返回对象，否则返回新创建的实例对象
function myNew(Constructor, ...args) {
  if (typeof Constructor !== "function") {
    throw new TypeError("Constructor must be a function");
  }

  //1.创建一个空对象，并把原型指向构造函数的prototype
  const obj = Object.create(Constructor.prototype);

  //2.执行构造函数,并把this指向新对象
  const result = Constructor.apply(obj, args);

  //3.判断返回值
  const isObject =
    result !== null &&
    (typeof result === "object" || typeof result === "function");
  return isObject ? result : obj;
}
//instanceof 本质是判断左侧对象的原型链上，能否找到右侧构造函数的prototype
//Constructor.prototype.__proto__ === Object.prototype

function Foo() {}
const obj = new Foo();

obj.__proto__ === Foo.prototype;
Foo.prototype.__proto__ === Object.prototype;
Object.prototype.__proto__ = null;
function myInstanceof(left, right) {
  if (
    left === null ||
    (typeof left !== "object" && typeof left !== "function")
  ) {
    return false;
  }

  let proto = Object.getPrototypeOf(left);
  const prototype = right.prototype;
  while (proto) {
    if (proto === prototype) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}

//promise.all实现
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      reject(new TypeError("Argument must be an array"));
      return;
    }

    const result = [];
    let count = 0;
    if (promises.length === 0) {
      resolve([]);
      return;
    }

    promises.forEach((p, index) => {
      Promise.resolve(p).then(
        (value) => {
          result[index] = value;
          count++;
          if (count === promises.length) {
            resolve(result);
          }
        },
        (err) => {
          reject(err);
        },
      );
    });
  });
}

//promise.race返回一个新的promise,它会遍历传入可迭代的对象，把每一项转化成promise注册then(resolve,reject)
//，返回最先完成的结果，外层的promise就会跟随谁的状态,只关心第一个的结果
