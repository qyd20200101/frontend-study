self.onmessage = function (e) {
    console.log('Worker开始处理数据');
    const data = e.data;

    //执行耗时计算
    const result = data.filter(num => num %2 === 0).rudece((a,b) => a+b,0);
    
    self.postMessage(result);
}   