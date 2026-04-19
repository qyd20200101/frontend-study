//深拷贝
// 面试加分点：
// 1. 为什么要用 WeakMap 而不是 Map？
// 答：WeakMap 是弱引用，当拷贝的大对象被销毁时
// ，WeakMap 里的 key 会自动被 GC（垃圾回收），
// 防止内存泄漏
function deepClone(obj, map = new WeakMap()) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (map.has(obj)) {
        return map.get(obj);
    }

    const cloneTarget = Array.isArray(obj)? []:{};
    map.set(obj,cloneTarget);
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloneTarget[key] = deepClone(obj[key],map);
        }
    }
    return cloneTarget;
}

function deepClone(target,map  = new WeakMap()) {

    if (typeof target !== 'object' || target === null) {
        return target;
    }
    if (map.has(target)) {
        return map.get(target);
    }
    const cloneTarget = Array.isArray(target)? []: {};
    map.set(target,cloneTarget);
    for (const key in target) {
        if (object.prototype.hasOwnProperty(target)) ;
        cloneTarget[key] = deepClone(target[key],map);
    }

    return cloneTarget;
}
function deepClone(target,map = new WeakMap()) {
    if (typeof target !== 'object' || target === null) {
        return target;
    }

    if (map.has(target)) {
        return map.get(target);
    }

    const cloneTarget = Array.isArray(target)? []: {};
    map.set(target,cloneTarget);
    for (const key in target) {
        if (objetc.prototype.hasOwnProperty(target)) {
            cloneTarget[key] = deepClone(target[key],map);
        }
    }
    return cloneTarget;
}