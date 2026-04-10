/*
1.手写call
原理：将函数设为对象的属性,执行后再删除
*/ 
Function.prototype.myCall = function (context,...args) {
    // 如果context是null或undefined,指向window
    context = context || window;
    // 创建唯一的key,防止覆盖原属性
    const key = Symbol();
    context[key] = this; //this就是当前要执行的函数

    const result = context[key](...args);
    delete context[key];
    return result;
};

/*
2.手写apply
原理与call一致，只是参数处理不同
*/ 
Function.prototype.myApply = function (context,args) {
    context = context || window;
    const key = Symbol();
    context[key] = this;

    //args是数组
    const result = context[key](...args);
    delete context[key];
    return result;
}

/*
3.手写bind
原理：返回一个闭包函数，并处理new调用
思考解析：bind返回函数是因为bind是预绑定，它不理解执行，而是参数一个绑定了主人的新函数，
等待未来被调用(如点击事件)
处理new调用：如果绑定的函数被当作构造函数new，根据js规则，this必须执行新创建的实例，
之前绑定的context失效
*/ 
Function.prototype.myBind = function (context,...args) {
    const fn =this;
    return function Bound(...newArgs) {
        // 思考点：如果是被new调用的，this应该指向实例而不是context
        if (this instanceof Bound) {
            return new fn(...args,...newArgs);
        }
        return fn.apply(context,[...args,...newArgs]);
    };
};
