/*
1.闭包经验(防抖)
2.递归与缓存(深拷贝)
3.数组高阶函数重写
*/ 

//1.手写防抖:用于搜索框,减少服务器压力
export function debounce(fn:Function,delay: number = 300) {
    let timer: number | null = null;
    return function (this:any,...args:any[]) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() =>{
            fn.apply(this,args);
        },delay);
    }
}

//2.手写深拷贝:用于编辑表单,支持数据回滚(防止污染原数据)
export function deepClone<T>(target:T,map = new WeakMap()): T {
    if (typeof target !== 'object' || target === null) return target;
    if (map.has(target as object)) return map.get(target as object);

    const cloneTarget: any = Array.isArray(target)? [] : {};
    map.set(target as object, cloneTarget);

    for (const key in target) {
        if (Object.prototype.hasOwnProperty.call(target,key)) {
            cloneTarget[key] = deepClone((target as any)[key],map);
        }
    }
    return cloneTarget;
}

//3.拓展Reduec逻辑(演示底层算法)
export const mySum = (arr:any[],key:string) =>{
    return arr.reduce((acc,cur) =>acc + (Number(cur[key]) || 0),0);
};