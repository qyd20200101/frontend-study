//函数柯里化
/*
核心：判断传入的参数数量与原函数的是否相同
*/
function curry(fn) {
    return function curried(...args) {
        //如果当前收集的参数个数，大于或等于原函数fn定义的参数个数
        if (args.length >= fn.length) {
            return fn.apply(this, args); //凑够了，直接执行
        } else {
            //没凑够，返回一个新函数，把之前收集的参数和新传进来的参数拼起来继续等待
            return function(...nextArgs) {
                return curried.apply(this, args.concat(nextArgs));
            }
        }
    }
}
//测试
function sum(a, b, c) { return a + b + c; }
const curriedSum = curry(sum);
console.log(curriedSum(1)(2)(3)); // 输出 6
console.log(curriedSum(1, 2)(3)); // 输出 6

function curry(fn) {
    return function curried(...args) {
        if (args.length === fn.length) {
            return fn.apply(this, args);
        } else {
            return function(...nextArgs) {
                return curried.apply(this, nextArgs);
            }
        }
    }
}

function curry(fn) {
    return function curried(...args) {
        if (args.length === fn.length) {
            return fn.apply(this, args);
        } else {
            return function curried(...nextArgs) {
                return curried.apply(this, nextArgs);
            }
        }
    }
}