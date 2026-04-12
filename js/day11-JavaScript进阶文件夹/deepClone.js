/*
工业级深拷贝：处理循环引用&各种类型
*/ 

// function deepClone(target, map = new WeakMap()) {
//     // 1.基本数据类型及null
//     if ( typeof target !== 'object' || target === null) {
//         return target;
//     }

//     //2.特殊对象处理(Dtae,RegExp)
//     if (target instanceof Date) return new Date(target);
//     if (target instanceof RegExp) return new RegExp(target);

//     //3.解决循环引用，查缓存
//     if (map.has(target)) {
//         return map.get(target);
//     }

//     //4.初始容器
//     const cloneTarget = Array.isArray(target)? []: {};

//     //5.存入缓存（注意：要在递归前存，否则循环引用会死循环）
//     map.set(target,cloneTarget);

//     //6.递归处理属性（使用Reflect确保Symbol也能被拷贝）
//     Reflect.ownKeys(target).forEach(key =>{
//         cloneTarget[key] = deepClone(target[key],map);
//     });

//     return cloneTarget;
// }

// function deepClone(target, map = new WeakMap()) {
//     // 1.基本数据类型及null(typeof判断object)
//     if (typeof target !== 'object' || target === null ) {
//         return target;
//     }
//     //2.特殊对象处理(Dtae,RegExp)
//     if (target instanceof Date) return new Date(target); 
//     if (target instanceof RegExp) return new RegExp(target); 
//     //3.解决循环引用，查缓存(先看map里面有没有属性,返回获取属性)
//     if (map.has(target)) {
//         return map.get(target);
//     }

//     //4.初始容器
//     const cloneTarget = Array.isArray(target)? [] :{};
//     //5.存入缓存（注意：要在递归前存，否则循环引用会死循环）
//     map.set(target,cloneTarget);
//     //6.递归处理属性（使用Reflect确保Symbol也能被拷贝）
//     Reflect.ownKeys(target).forEach(key => {
//         cloneTarget[key] = deepClone(target[key],map);
//     });
//      return cloneTarget;
// }

// function deepClone(target, map = new WeakMap()) {
//     // 1.基本数据类型及null
//     if (typeof target !== 'object' || target === null) {
//         return target;
//     }
//      //2.特殊对象处理(Dtae,RegExp)
//      if (target instanceof Date) return new Date(target); 
//      if (target instanceof RegExp) return new RegExp(target); 
//      //3.解决循环引用，查缓存
//      if (map.has(target)) {
//         return map.get(target);
//      }
//      //4.初始容器
//      const cloneTarget = Array.isArray(target)? [] :{};
//      //5.存入缓存（注意：要在递归前存，否则循环引用会死循环）
//      map.set(target,cloneTarget);
//      //6.递归处理属性（使用Reflect确保Symbol也能被拷贝）
//      Reflect.ownKeys(target).forEach(key =>{
//         cloneTarget[key] = deepClone(target[key],map);
//      })
//      return cloneTarget;
// }

function deepClone(target ,map = new WeakMap()) {
    // 1.基本数据类型及null
    if (typeof target !== 'object' || target === null) {
        return target;
    }
     //2.特殊对象处理(Dtae,RegExp)
     if (target instanceof Date) return Date(target); 
     if (target instanceof RegExp) return RegExp(target); 
     //3.解决循环引用，查缓存
     if (map.has(target)) {
        return map.get(target);
     }
     //4.初始容器
     const cloneTarget = Array.isArray(target)? []:{};
     //5.存入缓存（注意：要在递归前存，否则循环引用会死循环）
     map.set(target,cloneTarget);
     //6.递归处理属性（使用Reflect确保Symbol也能被拷贝）
     Reflect.ownKeys(target).forEach(key =>{
        cloneTarget[key] = deepClone(target[key], map);
     })

     return cloneTarget;
}