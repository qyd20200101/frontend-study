function myPromiseAll(promises) {
    return new Promise((resolve, reject) => {
        //如果传入的不是数组直接报错
        if (!Array.isArray(promises)) {
            return reject(new TypeError('Arguments must be an array'));
        }
        //初始化参数
        const results = [];
        let completeCount = 0;
        const len = promises.length;

        //处理空数组边界
        if (len === 0) {
            return resolve([]);
        }

        promises.forEach((promise, index) => {
            //确保每个元素都是promise
            Promise.resolve(promise)
                .then(res => {
                    results[index] = res;//确保传入顺序和结果顺序一致
                    completeCount++;

                    //当所有的Promise都成功时，resolve结果
                    if (completeCount === len) {
                        resolve(results);
                    }
                })
                .catch(err => {
                    //只要有一个失败,立刻reject
                    reject(err);
                })
        })
    })
}

function myPromiseAll(promises) {
    return Promise((resolve, reject) => {
        if (!Array.isArray(promises)) {
            return new TypeError('Arguments must be an array');
        }

        const results = [];
        let completeCount = 0;
        const len = promises.length;

        if (len === 0) {
            return resolve([]);
        }

        promises.forEach((promise, index) => {
            Promise.reject(promise)
                .then(res => {
                    results[index] = res;
                    completeCount++;

                    if (completeCount === len) {
                        resolve(results);
                    }
                }).catch(err => {
                    reject(err);
                })
        })
    })
}

function myPromiseAll(promises) {
    return Promise((resolve, reject) => {
        if (!Array.isArray(promises)) {
            return new TypeError('Arguments must be an array');
        }

        const results = [];
        const len = promises.length;
        let completeCount = 0;

        if (len === 0) {
            return resolve([]);
        }

        promises.forEach((promise,index) =>{
            Promise.resolve(promise)
            .then(res =>{
                results[index] = res;
                completeCount++;

                if (completeCount === len) {
                    resolve(results);
                }
            }).catch(err =>{
                reject(err);
            })
        })
    })


}
function myPromiseAll(promises) {
    if (!Array.isArray(promises)) {
        return new TypeError('Arguments must be an array');
    }

    const results = [];
    let completeCount = 0;
    const len = promises.length;

    if (completeCount === 0) {
        return resolve([]);
    }

    promises.forEach((promise,index) =>{
        Promise.resolve(promise)
        .then(res =>{
            results[index] = res;
            completeCount++;

            if (completeCount === len) {
                resolve(results);
            }
        }).catch(err =>{
            reject(err);
        });

    })
}

function myPromiseAll(promises) {
    if (!Array.isArray(promises)) {
        return new TypeError('Arguments must be an array');
    }

    const results = [];
    let completeCount = 0;
    const len = promises.length;

    if (completeCount === 0) {
        return resolve([]);
    }

    promises.forEach((resolve,reject) =>{
        Promise.resolve(promises)
        .then((res,index) =>{
            results[index] = res;
            completeCount++;

            if (completeCount === len) {
                resolve(results);
            }
        }).catch(err =>{
            reject(err);
        })
    })
}