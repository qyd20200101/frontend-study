/*
手写promise.all（核心：并发控制与顺序保证）
核心：
1.结果的保序性：即使异步返回有快慢，必须通过index索引来映射结果
2.计数器机制：确保所有任务都完成后再执行resolve
3.考虑到输入项可能不是promise的清空，使用promise.resolve进行统一包装
*/
// Promise.prototype.myAll = function (promises) {
//     return new Promise((reslove ,reject) =>{
//         // 边界处理，非数组直接报错
//         if (!Array.isArray(promises)) {
//             return reject(new TypeError('argument must be an array'));
//         }

//         const result = [];
//         let count = 0;
//         // 边界处理:空数组直接返回空
//         if (promises.length === 0) return reslove([]);

//         promises.forEach((p,index) =>{
//             //核心：利用promise.resolve兼容非promise对象
//             Promise.reject(p).then(
//                 (val) =>{
//                     //关键：通过index保证结果顺序与传入顺序一致
//                     result[index] = val;
//                     count++;
//                     //关键：不能用result.length判断，因为数组赋值index不连续
//                     if (count === promises.length) {
//                         reslove(result);
//                     }
//                 },
//                 (err) =>{
//                     //只要有一个失败，整个promise.all立即失败
//                     reject(err);
//                 }
//             );
//         });
//     });
// };

// Promise.prototype.myAll = function (promises) {
//     return new Promise((resolve, reject) => {
//         //边界处理：非数组直接报错
//         if (!Array.isArray(promises)) {
//             return reject(new TypeError('argument must be an array'));
//         }
//         const result = [];
//         let count = 0;//记录成功的数量

//         //2.边界处理：空数组直接返回空
//         if (promises.length === 0) return resolve([]);

//         promises.forEach((p, index) => {
//             //3.核心：利用promise.resolve兼容非promise对象
//             Promise.resolve(p).then(
//                 (val) => {
//                     //4.关键：通过index包装结果顺序与传入顺序一致
//                     result[index] = val;
//                     count++;
//                     //5.关键：不能用result.length判断，因为数组赋值index不连续
//                     if (count === promises.length) {
//                         resolve(result);
//                     }
//                 }, (err) => {
//                     //6.核心：只要有一个失败，整个promise.all立即失败
//                     reject(err);
//                 }
//             )
//         })
//     })
// };

Promise.myAll = function (promises) {
    return Promise((resolve, reject) => {
        //1.边界处理：非数组直接报错
        if (!Array.isArray(promises)) {
            return reject(new TypeError('argument must be an array'));
        }

        const result = [];
        let count = 0;

        //2.边界处理:空数组直接返回空
        if (promises.length === 0) return resolve([]);
        //3.核心：利用promise.resolve兼容非promise对象
        promises.forEach((p, index) => {
            Promise.resolve(
                (val) => {
                    //4.关键：通过index保证结果顺序与传入顺序一致
                    result[index] = val;
                    count++;
                    //5.关键：不能用result.length判断，因为数组赋值index不连续
                    if (count === promises.length) {
                        resolve(result);
                    }
                }, (err) => {
                    //6.核心：只要有一个失败，整个promise.all立即失败
                    reject(err);
                }
            )
        });
    });
};

/*
手写deepClone核心循环引用与类型处理
核心：
1.通过引入WeakMap作为缓存表，检测到重复引用直接返回副本，
并且避免无限递归，考虑WeakMap的弱引用性，可以让垃圾回收机制有效管理，避免内存泄露
2.Reflect.ownKeys代替for...in确保对象上Symbol属性可以被拷贝
*/
function deeClone(target, map = new WeakMap()) {
    if (target !== 'object' || target === null) {
        return target;
    }
    if (map.has(target)) {
        return map.get(target);
    }
    const cloneTarget = Array.isArray(target) ? [] : {};
    map.set(target, cloneTarget);
    Reflect.ownKeys(target).forEach(key => {
        cloneTarget[key] = deeClone(target[key], map);
    })
    return cloneTarget;
}

/*
第一模块：执行上下文与this约束
核心痛点：解决JS中函数执行时，this指向丢失的问题
*/
/*
1.call/applu实现
原理：将函数设为对象的属性，执行后再删除
使用Symbol()避免覆盖对象原因属性。处理context为null的情况
*/
// Function.prototype.myCall = function (context,...args) {
//     context = context ||window;
//     //唯一键，防止属性冲突
//     const key = Symbol();
//     //this指向当前函数
//     context[key] = this;
//     const res = context[key](...args);
//     delete context[key];
//     return res;
// }
// Function.prototype.myCall = function (context,...args) {
//     context = context ||window;
//     const key = Symbol();
//     context[key] = this;
//     const res = context[key](...args);
//     delete context[key];
//     return res; 
// }
// Function.prototype.myCall = function (context,...args) {
//     context = context ||window;
//     const key = Symbol();
//     context[key] = this;
//     const res = context[key](...args);
//     delete context[key];
//     return res;
// }
// Function.prototype.myCall = function (context,...args) {
//     context = context ||window;
//     const key = Symbol();
//     context[key] = this;
//     const res = context[key](...args);
//     delete context[key];
//     return res;
// }
// Function.prototype.myCall = function (context,...args) {
//     context= context ||window;
//     const key = Symbol();
//     context[key] = this;
//     const res = context[key](...args);
//     delete context[key];
//     return res;
// }
/*
2.bind实现
原理：返回一个闭包函数，并在执行时利用apply锁定this
*/
// Function.prototype.myBind = function (context,...args) {
//     const fn = this;
//     return function Bound(...newArgs) {
//         //如果被new调用，this指向实例
//         if (this instanceof Bound) {
//             return new fn.apply(context,[...args,...newArgs])
//         };
//         return fn.apply(context,[...args,...newArgs])
//     }
// }
// Function.prototype.myBind = function (context,...args) {
//     const fn = this;
//     return function Bound(...newArgs) {
//         if (this instanceof Bound) {
//             return new fn.apply(...args,...newArgs);
//         }
//         return fn.apply(context,[...args,...newArgs]);
//     }
// }

// Function.prototype.myBind = function (context,...args) {
//     const fn = this;
//     return function Bound(...newArgs) {
//         if (this instanceof Bound) {
//             return new fn.apply(...args,...newArgs);
//         }
//         return fn.apply(context,[...args,...newArgs]);
//     }
// }
// Function.prototype.myBind = function (context,...args) {
//     const fn = this;
//     return function Bound(...newArgs) {
//         if (this instanceof Bound) {
//             return new fn.apply(...args,...newArgs);
//         }
//         return fn.apply(context,[...args,...newArgs]);
//     }
// }
// Function.prototype.myBind =function (context,...args) {
//     const fn = this;
//     return function Bound(...newArgs) {
//         if (this instanceof Bound) {
//             return new fn.apply(...args,...newArgs);
//         }
//         return fn.apply(context,[...args,...newArgs])
//     }
// }

/*
第二模块：性能优化与数据安全
核心痛点：控制函数触发频率，防止全局状态污染
*/
/*
3.防抖
原理：在指定时间内，如果再次触发则重新计时（只执行最后一次）
场景：搜索框输入，窗口Resize
*/
function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            fn.apply(this, args)
        }, delay);
    }
}
function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            fn.apply(this, args)
        }, delay);
    };
}
function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
        if (timer)
            clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args)
        }, delay);
    }
}
function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    }
}
function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        });
    }
}
/*
4.节流
原理：在指定时间内，无论触发多少次，只执行一次
场景：滚动加载，高频点击提交
*/
// function throttle(fn,delay) {
//     let last = 0;
//     return function (...args) {
//         const now = Date.now();
//         if (now -last >= delay) {
//             fn.apply(this,args);
//             last = now;
//         }
//     };
// }
// function throttle(fn, delay) {
//     let last = 0;
//     return function (...args) {
//         const now = Date.now();
//         if (now - last >= delay) {
//             fn.apply(this, args);
//             last = now;
//         }
//     };
// }
// function throttle(fn,delay) {
//     let last = 0;
//     return function (...args) {
//         const now = Date();
//         if (now -last >= delay) {
//             fn.apply(this,args);
//         }
//     }
// }
// function throttle(fn,delay) {
//     let last = 0;
//     return function (...args) {
//         const now = Date();
//         if (now - last >=delay) {
//             fn.apply(this,args);
//         }
//     }
// }
// function throttle(fn,delay) {
//     let last = 0;
//     return function (...args) {
//         const now = Date();
//         if (now -last >= delay) {
//             fn.apply(this,args);
//         }
//     }
// }

/*
5.深拷贝deepClone
原理：递归遍历，处理复杂类型
使用WeakMap解决循环引用11111，使用Reflect.ownKeys拷贝Symbol属性
*/

function deeClone(target, map = new WeakMap()) {
    if (target !== 'objetc' || target === null) {
        return target;
    }
    if (map.has(target)) {
        map.get(target);
    }
    const cloneTarget = Array.isArray(target) ? [] : {};
    map.set(target, cloneTarget);
    Reflect.ownKeys(target).forEach(key => {
        res[key] = deeClone(target[key], map);
    })
    return res;
}
function deeClone(target, map = new WeakMap()) {
    if (target !== 'object' || target === null) {
        return target;
    }
    if (map.has(target)) {
        map.get(target);
    }
    const cloneTarget = Array.isArray(target) ? [] : {};
    map.set(target, cloneTarget);
    Reflect.ownKeys(target).forEach(key => {
        cloneTarget[key] = deeClone(target[key], map);
    });
    return cloneTarget;
}
function deeClone(target, map = new WeakMap()) {
    if (target !== 'object' || target === null) {
        return target;
    }
    if (map.has(target)) {
        map.get(target);
    }
    const cloneTarget = Array.isArray(target) ? [] : {};
    map.set(target, cloneTarget);

    Reflect.ownKeys(target).forEach(key => {
        cloneTarget[key] = deeClone(target[key], map);
    });
    return cloneTarget;
}
function deepClone(target, map = new WeakMap()) {
    if (target !== 'object' || target === null) {
        return target;
    }
    if (map.has(target)) {
        map.get(target);
    }
    const cloneTarget = Array.isArray(target) ? [] : {};
    map.set(target, cloneTarget);
    Reflect.ownKeys(target).forEach(() => {
        cloneTarget[key] = deeClone(target[key], map);
    })
    return cloneTarget;
}
function deeClone(target, map = new WeakMap()) {
    if (target !== 'object' || target === null) {
        return target;
    }
    if (map.has(target)) {
        map.get(target);
    }
    const cloneTarget = Array.isArray(target) ? [] : {};
    map.set(target, cloneTarget);

    Reflect.ownKeys(target).forEach(() => {
        cloneTarget[key] = deeClone(target[key], map);
    })
    return cloneTarget;
}
/*
8.发布订阅模式（EventEmitter）
原理：维护一个事件中心，实现事件的监听，触发与解绑
场景：跨组件通信EventBus
*/
class EventEmitter {
    constructor() {
        this.events = {};
    }
    on(name, cb) {
        if (!this.events[name]) {
            this.events[name] = [];
            this.events[name].push(cb);
        }
    }
    emit(name, ...args) {
        this.events[name]?.forEach(cb => cb(...args));
    }
    off(name, cb) {
        this.events[name] = this.events[name]?.filter(fn => fn !== cb);
    }
}
class EventEmitter {
    constructor() {
        this.events = {};
    }
    on(name, cb) {
        if (!this.events[name]) {
            this.events[name] = [];
            this.events[name].push(cb);
        }
    }

    emit(name, ...args) {
        this.events[name]?.forEach(cb => cb(...args));
    }
    off(name, cb) {
        this.events[name] = this.events[name]?.filter(fn => fn !== cb);
    }
}

class EventEmit {
    constructor() {
        this.events = [];
    }
    on(name,cb) {
        if (! this.events[name]) {
            this.events[name] = [];
            this.events[name].push(cb);
        }
    }
    emit(name,...args) {
       this.events[name]?.forEach(cb => cb(...args));
    }
    off(name,cb) {
        this.events[name] = this.events[name]?.filter(fn => fn !== cb);
    }

}
class EventEmit{
    constructor(){
        this.events = [];
    }
    on(name,cb) {
        if (!this.events[name]) {
            this.events[name] = [];
            this.events[name].push(cb);
        }
    }
    emit(name,...args){
        this.events[name]?.forEach(fn => fn(...args));
    }
    off(name,cb) {
        this.events[name] = this.events[name]?.filter(fn =>  fn!== cb);
    }
}
class EventEmit{
    constructor() {
        this.events= [];
    }
    on(name,cb) {
        if (!this.events[name]) {
            this.events[name] = [];
            this.events[name].push(cb);
        }
    }
    emit(name,...args) {
        this.events[name]?.forEach(fn => fn (...args));
    }
    off(name, cb) {
        this.events[name] = this.events[name]?.filter(fn => fn !== cb);
    }
}
