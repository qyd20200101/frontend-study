// /*
// 二、核心知识点+场景案例
// */ 
// //1.闭包
// //概念：函数能够访问其外部作用域变量的特性,即使外部函数已执行完毕
// //场景案例1：封装私有计数器
// // 需求：实现一个只通过add/get操作的计数器,无法直接修改内部值
// function createCounter() {
//     let count = 0;//私有变量
//     return {
//         add:()=> count++,
//         get:() => count
//     };
// }

// const counter = createCounter();
// counter.add();//1
// console.log(counter.get());//1
// console.log(counter.count);//undefined(无法访问私有变量)

// //解析：createCounter执行后，count不会被销毁，因为返回的对象方法仍在引用它，形成闭包，实现了私有变量封装。

// //场景案例2：循环中的闭包陷阱与解决
// // 需求：点击每个按钮输出对应索引
// for (var i = 0; i < 3; i++) {
//     setTimeout(() =>console.log(i),1000);//输出三次3
// }

// //解决1：使用let块级作用域
// for (let i = 0; i < 3; i++) {
//     setTimeout(() =>console.log(i),1000);//输出0，1，2
// }

// //解决2：使用闭包包裹
// for (var i = 0; i < 3; i++) {
//     (function(j){
//         setTimeout(() =>console.log(j),1000)
//     })(i)//输出0，1，2
// }
// //解析：var是函数作用域，循环结束后i=3;let是块级作用域，每次循环都有新的i;闭包则通过立即执行函数保存当前值

// /*
// 2.原型链与原型
// 概念：每个函数有prototype属性（原型对象），每个对象有__proti__（执行构造函数的prototype）,则通过__proto__形成的链式结构用于属性和方法共享
// 场景案例1：理解原型链属性查找
// */ 
// function Person(name) {
//     this.name = name;
// }
// Person.prototype.sayHi = function () {
//     console.log(`Hi,I'm%{this.name}`);
// };

// const alice = new Person('alice');
// alice.sayHi();//Hi,I'malice(从Person.prototype.sayHi继承)
// console.log(alice.toString());//[object Object](从object.prototype继承)

// //解析：alice没有sayHi方法，就通过__proto__找到Person.prototype.sayHi,没有toString,继续找到object.prototype,这就是原型链

// //场景案例2：实现组合继承（ES5常用）
// //父类
// function Animal(name) {
//     this.name = name;
//     this.colors = ['red','blue'];
// }
// Animal.prototype.sayName = function () {
//     console.log(this.name);
// };

// //子类
// function Dog(name,age) {
//     Animal.call(this,name);//继承父类属性，使用构造函数
//     this.age = age;
// }

// Dog.prototype = new Animal();//继承父类方法（原型链）
// Dog.prototype.constructor = Dog;//修正constructor指向
// Dog.prototype.sayAge = function () {
//     console.log(this.age);
// };

// const dog1 = new Dog('wangcai',2);
// dog1.colors.push("yellow");
// console.log(dog1.colors);//['red','blue','yellow']
// dog1.sayname();//wangcai

// const dog2 = new Dog('Dahuang',3);
// console.log(dog2.colors);//['red','blue']，属性不共享，方法共享
// //解析：组合继承结合了借用构造函数（避免引用类型共享）和原型链继承（实现方法复用）

// /*
// 3.this指向全面解析
// 概念：this指向取决于函数调用方法，与定义位置无关
// 场景案例：不同调用方式下的this
// */ 
// // 1.全局调用（浏览器window,Node->global/undefined）
// function globalFunc() {
//     console.log(this);
// }
// globalFunc();

// //2.对象方法调用（this->调用该方法的对象）
// const obj = {
//     name:'Alice',
//     sayName(){
//         console.log(this.name);
//     }
// };

// obj.sayName();//Alice

// //3.构造函数调用(this->新创建的实例)
// function Person(name) {
//     this.name;
// }
// const person = new Person('Bob');
// console.log(person.name);//Bob

// //4.call/apply/bind调用this指定对象
// function greet() {
//     console.log(`Hello,${this.name}`);
// }
// const user = {name: 'Charlie'};
// greet.call(user);//Hello,Charlie

// //5.箭头函数this->指向外层作用域的this

// const arrowObj = {
//     name: 'Dave',
//     delayGreet(){
//         setTimeout(() =>{
//             console.log(this.name);
//         },1000);//this->delayGreet的this,即arrObj
//     }
// };

// arrowObj.delayGreet();//Dave
// //解析箭头函数没有自己的this,继承自外层上下文，适合用于保持上下文场景（如setTimeout,事件回调）

// /*
// 4.异步编程：Promise与async/await
// 概念：Promise用于处理异步操作，避免回调地狱，async/await是Promise的语法糖，让异步代码看起来像同步
// 场景案例1：Promise串行请求
// */ 
// //模拟请求函数
// function fetchData(url,delay) {
//     return new Promise((resolve) =>{
//         setTimeout(() =>resolve(`Data from ${url}`),delay);
//     });
// }

// // 串行执行，先请求A，再请求B，最后请求C
// fetchData('/api/a',1000).then(dataA =>{
//     console.log(dataA);
//     return fetchData('/api/b',1000);
// })
// .then(dataB =>{
//     console.log(dataB);
//     return fetchData('/api/c',1000);
// })
// .then(dataC =>{
//     console.log(dataC);
// })

// //场景案例2：async/await并发请求
// async function fetchAllDate() {
//     try{
//         //并发请求，同时发起A,B,C,等待所有完成
//         const [dataA,dataB,dataC] = await Promise.all([
//             fetchData('/api/a',1000),
//             fetchData('/api/b',1000),
//             fetchData('/api/c',1000)
//         ]); 
//         console.log(dataA,dataB,dataC);
//     }catch(err){
//         console.log(err);
//     }
// }
// fetchAllDate();

// //解析Promise.aa用于并发请求，所有Promise成功才成功，async/await让异步代码更易读，try/catch统一处理错误


//场景1：私有计数器

function createCounter() {
    let count = 0;
    return function () {
        count++;
        return count;
    }
}

//测试

const counter1 = createCounter();
const counter2 = createCounter();

console.log(counter1());
console.log(counter1());
console.log(counter2());
console.log(counter1());

//闭包循环

for (var index = 0; index < 3; index++) {
    setTimeout(function () {
        console.log(index);
    },1000);
}
//let块级作用域
for (let index = 0; index < 3; index++) {
    setTimeout(function () {
        console.log(index);
    },1000);
}
// 立即执行函数闭包
for (var index = 0; index < 3; index++) {
    (function (j) {
        setTimeout(function(){
            console.log(j);
        },1000);
    })(index)
    
}


