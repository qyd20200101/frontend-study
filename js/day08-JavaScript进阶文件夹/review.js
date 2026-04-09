/*
1.手写myInstanceOf
核心解析：instanceOf的本质是原型链查找，判断构造函数的prototype是否在对象的原型链上
每个对象都有隐式__proto__，指向构造函数的显示原型prototype
面试点：不能判断基础类型，null,用于判断引用类型实例
缺点：
1.仅支持引用类型，基础类型和null返回false,无法处理跨域
2.构造函数的prototype被手动修改，会报错返回false
支持基础关系判断:
class A extends B,new A（） instanceof B返回true
场景：
1.精准区分用于类型：弥补typeof缺陷(typeof []返回Object)
2.面向对象编程，判断实例是否属于某个类
3.TypeScript中做类型守卫
*/ 
function myInstanceOf(left,right) {
    // 1.基础类型/null直接返回false,因为instanceof只判断引用类型
    if (typeof left !== 'object' || left === null) return left;

    //2.获取目标对象的隐式原型
    let proto = Object.getPrototypeOf(left);

    //3.循环向上查找原型链
    while( true){
        // 查到原型链顶端,未找到，返回false
        if (proto ===null) return false;
        // 找到构造函数的显式原型，返回true
        if (proto === right.prototype) return true;
        // 继续向上查找
        proto = Object.getPrototypeOf(proto);
    }
}

/*
2.手写数组去重unique
核心解析：利用includes判断重复/Set数据结构唯一性去重,includes判断结果数组是否已存在，不存在就推入
底层是双循环,时间复杂度o(n*2)
关键点：
1.可以正确去重NaN,undefined/null/+0/-0
2.无法去重引用类型，{a:1},{a:1}两个对象地址不同，去重引用类型，需自定义按对象唯一key对比
场景：
1.Set:日常开发在基础数据类型的快速去重
2.基础版：低代码环境兼容，自定义去重规则
3.数据清洗：后端返回的列表数据，对id、名称等基础字段去重
面试点：Set能正确去重NaN，基础版无法去重引用类型
*/ 
//基础版
function unique(arr) {
    const res = [];
    // 遍历数组
    for (let item of arr) {
        // 结果数组中不存在当前项，才推入
        if (!res.includes(item)) {
            res.push(item);
        }
    }
    return res;
}

// 极简Set版
function uniqueSet(arr) {
    // Set自动去重，再展开为数组
    return [...new Set(arr)];
}

/*
3.手写数组扁平化myFlat
核心解析：递归+reduce,控制depth实现指定层级扁平化
1.用reduce遍历数组每一项，通过累加器汇总扁平化后的结果
2.对每一项进行判断：若为数组且剩余扁平化深度depth>0,则递归调用myFlat,深度减1
3.默认depth=1,传入infinity可实现无限层级完全扁平化
注意点：
1.边界处理：判断入参是否为数组，避免非数组调用reduce报错
2.稀疏数组处理，与原生flat一致，reduce会跳过数组空位，
3.栈溢出风险：层级过多，递归会出现栈溢出
4.不处理类数组对象：仅对纯数组做扁平化,arguments类数组需先转化为数组再处理
场景：
1.嵌套数据处理
2.数据聚合，多维嵌套的列表数据
3.函数式编程：配合map/filter等数组方法，处理赋值嵌套
面试点：默认depth = 1,传infinity可完全扁平化，处理嵌套数组
*/ 

function myFlat(arr,depth = 1) {
    // 非数组直接返回
    if (!Array.isArray(arr)) return arr;
    //利用reduce累加遍历
    return arr.reduce((acc,cur) =>{
        // 当前项时数组且还有扁平化深度，递归处理
        if (Array.isArray(cur) && depth >0) {
            acc.push(...myFlat(cur,depth -1));
        }else{
            acc.push(cur);
        }
        return acc;
    },[]);
}

/*
4.手写函数柯里化curry
核心解析：闭包保存参数，分布接收参数，参数足够后执行原函数
1.用闭包编程原函数形参个数，及每一步传入的参数
参数达标，绑定正确的this，执行原函数，不达标返回新函数继续收集参数
实现参数复用，延迟执行，仅支持固定参数长度柯里化（add(1)(2)(3)()）不支持无固定参数
面试点：参数复用，延迟执行，用于函数式编程
*/ 
function curry(fn) {
    // 保存原函数的形参
    const fnLen = fn.length;
    // 返回收集参数的函数
    return function curried(...args){
        //参数数量达标，执行原函数
        if (args.length >= fnLen) {
            return fn.apply(this.args);
        } 
        //参数不足，继续收集参数，递归调用
        return (...nextArgs) =>curried(...args,...nextArgs);
    };
}

/*
5.手写Object.is
核心解析：修复严格相等===两个缺陷，实现精准值相等判断
面试点：Object.is和 ===的区别，就是处理 +0 /-0,NaN
*/ 
function myObjectIs(x,y) {
    // 1.修复+0 === -0 为true的问题
    if (x === 0 && y === 0) {
        return 1 / x === 1 / y;
    }
    //2.修复NaN ！==NaN的问题
    if (Number.isNaN(x) && Number.isNaN(y)) {
        return true;
    }
    //3.其余情况用严格相等
    return x === y;
}

/*
6.手写EventEmitter发布订阅
核心解析：Map存储事件回调，实现订阅/发布/解绑/单纯执行。用于组件通信
Map存储事件名称和对应回调数组，避免普通对象的原型链污染
重复订阅，多次存入数组，加入回调存在性判断，防止重复订阅
emit用promise.resolve或setTimeout包裹回调执行实现异步
面试点：解耦模块通信，Vue的EventBus就是基于此实现
*/ 
class EventEmitter {
    // 事件池：存储事件名称和对应的回调函数
    constructor() {
        this.events = new Map();
    }

    //绑定事件
    on(eventName,callback){
        // 无该事件则初始化为空数组
        if (!this.events.has(eventName)) {
            this.events.set(eventName,[]);
        }
        // 推入回调函数
        this.events.get(eventName).push(callback);
    }

    //触发事件
    emit(eventName,...args) {
        const cbs = this.events.get(eventName);
        if (!cbs) return ;
        // 遍历执行所有回调
        cbs.forEach(cb => cb.apply(this,args));
    }

    //解绑事件
    off(eventName,callback) {
        const cbs = this.events.get(eventName);
        if (!cbs) return ;
        // 过滤需要解绑的回调
        this.events.set(eventName,cbs.filter(cb => cb !== callback));
    }

    //只执行一次
    once(eventName,callback){
        // 包装临时函数，执行后自动解绑
        const tempFn = (...args) =>{
            callback.apply(this,args);
            this.off(eventName,tempFn);
        }
        this.on(eventName,tempFn);
    }
}