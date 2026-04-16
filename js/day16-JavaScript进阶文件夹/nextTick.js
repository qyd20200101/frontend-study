//模拟Vue3的nexttick核心实现
/*
vue中修改值，Vue不会立即更新DOM，会开启一个异步队列，并在下一个tick中合并所有修改，
想要在数据波动后立即获得最新的DOM属性（如表格高度）,就需要nextTick
nextTick就是利用Promise微任务机制
事件循环：
同步代码：执行修改数据
微任务：Vue nextTick
执行顺序：主线程清空——>执行渲染微任务——>nextTick回调执行
*/ 
let currentFlushPromise = null;
function myNextTick(fn) {
    //如果当前没有正在等待的promise，创建一个已经resolve的Promise
    const p =currentFlushPromise || Promise.resolve();

    //如果传入了回调函数，则将其放到.then中执行（微任务）
    //如果没传回调，则返回这个promise，支持await myNextTick()
    return fn? p.then(fn): p;
}

//模拟业务场景
let message = '初始值';
function updateData() {
    message = '更新值';
    //同步获取DOM
    //console.log(document.getElementById('msg')).innerText);//还是初始值
    myNextTick(() =>{
        //在微任务中获取了DOM（此时veu已经完成了渲染）
        //console.log(document.getElementById('msg'))//变为更新值
        console.log('DOM已更新，执行回调');
        
    })
}