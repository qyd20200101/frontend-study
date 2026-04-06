// //1.普通函数vs箭头函数this对比

// // 1.普通函数this指向window(浏览器对象)
// function normalFn(){
//     console.log("普通函数this",this);
// }

// normalFn();

// //2.对象方法this指向该对象
// const obj = {
//     name: '张三',
//     sayName() {
//         console.log("对象方法 this",this);//obj对象
//         console.log("name",this.name);//张三
//     }
// };

// obj.sayName();

// //箭头函数this继承外层作用域
// const arrowObj = {
//     name: '李四',
//     sayName(){
//         console.log("箭头函数 this",this);//继承外层,这里是window
//     }
// };

// arrowObj.sayName();

// //2.定时器里面的this(经典坑)

// const timerObj = {
//     name:"王五",
//     sayNameLater(){
//         //普通函数作为定时器回调,this指向window
//         setTimeout(function () {
//             console.log("普通函数定时器 this",this);//window
//             console.log("name",this.name);//undefined
//         },1000);
        
//         //箭头函数作为定时器回调,this继承外层（sayNameLater的this是thimerObj）
//         setTimeout(() =>{
//             console.log("箭头函数定时器 this",this);//timerObj
//             console.log("name",this.name);//王五
//         },1000);
//     }
// };
// timerObj.sayNameLater();

// //3.构造函数里面的this

// function Person(name) {
//     this.name = name; //this指向new出来的实例对象
//     console.log("构造函数this",this);
// }
// const p1 = new Person("赵六");
// console.log("p1.name:",p1.name);//赵六

// //二、闭包小demo
// //1.闭包实现计数器(体现数据缓存)
// function createCounter() {
//     let count = 0;//外部函数变量

//     //返回内部函数，内部函数访问了count
//     return function () {
//         count++;
//         console.log("当前计数",count);
        
//     };
// }

// const counter = createCounter();
// counter();//1
// counter();//2 (count没有被垃圾回收，一直保存)
// counter();//3

// //2闭包经典陷阱+解决办法(循环绑定事件)

// // 闭包陷阱：循环里用var,最后输出的都是3
// for (var i = 0; i < 3; i++) {
//     setTimeout(function () {
//         console.log("var 循环 i",i);//输入三次3
//     },100);
// }

// // 解决方法1：用let(块级作用域)
// for (let i = 0; i < 3; i++) {
//     setTimeout(function () {
//         console.log("let 循环 i",i);//输出0,1,2
//     },100);
// }

// //解决办法2：用闭包
// for (var k = 0; k < 3; k++) {
//     (function (index) {
//         setTimeout(function () {
//             console.log("闭包循环 index:",index);//输出0,1,2
//         },100);
//     })(k);
// }

//一、this指向小demo
//1.普通函数vs箭头函数this对象

//普通函数this指向window(浏览器对象)
function normalFn() {
    console.log("普通函数this",this);//window
}
normalFn();

//对象方法this指向该对象
const obj = {
    name: "张三",
    sayName() {
        console.log("对象方法this:",this);//obj对象
        console.log("name:",this.name);//张三
    }
};
obj.sayName();

//箭头函数this继承外层作用域
const arrowObj = {
    name: '李四',
    sayName:() => {
        console.log("箭头函数this:",this);//继承外层,这里是window
    }
};

arrowObj.sayName();

//2.定时器里的this(经典坑)

const timerObj = {
    name: "王五",
    sayNameLater(){
        //普通函数作为定时器回调，this指向window
        setTimeout(function () {
            console.log("普通函数定时器this",this);//windsw
            console.log("name",this.name);//undefined
        },1000);

        //箭头函数作为定时器回调，this继承外层(sayNamelater的this是timeObj)
        setTimeout(() =>{
            console.log("箭头函数定时器this",this);//timeObj
            console.log("name",this.name);//王五
        },1000);
    }
};
timerObj.sayNameLater();

//3.构造函数里的this
function Person() {
    this.name = this.name; //this指向new出来的实例对象
    console.log("构造函数this",this);
}
const p1 = new Person("赵六");
console.log("p1.name:",p1.name);//赵六

//二、闭包小demo
//1.闭包实现计算器（体现数据缓存）

function createCounter() {
    let count = 0;//外部函数变量

    //返回内部函数，内部函数访问了count
    return function () {
        count++;
        console.log("当前计数",count);
    };
}
const counter = createCounter();
counter();//1
counter();//2
counter();//3

//2.闭包经典陷阱+解决办法(循环绑定事件)
//闭包陷阱，循环里用var,最后输出的都是3
for (var i = 0; i < 3; i++) {
    setTimeout(function () {
        console.log("var循环i:",i);//输出三次3
        
    },100);
}
//解决办法1：使用let(块级作用域)
for (let i = 0; i < 3; i++) {
    setTimeout(function () {
        console.log("let循环的i:",i);//0,1,2
    },100);
}
//解决办法2：用闭包包裹
for (var i = 0; i < 3; i++) {
    (function (index) {
        setTimeout(function () {
            console.log("闭包循环index:",index);//输出0，1，2
            
        },100);
    })(k);
    
}

//手写防抖
//防抖：延迟指向，若在延迟内再次触发则重新计时
// function debounce(fn,delay = 300) {
//     let timer = null;
//     return function (...args) {
//         //清除之前的定时器
//         if (timer) clearTimeout(timer);
//         //重新计时
//         timer = setTimeout(() =>{
//             fn.apply(this,args);
//         },delay);
//     };
// }

// //使用示例
// const handleScroll = debounce(() =>{
//     console.log("滚动停止后执行");
// },500);
// window.addEventListener('scroll',handleScroll);

//第二遍
//防抖，立即执行版本
// function debounce(fn,delay = 300,immediate = false) {
//     let timer = null;
//     return function (...args) {
//         if (timer) clearTimeout(timer);
//         //立即执行逻辑
//         if (immediate) {
//             const callNow = !timer;
//             timer = setTimeout(() =>{
//                 timer = null;
//             },delay);
//             if (callNow) fn.apply(this,args);
//         } else{
//             //非立即执行
//             timer = setTimeout(() =>{
//                 fn.apply(this,args);
//             },delay)
//         }
//     };
// }

//四数组去重
//写法一:使用Set
// function unique(arr) {
//     //Set自动去重，再回转数组
//     return [...new Set(arr)];
// }
// //测试
// const arr = [1,2,2,3,4,4,5];
// console.log(unique(arr));//[1,2,3,4,5]

//写法二:使用filter+indexOf
// function unique(arr) {
//     //利用indexOf检查元素第一次出现的位置
//     return arr.filter((item,index) =>{
//         return arr.indexOf(item) === index;
//     });
// }
// //测试
// const arr = [1,2,2,3,4,4,5];
// console.log(unique(arr));

// 手写防抖
//防抖：延迟执行，若在延迟内再次触发则重置计时
// function debounce(fn,delay = 300) {
//     let timer = null;
//     return function(...args){
//         //清除之前的计数器
//         if (timer) clearTimeout(timer);
        
//         //重新计时
//         timer = setTimeout(() =>{
//             fn.apply(this,args);
//         },delay);
//     };
// }

// //使用示例
// const handleScroll = debounce(() =>{
//     console.log("滚动停止后执行");
// },500);
// window.addEventListener("scroll",handleScroll);

//第二遍
//防抖（支持立即执行版本）
function debounce(fn,delay = 300,immediate = false) {
    let timer = null;
    return function (...args) {
        if (timer) clearTimeout(timer);
        //立即执行逻辑
        if (immediate) {
            const callNow = !timer;
            timer = setTimeout(() =>{
                timer = null;
            },delay);
            if (callNow) fn.apply(this,args); 
        } else{
            //非立即执行部分
            timer = setTimeout(() =>{
                fn.apply(this,args);
            },delay);
        }
    };
}

//四数组去重
//写法一:使用Set

// function unique(arr) {
//     //Set自动去重，再回转数组
//     return[... new Set(arr)];
// }

// //测试
// const arr = [1,2,2,3,3,4,5];
console.log(unique(arr));//[1,2,3,4,5]

//写法二：使用filter+indexOf
function unique(arr) {
    //利用indexOf 检查元素第一次出现的位置
    return arr.filter((item,index) =>{
        return arr.indexOf(item) === index;
    });
}

//测试
const arr = [1,2,2,3,3,2,4,4,5,5];
