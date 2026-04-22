function myPromise(promises) {
    return new Promise((resolve,reject) =>{
        let result = [];
        let count = 0;
        promises.forEach((p,index) => {
            Promise.resolve(p)
            .then(res =>{
                result[index] = res;
                count ++;
                if (count === promises.length) 
                    resolve(result);
            }).catch(reject);
        });
    })
}