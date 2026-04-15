/*
1.执行栈：同步代码
2.微任务队列：Promsie、MutationObserver
3.宏任务队列：setTimeout、setInterval、I/O
执行顺序：同步代码>清空所有微任务>执行一个宏任务>再次清空所有微任务>UI渲染
*/ 

console.log('1:Start');//同步
setTimeout(() =>{
    console.log('2:Timeout');//宏任务
},0)
Promise.resolve().then(() =>{
    console.log('3:Promise');//微任务
});

console.log('4:End');
//预期输出：1>4>3>2
