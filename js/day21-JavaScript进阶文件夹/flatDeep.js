//纯reduce递归
function flatDeep(arr, depth = Infinity) {
    //边界处理1：输入不是数组-》抛出TypeError
    if (!Array.isArray(arr)) throw new TypeError("Input must be an array");
    //边界处理2：输入是空数组->直接返回空数组
    if (arr.length === 0) return [];
    //边界处理3：depth 为0->直接返回原数组浅拷贝
    if (depth <= 0) return [...arr];

    return arr.reduce((arr, cur) => {
        //边界处理4：当前元素是数组且depth > 0递归展开
        return arr.concat(Array.isArray(cur) ? flatDeep(cur, depth - 1) : cur);
    }, []); //必须给初始值，否则第一个元素会直接作为acc
}

//测试边界
console.log(flatDeep([]));
console.log(flatDeep([1, [2, 3, [4]]], 2));
try {
    flatDeep('not array');
} catch (error) {
    console.log(error.message);
}

//需求：把二位数组的每个数字*2，再展开为一维
const arr = [
    [1, 2],
    [3, 4]
];
const result = arr.flatMap(subArr => subArr.map(num => num * 2));
console.log(result);

const evens = [];
arr.forEach(subArr => subArr.forEach(num => num % 2 === 0 && evens.push(num)));
console.log(evens);

//手写深拷贝
function deepClone(target, map = new WeakMap()) {
    //边界处理1：基本类型/function 直接返回(function不需要深拷贝，引用即可)
    if (typeof target !== 'object' || target === null) {
        return target;
    }
    if (map.has(target)) {
        return map.get(target);
    }
    let targetClone;
    //特殊引用类型
    const type = Object.prototype.toString.call(target);
    switch (type) {
        case '[object Date]':
            targetClone = new Date(target.getTime());
            break;
        case '[object RegExp]':
            targetClone = new RegExp(target.source, target.flags);
            targetClone.lastIndex = target.lastIndex; //必须复制lastIndex,否则正则匹配状态会丢失
            break;
        case '[object Map]':
            targetClone = new Map();
            target.forEach((value, key) => targetClone.set(deepClone(key, map), deepClone(value, map)));
            break;
        case '[object Set]':
            targetClone = new Set();
            target.forEach(item => targetClone.add(deepClone(item, map)));
            break;
        case '[object Array]':
            targetClone = [];
            break;
        case '[object Object]':
            //边界处理：继承原型链的对象，用Object.create继承原型
            targetClone = Object.create(Object.getPrototypeOf(target));
            break;
        default:
            //其他特殊类型
            return target;
    }

    //存储已克隆的对象到WeakMap,防止循环引用
    map.set(target, targetClone);
    //遍历普通对象/数组的属性,递归克隆
    for (const key in target) {
        if (Object.prototype.hasOwnProperty.call(target, key))
            targetClone[key] = deepClone(target[key], map);
    }
    return targetClone;

}

// 测试循环引用
const obj = { a: 1 };
obj.self = obj;
const clonedObj = deepClone(obj);
console.log(clonedObj.self === clonedObj); // true（循环引用正确复制）
console.log(clonedObj === obj); // false（不是同一个对象）

// 测试特殊类型
const testObj = {
    date: new Date(),
    regexp: /test/gi,
    set: new Set([1, 2, { a: 3 }]),
    map: new Map([
        ['key', { b: 4 }]
    ]),
    arr: [1, [2, 3]],
    protoObj: Object.create({ protoProp: 5 })
};
testObj.protoObj.ownProp = 6;
const clonedTestObj = deepClone(testObj);
console.log(clonedTestObj.date.getTime() === testObj.date.getTime()); // true
console.log(clonedTestObj.regexp.source === testObj.regexp.source); // true
console.log(clonedTestObj.regexp.flags === testObj.regexp.flags); // true
console.log(clonedTestObj.set.has(1)); // true
console.log(clonedTestObj.map.get('key').b === 4); // true
console.log(clonedTestObj.protoObj.protoProp === 5); // true（原型链正确继承）
console.log(clonedTestObj.protoObj.ownProp === 6); // true（自身属性正确克隆）