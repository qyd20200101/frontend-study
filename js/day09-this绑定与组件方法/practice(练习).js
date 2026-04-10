/*
写出 myCall：判断 context -> 挂载 Symbol -> 执行 -> 删除 -> 返回结果。
写出 myApply：逻辑同上，处理数组参数。
写出 myBind：返回函数 -> 处理参数合并 -> 考虑 instanceof（new 调用）。
*/ 
/*

//手写myCall
Function.prototype.myCall = function (context,...args) {
    // 判断context在全局作用域情况下,this指向window
    context = context || window;

    const key = Symbol();
    context[key] = this;

    const result = context[key](...args);

    delete context[key];

    return result;
}

//手写myApply
Function.prototype.myApply = function (context,args) {
    context = context || window;
    const key = Symbol();
    context[key] = this;
    const result = context[key](...args);
    delete(context[key]);
    return result;
}

//手写myBind
Function.prototype.myBind = function (context,...args) {
    const fn = this;
    return function Bound(...newArgs) {
        if (this instanceof Bound) {
            return new fn(...args,...newArgs);
        }
        return fn.apply(context,[...args,...newArgs]);
    }
}
*/

/*
//手写myCall
Function.prototype.myCall = function (context,...args) {
    context = context || window;
    const key = Symbol();
    context[key] = this;
    const result = context[key](...args);
    delete context[key];
    return result;
}
//手写myApply
Function.prototype.myApply = function (context,args) {
    context = context || window;
    const key = Symbol();
    context[key] = this;
    const result = context[key](...args);
    delete context[key];
    return result;
}

//手写myBind
Function.prototype.myBind = function (context,...args) {
    const fn = this;
    return function Bound(...newArgs) {
        if (this instanceof Bound) {
            return new fn(...args,...newArgs)
        }
        return fn.apply(context,[...args,...newArgs])
    }
}
*/

//手写myCall
Function.prototype.myCall = function (context,...args) {
    context = context||window;
    const key = Symbol();
    context[key] = this;
    const result = context[key](...args);
    delete context[key];
    return result;
}
//手写myApply
Function.prototype.myApply = function (context,args) {
    context = context || window;
    const key = Symbol();
    context[key] = this;
    const result= context[key](...args);
    delete context[key];
    return result;
}
//手写myBind
Function.prototype.myBind = function (context,...args) {
    const fn = this;
    return function Bound(...newArgs) {
        if (this instanceof Bound) {
            return new fn(...args,...newArgs);
        }
            return fn.apply(context,[...args,...newArgs]);
    }
}