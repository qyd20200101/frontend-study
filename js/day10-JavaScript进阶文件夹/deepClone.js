/*
1.WeakMap:为什么不用map，因为weakMap是弱引用，一旦原始对象被销毁，waekmap里的记录也会被垃圾回收,防止内存泄露
2.Reflect.ownkeys：比for...in或object.keys更高级，能获取symbol类型的键名
*/ 
// function deepClone(target, map = new WeakMap()) {
//     //1. 处理基本类型和NUll
//     if (typeof target !== 'object' ||target === 'null') return target;
//     //2.解决循环引用：如果对象已存在于Map中，直接返回不在递归
//     if (map.has(target)) {
//         return map.get(target);
//     }

//     //3.初始化克隆结果（对象或数组）
//     const result = Array.isArray(target) ? [] : {};
//     //4.将当前对象存入WeakMap
//     map.set(target,result);
//     //5.递归拷贝属性
//     //Reflect.ownkeys可以拿到不可枚举属性和Symobl属性
//     Reflect.ownKeys(target).forEach(key =>{
//         result[key] = deepClone(target[key],map);
//     });

//     return result;
// }
//第二遍
// function deepClone(target,map = new WeakMap()) {
//     // 判断基本类型或null
//     if (typeof target !== 'object' || target === null) {
//         return target;
//     }
//     // 解决循环引用：如果对象已存在map中，直接返回不再递归
//     if (map.has(target)) {
//         return map.get(target);
//     }
//     // 初始化克隆结果或对象
//     const result = Array.isArray(target)? [] :{};
//     //将当前对象存入weakmap
//     map.set(target,result);
//     //递归拷贝属性，reflect.ownkeys可以拿到不可枚举属性和Symbo属性
//     Reflect.ownKeys(target).forEach(key =>{
//         result[key] = deepClone(target[key],map);
//     });
//     return result;
// }
//第三遍
// function deepClone(target,map = new WeakMap()) {
//     // 判断基本类型或null
//     if (typeof target !== 'object' || target === null) {
//         return target;
//     }
//     // 解决循环引用：如果对象已存在map中，直接返回不再递归
//     if (map.has(target)) {
//         return map.get(target);忘记返回return
//     }
//     // 初始化克隆结果或对象
//     const result = Array.isArray(target)? [] :{};
//     //将当前对象存入weakmap
//      map.set(target,result);忘记结果result
//     //递归拷贝属性，reflect.ownkeys可以拿到不可枚举属性和Symbo属性
       //缺少参数target
//     Reflect.ownKeys(target).forEach(key => {
//         result[key] = deepClone(target[key],map);
//     });
//     return result;
// }
//第四遍
// function deepClone(target,map = new WeakMap()) {
//     // 判断基本类型或null
//     if (typeof target !== 'object' || target === null) {
//         return target;
//     }
//     // 解决循环引用：如果对象已存在map中，直接返回不再递归
//     if (map.has(target)) {
//         return map.get(target);
//     }
//     // 初始化克隆结果或对象
//     const result = Array.isArray(target)? []: {};
//     //将当前对象存入weakmap
//     map.set(target,result);//将结果result存入map
//     //递归拷贝属性，reflect.ownkeys可以拿到不可枚举属性和Symbo属性
//缺少参数taregt
//     Reflect.ownKeys(target).forEach(key => {
//         result[key] = deepClone(target[key] ,map)
//     });
//     return result;
// }
//第五遍
// function deepClone(target, map = new WeakMap()) {
//     // 判断基本类型或null
//     if (typeof target !== 'object' || target === null) {
//         return target;
//     }
//     // 解决循环引用：如果对象已存在map中，直接返回不再递归
//     if (map.has(target)) {
//         // 只传入target一个参数
//         return map.get(target);
//     }
//     // 初始化克隆结果或对象
//     const result = Array.isArray(target)? []: {};
//     //将当前对象存入weakmap
//     map.set(target,result);
//     //递归拷贝属性，reflect.ownkeys可以拿到不可枚举属性和Symbo属性
//    Reflect.ownKeys(target).forEach(key =>{
//     result[key] = deepClone(target[key],map);
//    })
//    return result;
// }
function deepClone(target ,map = new WeakMap()) {
    if (target !== 'object' || target ===null) {
        return target;
    }
    if (map.has(target)) {
        return map.set(target);
    }

    const result = Array.isArray(target)? []:{};
    map.set(target,result);
    
    Reflect.ownKeys(target).forEach(key =>{
        result[key]= deepClone(target[key],map)
    })
    return result;
}
function deepClone(target,map = new WeakMap()) {
    if (target !== 'object' ||target === null) {
        return target;
    }

    if (map.has(target)) {
        return map.get(target);
    }

    const result = Array.isArray(target)? [] : {};

    map.set(target,result);

    Reflect.ownKeys.forEach(key =>{
        result[key] = deepClone(target[key] ,map);
    })
}