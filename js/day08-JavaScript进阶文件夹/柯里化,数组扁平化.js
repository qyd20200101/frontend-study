/*
3.手写数组扁平化myFlat
核心解析:递归+reduce,控制depth实现指定层级扁平化
面试点:默认depth=1,传infinity可完全扁平化,处理嵌套数组
*/ 
function myFlat(arr,depth =1) {
    // 非数组直接返回
    if (!Array.isArray(arr)) return arr;
    //利用reduce累加遍历
    return arr.reduce((acc,cur) =>{
        // 当前项是数组且还有扁平化深度,递归处理
        if (Array.isArray(cur) &&depth > 0) {
            acc.push(...myFlat(cur,depth-1));
        }else{
            acc.push(cur);
        }
        return acc;
    },[]);
}

/*
4.手写函数柯里化curry
核心解析:闭包保存参数,分步接受参数,参数足够后指向原函数
面试点:参数复用,延迟执行,用于函数式编程
*/ 
function curry(fn) {
    // 保存原函数的形参个数
    const fnLen = fn.length;
    // 返回收集参数的函数
    return function curried(...args) {
        if (args.length >= fnLen) {
            return fn.apply(this,args);
        }
        //参数不足,继续收集参数,递归调用
        return (...nextArgs) => curried(...args,...nextArgs);
    }
}

