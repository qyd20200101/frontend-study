/*
1.手写Promise
其中一个请求失败：promise.all会立即进入reject状态，返回第一个失败的错误原因，剩下的请求虽然会继续执行（因为promise无法被外部强行中断）,但它们的结果会被忽略
*/ 
Promise.myAll = function (promises) {
    return new Promise((resolve,reject) =>{
        // 参数校验：必须是数组
        if (!Array.isArray(promises)) {
            return reject(new TypeError('argument must be an array'));
        }
        let result = [];
        let count = 0; //记录成功的数量

        Promise.forEach((p,index) => {
            // 兼容非promise对象，用promise.resolve包装一层
            Promise.resolve(p).then((val) =>{
                result[index] = val; //按顺序存放
                count++;
                // 只有全部成功，才resolve
                if (count === promises.length) {
                    resolve(result);
                }
            },
            (err) =>{
                // 只有有一个失败，立即reject
                reject(err);
            }
        );
        });
        // 处理空数组
        if (promises.length === 0) resolve([]);
    });
};
/**/ 