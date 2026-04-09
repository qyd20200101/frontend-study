//手写myInstanceof
//instanceOf本质是原型链查找,判断构造函数的prototype是否在对象的原型链上
//不能判断基础数据类型,null,用于判断引用类型实例
function myInstanceof(left,right) {
    // 1.基础类型/null直接返回false,因为instanceof只判断引用类型
    if (typeof left !== 'object'&& left === null) return false;

    //2.获取目标对象的隐式原型
    let proto = Object.getPrototypeOf(left);

    //3.循环向上查找原型链
    while (true) {
        // 查到原型链顶端,未找到返回false
        if (proto === null) return false;
        if (proto === right.prototype) return true;
        // 继续向上查找
        proto = Object.getPrototypeOf(proto);
    }
}

/*
2.手写数组去重unique基础版
核心解析:利用includes判断重复/Set数据结构唯一性去重
面试点:Set能正确去重NaN,
*/ 
function unique(arr) {
    const res = [];
    for (let item of arr) {
        // 结果数组中不存在当前项,才推入
        //
        if (!res.includes(item)) {
            res.push(item);
        }
    }
    return res;
}

// Set去重
function uniqueSet(arr) {
    // Set自动去重,再展开为数组
    return [...new Set(arr)];
}