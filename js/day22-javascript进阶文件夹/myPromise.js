Promise.myAll = function (promises) {
  //核心：返回一个新的Promise
  return new Promise((resolve, reject) => {
    //如果传入的是不可迭代的对象，直接抛错或返回空
    if (!Array.isArray(promises)) {
      return reject(new TypeError("Argument must be an array"));
    }
    const len = promise.length;
    if (len === 0) {
      return resolve([]);
    }
    let count = 0; //计数器记录有多少个promise成功
    const result = []; //用来顺序存放结果的数组

    //遍历触发所有promise
    for (let i = 0; i < len; i++) {
      //考虑兼容性：用resolve包裹
      Promise.resolve(promises[i])
        .then((res) => {
          result[i] = res;
          count++;
          if (count === len) {
            resolve(result);
          }
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
};
