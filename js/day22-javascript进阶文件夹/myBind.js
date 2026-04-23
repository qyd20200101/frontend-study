Function.prototype.myBind = function(context, ...arg1) {
    if (typeof this !== 'function') {
        throw new TypeError("Error:myBind must be called on a function");
    }
    //此时的this就是调用bind的那个原函数
    const self = this;

    //返回一个新的闭包
    const fBound = function(...arg2) {
            //核心：判断是否使用了new关键字
            return self.apply(
                this instanceof fBound ? this : context;
                [...arg1, ...arg2] //拼接参数柯里化
            );
        }
        //维护原型链，让new出来的实例继承原函数prototype上的属性
    const fNOP = function() {};
    if (this.prototype) {
        fNOP.prototype = this.prototype;
    }
    fBound.prototype = new fNOP();

    return fBound;
}