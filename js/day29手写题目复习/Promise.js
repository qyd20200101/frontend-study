//全部成功才返回，一失败就停
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) {
      resolve([]);
      return;
    }
    let count = 0;
    const result = [];
    let promiseNum = promises.length;
    promises.forEach((item, index) => {
      //用promise.resolve包裹，兼容普通值
      Promise.resolve(item).then(
        (value) => {
          //按顺序存放
          result[index] = value;
          count++;
          if (count === promises.length) {
            //全部成功才resolve
            resolve(result);
          }
        },
        (reason) => {
          //一个失败就立即reject,不管其他的
          reject(reason);
        },
      );
    });
  });
}
//谁先完成就返回谁
function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) {
      return;
    }

    promises.forEach((item) => {
      Promise.resolve(item).then(
        (value) => resolve(value), //第一个成功就返回成功，不管其他
        (reason) => reject(reason), //第一个失败也返回，不管其他
      );
    });
  });
}
//全部都有，成功失败都记录
function promiseAllSettled(promises) {
  return new Promise((resolve) => {
    if (promises.length === 0) {
      resolve([]);
      return;
    }

    let count = 0;
    const result = [];
    promises.forEach((item, index) => {
      Promise.resolve(item)
        .then(
          (value) => {
            //包一层
            result[index] = { status: "fulfilled", value };
          },
          (reason) => {
            //包一层
            result[index] = { status: "rejected", value };
          },
        )
        .finally(() => {
          count++;
          if (count === promises.length) {
            //全部完成才返回
            resolve(result);
          }
        });
    });
  });
}

function promiseAny(promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) {
      reject(new AggregateError([], "All,promises were rejected"));
      return;
    }
    let count = 0;
    const errors = []; //数组存错误
    promises.forEach((item, index) => {
      Promise.resolve(item).then(
        (value) => {
          //第一个成功就返回
          resolve(value);
        },
        (reason) => {
          //存错误
          errors[index] = reason;
          count++;
          if (count === promises.length) {
            //全部失败才reject
            reject(new AggregateError(errors, "All promises were rejected"));
          }
        },
      );
    });
  });
}

//promise方法的通用框架
function promiseXxx(promises) {
  return new Promise((resolve, reject) => {
    //处理空数组边界
    if (promises.length === 0) {
      //不同方法这里不一样,
      return;
    }

    //初始化变量
    const result = [];
    let count = 0;
    //有些方法还需要errors，数组存错误

    //遍历
    promises.forEach((item, index) => {
      Promise.resolve(item).then(
        (value) => {
          //成功是：不同方法逻辑不同
        },
        (reason) => {
          //失败时：不同方法逻辑不同
        },
      );
    });
  });
}
