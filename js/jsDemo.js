// 弹窗显示
// alert(5+6);
// 控制台打印
console.log(5+6);

//  document.getElementById("demo").innerHTML = "段落已修改";
//  button按钮添加事件属性，执行操作代码
/*
事件用于接受用户行为，浏览器动作渲染
*/ 
//  function myFunction(){
//     document.write(Date.now());
//  }
// 格式转化有误差，从十进制到二进制再到十进制
 console.log(0.1+0.2);
 console.log(16+"n");
//  函数
function sum(a,b){
    return a+b;
}

const sum1 = sum;
sum1(1,2);
// var 具有函数作用域
// let具有块级作用域
// const具有块级作用域，且值不可变

// 声明变量,值为undefined
/*
var 可以重复声明（覆盖原值）
变量为赋值时，默认值为undefined
var声明的变量会提升(Hoisting)，但不会初始化
*/ 
var carname;
// 赋值
carname = "Volvo";
// 一条语句多个变量
var lastName = "Doe", age = 30, job = "carpenter";
// 一条语句中声明的多个变量不可以同时赋一个值
/*
x,y值为undefined
z值为1
*/ 
var x,y,z = 1;
 
// let 声明
let city;

// const 声明必须赋值，并且不能重新赋值
// const z

/*
js分为基本数据类型和引用类型
基本数据类型：Number,String,NaN,Undefined,Symbol,Boolean
引用数据类型：Array,Object,Function,Date,Regex
*/ 
console.log(typeof"John");
console.log(typeof 3.14);
console.log(typeof false);
console.log(typeof [1,2,3,4]);
// 数组检测
console.log(Array.isArray([1,2,3]));
console.log([2,3,4] instanceof Array);

console.log(typeof {});
//NaN是一个特殊的数值类型，表示Not a Number
console.log(typeof NaN);
// null返回object
console.log(typeof null);
console.log(null === Object);
console.log(NaN == NaN);

/*
let person = {
    firName: "bob",
    lastName: "Doe",
    age: 42,
    eyeColor: "blue",
    fullName: function(){
        return this.lastName;
    }
};
console.log(person.eyeColor);
console.log(person["age"]);

const person1 = person;
person1.eyeColor = "black";
// person1.fullName会返回函数的定义
console.log(person1.fullName());

*/ 
// 全局变量
/*
在页面被关闭后删除
js变量的生命周期在它声明时初始化
局部变量在函数执行完毕后销毁
全局变量在页面关闭后销毁
将局部变量暴露被外部作用域
1.通过全局对象window.a = a;
2.在函数内部定义全局变量
3.通过return返回值，返回局部变量
4.闭包
5.属性和方法 
*/ 
var var1 = 1;

var2 = 2;

console.log(this.var1);
console.log(window.var1);
console.log(window.var2);
// 严格模式下，无法删除
// console.log(delete var2);

// 
// function myFunction(a,b){
//     // 局部变量，只能在函数内部访问
//     // 函数运行完，就会被删除
//     let bigger = 0;
//     if (a>b) {
//         bigger = a;
//         a = b;
//         b = bigger;
//         return a;
//     }
//     else{
//         bigger = b;
//         b = a;
//         a = bigger;
//         return a;
//     }
// }

// console.log(myFunction(1,2));

// 通过索引获取字符串对应下标字符,通过length属性获取字符串长度
let carName ="Volvo XC60";
console.log(carName[3],carName.length);

let example = "It\'s alright";
console.log(example);

let x1 = "John";
let x2 = new String("John");

//slice()传入截取起点和终点，并将截取部分返回,不改变原数据
let x3 = x1.slice(1,3);
//split()传入分割要求，并将分割后的转化成数组，不改变原数据
// let x3 = x1.split("o");
console.log(x3);
console.log(x1);

// x1为字符串，x2为对象
console.log(x1 === x2);
console.log(typeof x1);
console.log(x1.indexOf('o'));
console.log(typeof x2);
// 字符串模板
let text = `He's often called "Runoob"`;
console.log(text);
// ${}模板字符串表达式
const newName ='Runoob';
const newAge = 30;
const message = `My name is ${newName} and I'm ${newAge} years old.`
console.log(message);

// ==会进行类型转化，===会比较值和类型

// 正则表达式
// let str = "Visit Runoob!";
// let n = str.search(/Runoob/i);
// console.log(n);

// function myFunction(){    
//     let str = document.getElementById("demo").innerHTML;    
//     let txt = str.replace(/microsoft/i,"Runoob");
//     document.getElementById("demo").innerHTML = txt;
// }


//js初始化不会提升，函数和变量声明会提升
// console.log(a1);
// console.log(a2);

// let a1;
// let a2 =123;
//严格模式下，函数变量未声明直接定义会报错，删除变量也会报错,不允许变量重命名，不允许使用八进制
// 禁止this关键字指向全局对象window

//call()立即执行，传入this指向，零散参数
// const person = {name:'小明'};
// function sayHi(age,city){
//     console.log(`我是${this.name},今年${age},住在${city}`);
// }


// sayHi.call(person,18,"北京");
// sayHi.apply(person,[20,"上海"]);
// const newFunc = sayHi.bind(person,18,"北京");
// newFunc();


// 高阶函数
function highOrder(fn){
    fn();
}

function sayHi(){
    console.log('Hi');
    
}

highOrder(sayHi);

//返回一个函数
function createFn(){
    return function(){
        console.log('我是返回的函数');
    }
}

const fn = createFn();
fn();

// 手写map

function myMap(arr,callback){
    const result = [];
    for(let i = 0; i<arr.length;i++){
        result.push(callback(arr[i],i,arr));
    }
    return result;
}

const arr1 = [1,2,3];
const newArr = myMap(arr1,item=>item*2);
console.log(newArr);

//手写filter

function myFilter(arr,callback){
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        if (callback(arr[i],i,arr)) {
            result.push(arr[i]);
        }
        
    }
    return result;
}

const arr2 = [1,2,3,4];
const res = myFilter(arr2,item=>item%2 ===0);
console.log(res);

// 手写reduce

function myReduce(arr,callback,initValue){
    let acc = initValue;
    let start = 0;

    if (acc === undefined) {
        acc = arr[0];
        start = 1;
    }

    for (let i = 0; i < arr.length; i++) {
        acc = callback(acc,arr[i],i,arr)
        
    }

    return acc;
}

const sum2 =  myReduce([1,2,3],(a,b)=>(a+b));
console.log(sum2); 
// 闭包
// 求1~n的阶乘
function fn1(n){
    if(n ==1){
        return 1;
    }
    return n * fn1(n-1);
}

console.log(fn1(10));


// 剩余参数
function sum3(first,...args){
    console.log(first);
    console.log(args);
}
sum3(1,2,3);

// 对象由属性和方法组成
/*
创建方式
1.字面量：let obj ={};
2.new： let obj = new Object();
3.构造函数：function Person(uname,age){
    this.uname = uname;
    this.age = age;
    this.sing = function(sang){
        console.log(sang);
    }
}
// 用new创建对象的过程也称为对象的实例化
let person1 = new Person('香香'，18);
*/ 

// 对象解构
let person2 = {uName:'zhang',uAge:18};
let { uName,uAge} = person2;
console.log(uName);
console.log(uAge);

// input表单验证

function myFunction(){
    let inpObj = document.getElementById("id1");
    if (inpObj.checkVisibility() == false) {
        document.getElementById("demo").innerHTML = "输入错误";
    }
    else{
        document.getElementById("demo").innerHTML="输入正确";
    }
}

/*
this指向
1.在方法中,this指向该方法所属的对象
2.如果单独使用，this表示全局对象window
3.在函数中，this表示全局对象
4.在函数中，在严格模式下，this是未定义的undefined
5.在事件中，this表示接受事件的元素
6.类似call(),apply()方法可以将this引用到任何对象
*/ 
// 1.
let person ={
    firstName: 'John',
    lastName: 'Doe',
    id: '5566',
    fullName: function () {
        return this.firstName+" "+this.lastName;
    }
};

//2.
let t = this;

//3.
function getPersonName() {
    return this;
}

//4.

//显式绑定

let Person1 = {
    fullName: function () {
        return this.firstName+" "+this.lastName;
    }
}

let Person2 = {
    firstName: " bobu",
    lastName: "daiwei",
}

console.log(Person1.fullName.call(Person2));

// 块级作用域里面，let变量可以重新赋值不能重新定义声明
let js = '0404';
js = 123;

//不同作用域可以重新赋值声明

{
    let js = [321];
    console.log(js);
    
}

//const定义的变量并非常量，只是定义了一个固定地址，地址的内容可以变
// 因为基本类型值存储在地址里面，所以地址不能改也就导致值不能修改
// 引用数据类型地址存的是指针，指针不能改，但是对象数组的内容可以修改
// const 对象：可以修改属性，不能替换整个对象

//锁死变量可以通过 Object.freeze(num)方法

// 异步
setTimeout(function () {
    document.getElementById("demo").innerHTML = "RUNOOB!";
},3000);

// Promise
// const myPromise = new Promise((resolve, reject) => {
//   // 异步操作代码
  
//   if (/* 操作成功 */) {
//     resolve('成功的结果'); // 将 Promise 状态改为 fulfilled
//   } else {
//     reject('失败的原因'); // 将 Promise 状态改为 rejected
//   }
// });


//.then()方法用于接受Promise状态变为fulfilled或者rejected时的回调函数
// myPromise.then(
//   (result) => {
//     // 处理成功情况
//     console.log('成功:', result);
//   },
//   (error) => {
//     // 处理失败情况
//     console.error('失败:', error);
//   }
// );
//.finally()方法无论Promise最终状态如何都会执行
// myPromise
//   .then((result) => {
//     console.log('成功:', result);
//   })
//   .catch((error) => {
//     console.error('失败:', error);
//   })
//   .finally(() => {
//     console.log('操作完成');
//   });

//promise.all()等待所有Promise完成，或者任意一个失败,返回值是一个包含所有Promise的数组,失败就会进入.catch方法

//Promise.race()返回最先完成的Promise结果，无论失败还是成功

//函数声明，函数表达式，构造函数,自调用函数，匿名函数，箭头函数

















 