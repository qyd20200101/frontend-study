function myInstanceOf(obj,constructor) {
    let proto = Object.getPrototypeOf(obj);
    while (proto) {
        if (proto === constructor.prototype) {
            return true;
        }
        proto = Object.getPrototypeOf(proto);//获取原型链上的下一个原型
    }
    return false;
}

//new操作符
function Person(name,age) {
    this.name = name;
    this.age = age;
}

var john = new Person('john',30);
console.log(john);
//手写new
function myNew(Constructor,...agrs) {
    //创建一个空对象，该对象的原型为构造函数的原型对象
    var obj = Object.create(Constructor.prototype);
    //将构造函数的this绑定到该空对象上，执行构造函数的代码
    var result = Constructor.apply(obj,agrs);
    //如果构造函数有显示返回一个对象，则返回该对象，否则返回空对象
    return(typeof result === 'object' && result != null) ? result : obj;

}

//js作用域

