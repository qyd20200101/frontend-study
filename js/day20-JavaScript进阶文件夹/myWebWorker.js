const myWorker = new Worker('worker.js');

const largeArry = Array.from({length: 50000},(_,i)=>i);

myWorker.postMessage(largeArry);

console.log('主线程已将计算任务发出，不会被阻塞');
