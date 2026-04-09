/*
5.手写Object.is
核心解析:修复严格相等的两个缺陷,实现精确值相等判断
面试点:Object.is和 ===的区别,就是处理+0/-0,NaN
*/ 
function myObjectIs(x,y) {
    // 1.修复 +0 === -0为true的问题
    if (x === 0 && y ===0) {
        return 1/x === 1/y;
    }
    //2.修复NaN !== NaN的问题
    if (Number.isNaN(x)&&Number.isNaN(y)) {
        return true;
    }
    //3.其余情况使用严格相等
    return x === y;
}

/*
6.手写EventEmitter发布订阅
核心解析:Map存储时间回调,实现订阅/发布/解绑/单次执行,用于组件通信
面试点:解耦合模块通信,Vue的EventBus就是基于此实现
*/ 
class EventEmitter {
    constructor() {
        // 事件池:存储事件名和对应的回调函数
        this.events = new Map();
    }

    //绑定事件
    on(eventName,callback){
        // 无该事件则初始化空数组
        if (!this.events.has(eventName)) {
            this.events.set(eventName,[]);
        }

        // 推入回调函数
        this.events.get(eventName).push(callback);
    }

    // 触发事件
    emit(eventName,...args){
        const cbs = this.events.get(eventName);
        if (!cbs) return;
        // 遍历执行所有回调
        cbs.forEach(cb => {
            cb.apply(this,args);
        });
    }

    // 解绑事件
    off(eventName,callback){
        const cbs = this.events.get(eventName);
        if (!cbs) return;
        // 过滤掉需要解绑的回调
        this.events.set(eventName,cbs.filter(cb => cb !== callback));
    }

    //只执行一次
    once(eventName,callback){
        // 包装临时函数,执行后自动解绑
        const tempFn = (...args) =>{
            callback.apply(this,args);
            this.off(eventName,tempFn);
        };

        this.on(eventName,tempFn);
    }
}