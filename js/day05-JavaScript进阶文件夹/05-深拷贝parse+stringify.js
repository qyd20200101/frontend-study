/*
真实场景：
1.后端返回纯数据(无函数/日期/循环引用)的深拷贝
2.本地存储localStorage存取时的转换
3.简单对象/数组的快熟克隆（比如搜索历史的数组拷贝）
缺点：
不能拷贝undefined.function,Symbol
不能处理循环引用
日期，正则会失真
*/ 
//深拷贝——JSON(简单场景)

function deepCloneBySJON(target) {
    // 1.先转化JSON字符串（切断所有引用关系）
    //2.再解析成新的JS对象
    return JSON.parse(JSON.stringify(target));
}

//使用实例
const historyList = ['vue','react'];
const copyList = deepCloneBySJON(historyList);
copyList.push('angular');
console.log(historyList);//['vue','react']原数组不变

//踩坑示例
const obj1 = {
    a:undefined,
    b: function () {},
    c: new Date(),
    d: /abc/
};
const copy = deepCloneBySJON(obj1);
console.log(copy);
//  { c: "2026-04-07T08:00:00.000Z", d: {} } → a、b 直接丢了！
/*
2.深拷贝——WeapMap递归版（完整版，面试必考）
真实使用场景：
1.复杂对象深拷贝（包含函数，日期，循环引用）
2.组件props/state的深拷贝
3.项目中工具类Utils的通用深拷贝方法
*/ 
function deepClone(target, map = new WeakMap()) {
    // 1.基本数据类型和null直接返回（不需要拷贝）
    if (typeof target !== 'object' || target === null) {
        return target;
    }

    /*
    2.核心：解决循环引用
    如果这个对象已经被拷贝过，直接返回缓存的拷贝结果
    防止obj.self = obj这种情况无限递归爆栈
    */ 
    if (map.has(target)) {
        return map.get(target);
    }

    // 3.区分数组和普通对象,创建对应的空容器
    const cloneTarget = Array.isArray(target)? []:{};

    // 4.把当前对象和它的拷贝存入缓存
    map.set(target,cloneTarget);

    //5.递归拷贝所有自有属性
    //for...in会遍历原型链，所以用hasOwnPrototype只拷贝自身属性
    for (let key in target) {
        if (target.hasOwnProperty(key)) {
            cloneTarget[key] = deepClone(target[key],map);
        }
    }
    return cloneTarget;
}

//循环引用测试（JSON版会报错，这个正常）
const obj2 = {name: '前端'};
obj2.self = obj2;//自己引用自己
const newObj = deepClone(obj2);
console.log(newObj);
console.log(newObj.self);
console.log(newObj.self === newObj);//循环引用保留


