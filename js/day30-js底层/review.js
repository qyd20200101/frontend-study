// ① 创建一个空对象	const obj = {}
// ② 将空对象的 __proto__ 指向构造函数的 prototype	obj.__proto__ = Constructor.prototype
// ③ 将构造函数的 this 绑定到空对象并执行	const result = Constructor.apply(obj, args)
// ④ 如果构造函数返回了对象，返回该对象；否则返回 obj	return typeof result === 'object' ? result : obj
function myNew(Constructor, ...args) {
  //创建一个空对象,并继承构造函数的prototype
  //   const obj = Object.create(Constructor.prototype);标准写法
  const obj = {};
  obj.__proto__ = Constructor.prototype;
  //执行构造函数，将this绑定到obj
  const result = Constructor.apply(this, args);
  //如果构造函数饭了对象，则返回该对象，否则返回obj
  return typeof result === "object" && result !== null ? result : obj;
}
// 原型链的终点是 null
// Object.prototype 是内建原型链的最顶层，它的 __proto__ 指向 null。
//instanceof: 检查右边构造函数的 prototype 是否出现在左边实例的原型链上
function myInstanceof(left, right) {
  let proto = left.__proto__;
  const target = right.prototype;
  while (proto) {
    if (proto === target) {
      return true;
    }
    proto = proto.__proto__;
  }
  return false;
}

//手写call:把函数临时设为某个对象的属性，用该对象调用它，这样函数内部的 this 就指向这个对象。
Function.prototype.myCall = function (
  context = Object(context) || window,
  ...args
) {
  //创建唯一一个key
  const fnKey = Symbol();
  //将函数设为对象属性,改变this指向
  context[fnKey] = this;
  //执行函数
  //因为 JavaScript 中，谁调用函数，this 就指向谁
  const result = context[fnKey](...args);
  //删除临时属性
  delete context[fnKey];
  return result;
};

function myDebounce(fn, delay) {
  let timer = null;
  return function (...args) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}
