//一、数据类型&堆/栈（场景：用户信息对象）
//场景:后端返回一个用户对象，你复制后改一改，发现原数据也变了——这就是堆/栈的区别
//1.基本数据类型（栈：值传递）
let a = 10;
let b= a;
b =20;
console.log(a);//10，没变
console.log(b);
//特点互不戛纳人，各存各的

//2.引用类型（堆：引用传递）
let user1 = {name:'张三',age:20};
let user2 = user1;

user2.age = 25;
console.log(user1.age);//25,也变了
console.log(user2.age);//25

/*
原因：
基本类型存在栈，复制就是复制值
引用数据类型存在堆，复制只复制地址指针
*/

/*
二、4中类型判断（场景：处理后端未知数据）
场景：
后端返回的数据可能是数组、对象、null、数字，你要做不同处理
*/ 
//1.typeof(快速判断基础类型)
console.log(typeof'hello');//string
console.log(typeof 123); //number
console.log(typeof undefined); //undefined
console.log(typeof null); //object(坑)
console.log(typeof []); //object(坑)

//2.instanceof(判断引用类型)
console.log([] instanceof Array);//true
console.log({} instanceof Object);//true

//3.Object.prototype.toSrting.call(最准，万能)
function typeOf(obj) {
    return Object.prototype.toString.call(obj).slice(8,-1)
}

console.log(typeOf([]));//Array
console.log(typeOf({}));//Object
console.log(typeOf(null));//Null
console.log(typeOf(123));//Number

//4.Array.isArray(专门判断数组)
Array.isArray([1,2,3]);//true

/*
三、浅拷贝&深拷贝（真实场景：复制用户信息）
场景：你要修改用户信息，但不能污染原始数据
*/ 
//1.浅拷贝（只复制第一层）
let user = {
    name:'张三',
    info:{
        city:'北京'
    }
}

// 手写浅拷贝
// function shallowCopy(obj) {
//     // 判断是否为对象，以及为null
//     if (typeof(obj) !== 'object' || obj == null) return obj;

//     let res = Array.isArray(obj)? []:{};
//     for (let k in obj) {
//         if (obj.hasOwnProperty(k)) res[k] = obj[k];
//     }
//     return res;
// }

// let userCopy = shallowCopy(user);
// userCopy.info.city = '上海';

// console.log(user.info.city);//上海(被改了)
//结论：浅拷贝改深层，原数据会变

//2.深拷贝（完全独立）
//基础深拷贝
function deepCopy(obj) {
    if (typeof(obj) !=='object'|| obj == null) return obj;
    let res = Array.isArray(obj)? []:{};
    for (let k in obj) {
        if (obj.hasOwnProperty(k)){
            res[k] = deepCopy(obj[k]);
        }
    }
    return res;
}

let userCopy2 = deepCopy(user);
userCopy2.info.city = '上海';

console.log(user.info.city); //北京

/*
五、防抖&节流（真实前端场景）
*/
// 1.防抖：搜索框输入（只在停止输入后发请求）
function debounce(fn,delay) {
    let timer;
    return (...args)=>{
        clearTimeout(timer);
        timer = setTimeout(()=>{
            fn.apply(this,args);
        },delay)
    }
}

//使用
const search = debounce((val) =>{
    console.log("发送请求：",val);
},500);

search('前端');
search('前端面试');

//2节流:滚动加载更多，resize
function throttle(fn,delay) {
    let last = 0;
    return(...args)=>{
        const now = Date.now();
        if(now - last >=delay){
            fn.apply(this.args);
            last = now;
        }
    }
}

//使用
window.oncancel = throttle(() =>{
    console.log("加载更多");
},1000);

/*
六、数组去重（真实场景：后端返回重复标签）
*/
//后端返回
let tags = ['JS','css','JS','vue','css','React'];

//1.Set去重

let unique1 = [...new Set(tags)];

//2.filter去重
let unique2 = tags.filter((item,index) =>{
    tags.indexOf(item) ===index;
})

console.log(unique1);
