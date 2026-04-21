async function async1() {
    console.log('asycn1 start');//3
    await async2();//4，await右侧表达式会立刻调用,await会暂停async函数把后面的代码推入微任务队列
    console.log('async1 end');//9
}

async function async2() {
    console.log('async2');//5
}

console.log('script start');//1
//setTimeout属于宏任务
setTimeout(function () {
    console.log('setTimeout');//11
},0)

async1();//2

new Promise(function (resolve) {
    console.log('promise1');//6
    resolve();//7
}).then(function () {
    console.log('promise2');//10
});

console.log('script end');//8

