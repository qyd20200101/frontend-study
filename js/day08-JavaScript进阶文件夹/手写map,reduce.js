// 手写map:理解回调和新数组返回
//给原型挂载,所有数组实例可直接调用
Array.prototype.myMap = function (callback) {
    // 新建空数组result存储结果,全程不锈钢原数组
    const result = [];
    // this指向调用该方法的数组实例
    for (let i = 0; i < this.length; i++) {
        // 执行回调，传入与原生完全一致的三个参数:当前元素,当前索引,原数组
        result.push(callback(this[i], i, this));
    }
    return result;
};

//手写reduce:理解累加器和初始值
Array.prototype.myReduce = function (callback, initialValue) {
    // 初始累加器和遍历起始索引
    let accumulator = initialValue !== undefined ? initialValue : this[0];
    let startIndex = initialValue !== undefined ? 0 : 1;

    // 边界:空数组且无初始值,抛出与原生一致的错误
    if (this.length === 0 && initialValue === undefined) {
        throw new TypeError('Reduce of empty array with no initial value');
    }
    //从起始索引开始遍历累加
    for (let i = startIndex; i < this.length; i++) {
        // 回调接受四个参数:累加器,当前元素,当前索引,原数组
        //传入initialValue累加器初始化为该值,从索引0开始
        if (i in this) {
            accumulator = callback(accumulator, this[i], i, this);
        }

    }
    return accumulator;
};

// myMap使用示例
//1.基础转换
const nums = [1, 2, 3, 4];
const doubled = nums.myMap(x => x * 2);
console.log(doubled);

//2.thisArg绑定(回调内部this指向指定对象)
const multiplier = { factor: 3 };
const tripled = nums.myMap(function(x)  {
    return x * this.factor;
}, multiplier);

//3.稀疏数组处理
const sparseArr = [1, , 3, , 5];
const mappedSparse = sparseArr.myMap(x => x * 2);
console.log(mappedSparse);

//myReduce使用示例
//1.基础求和
const sum = [1,2,3,4].myReduce((acc,cur) =>acc+cur,0);
console.log(sum);

//2.对象分组
const users = [
    {name: '张三', age: 21},
    {name: '李四', age: 22},
    {name: '王五', age: 23},
    {name: '赵六', age: 24},
];

const groupedByAge = users.myReduce((acc,cur) =>{
    const age = cur.age;
    if (!acc[age]) {
        acc[age] = [];
    }
    acc[age].push(cur);
    return acc;
},{});
console.log(groupedByAge);

//3.用reduce实现map(证明reduce是所有迭代方法的底层)
Array.prototype.reduceMap = function (callback,thisArg) {
    return this.myReduce((acc,cur,index,arr) =>{
        acc.push(callback.call(thisArg,cur,index,arr));
        return acc;
    },[]);
};
console.log([1,2,3].reduceMap(x => x*2));

// 案例3:边界情况验证
//空数组+有初始值->返回初始值
console.log([].myReduce((acc,cur) =>acc+cur,100));

//空数组+无初始值->抛出错误
try {
    [].myReduce((acc,cur) => acc+cur);
} catch (e) {
    console.log(e.message);
}

//全空槽数组+无初始值->抛出错误
try {
    [,,].myReduce((acc,cur) => acc+cur)
} catch (e) {
    console.log(e.message);
}



